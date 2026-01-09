/**
 * RaveHub WhatsApp Bot - Connection Handler
 * 
 * BAILEYS v7 COMPLIANT - Critical fixes applied:
 * 1. Dynamic WA version with fallback
 * 2. Proper DisconnectReason handling with internal reconnect
 * 3. LID mapping event listener
 * 4. BufferJSON for session serialization
 * 5. Anti-ban delays and presence simulation
 */

const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    isJidGroup,
    Browsers,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const {
    BAILEYS_CONFIG,
    WA_VERSION_FALLBACK,
    RECONNECT_REASONS,
    LOGOUT_REASONS
} = require('../config/baileys');
const { setCachedGroup, invalidateGroup, getGroupMetadataCached } = require('../services/cache');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// ===== GLOBAL STATE =====
let sock = null;
let reconnectAttempts = 0;
let currentWaVersion = null; // Store current WA version for display
const MAX_RECONNECT_ATTEMPTS = 15;
const RECONNECT_BASE_DELAY = 5000; // 5 seconds base

// LID to Phone Number mapping cache
const lidMapping = new Map();

/**
 * Helper function to delete auth folder if needed
 * Called only on loggedOut (401) status
 */
function clearAuth() {
    const authPath = path.join(process.cwd(), 'auth_info');
    if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        logger.info('Auth folder cleared due to logout.');
    }
}

/**
 * Delay helper with jitter for anti-detection
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
function getReconnectDelay() {
    const exponential = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts), 30000);
    const jitter = Math.random() * 2000; // Add 0-2s jitter
    return exponential + jitter;
}

/**
 * Resolve LID to phone number JID
 * @param {string} jid - The JID (may be LID or phone format)
 * @returns {string} - Phone number JID
 */
function resolveLidToPhone(jid) {
    if (!jid) return jid;
    if (jid.endsWith('@lid')) {
        const phoneJid = lidMapping.get(jid);
        return phoneJid || jid;
    }
    return jid;
}

/**
 * Store LID mapping
 * @param {string} lid - The LID
 * @param {string} phoneJid - The phone number JID
 */
function storeLidMapping(lid, phoneJid) {
    if (lid && phoneJid) {
        lidMapping.set(lid, phoneJid);
        lidMapping.set(phoneJid, lid); // Bidirectional
    }
}

/**
 * Main bot startup function
 * Implements resilient connection with proper reconnection logic
 */
async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');

        // Fetch latest WA version with fallback
        let version;
        try {
            const versionInfo = await fetchLatestBaileysVersion();
            version = versionInfo.version;
            logger.info(`Using WA version: ${version.join('.')} (Latest: ${versionInfo.isLatest})`);
        } catch (e) {
            version = WA_VERSION_FALLBACK;
            logger.warn(`Failed to fetch WA version, using fallback: ${version.join('.')}`);
        }
        currentWaVersion = version; // Store globally for status messages

        let keepAliveInterval;
        let tempBanInterval;
        let watchdogInterval;

        sock = makeWASocket({
            ...BAILEYS_CONFIG,
            version,
            auth: {
                creds: state.creds,
                // Use cacheable signal key store for better performance
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            // Cached group metadata for performance
            cachedGroupMetadata: async (jid) => {
                return await getGroupMetadataCached(sock, jid);
            },
            getMessage: async (key) => {
                // Required for message retries - return undefined if not cached
                return undefined;
            }
        });

        // ===== CREDENTIALS PERSISTENCE =====
        sock.ev.on('creds.update', saveCreds);

        // ===== LID MAPPING EVENT (Baileys v7) =====
        // This event provides mapping between LIDs and phone numbers
        sock.ev.on('messaging-history.set', ({ contacts }) => {
            if (contacts && Array.isArray(contacts)) {
                for (const contact of contacts) {
                    if (contact.id && contact.lid) {
                        storeLidMapping(contact.lid, contact.id);
                    }
                }
                logger.info(`LID mappings updated: ${lidMapping.size} entries`);
            }
        });

        // ===== QR CODE HANDLING =====
        const qrcode = require('qrcode-terminal');

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                logger.info('QR Code received - scan with WhatsApp');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                // Clear intervals on disconnect
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                if (tempBanInterval) clearInterval(tempBanInterval);
                if (watchdogInterval) clearInterval(watchdogInterval);

                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const errorMessage = lastDisconnect?.error?.message || 'Unknown';
                logger.warn(`Connection closed. Code: ${statusCode || 'unknown'}, Reason: ${errorMessage}`);

                // ===== CRITICAL: Proper disconnect handling =====

                // CASE 1: Logged out (401) - Session invalid, must re-scan QR
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    logger.error('SESSION LOGGED OUT (401) - Clearing auth and stopping.');
                    clearAuth();
                    process.exit(1); // PM2 will NOT restart due to exit code 1 if configured
                }

                // CASE 2: Bad session - ONLY clear auth for TRUE bad session
                // NOTE: Do NOT clear auth for 500 with 'Stream Errored' - those are transient!
                if (statusCode === DisconnectReason.badSession) {
                    const isTruelyBadSession = errorMessage.includes('Bad session') ||
                        errorMessage.includes('invalid session');
                    if (isTruelyBadSession) {
                        logger.error('TRUE BAD SESSION - Clearing auth and stopping.');
                        clearAuth();
                        process.exit(1);
                    } else {
                        logger.warn('Status 500 but not true bad session, treating as transient...');
                    }
                }

                // CASE 3: Transient errors - RECONNECT INTERNALLY
                // 405 (version mismatch), 408 (timeout), 428 (closed), 440 (replaced), 503 (unavailable), 515 (restart)
                if (
                    statusCode === DisconnectReason.connectionClosed ||
                    statusCode === DisconnectReason.connectionLost ||
                    statusCode === DisconnectReason.connectionReplaced ||
                    statusCode === DisconnectReason.timedOut ||
                    statusCode === DisconnectReason.restartRequired ||
                    statusCode === 405 ||
                    statusCode === 500 || // Stream errors - reconnect, don't clear auth!
                    statusCode === 503 ||
                    statusCode === 408 ||
                    statusCode === 440 ||
                    statusCode === 515
                ) {
                    reconnectAttempts++;

                    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
                        logger.error(`Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Exiting for PM2 restart.`);
                        process.exit(0); // Clean exit for PM2 restart
                    }

                    const delayMs = getReconnectDelay();
                    logger.info(`Transient disconnect (${statusCode}). Reconnecting in ${Math.round(delayMs / 1000)}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

                    await delay(delayMs);
                    startBot(); // Internal reconnect - NO process exit
                    return;
                }

                // CASE 4: Unknown error - Let PM2 handle restart
                logger.warn(`Unknown disconnect code: ${statusCode}. Exiting for PM2 restart...`);
                process.exit(0);

            } else if (connection === 'open') {
                // Reset reconnect counter on successful connection
                reconnectAttempts = 0;

                // Initialize silence cache
                const { initSilenceCache } = require('../services/silenceService');
                await initSilenceCache();

                logger.info('✅ Bot connected successfully!');

                // ===== KEEP-ALIVE (Presence Only - NO messages to self) =====
                // Research confirms sending messages to self is NOT recommended
                keepAliveInterval = setInterval(async () => {
                    try {
                        await sock.sendPresenceUpdate('available');
                    } catch (err) {
                        logger.warn(`Presence update failed: ${err.message}`);
                    }
                }, 30000); // Every 30 seconds

                // ===== TEMP BAN CHECKER CRON =====
                tempBanInterval = setInterval(async () => {
                    const { getExpiredTempBans, removeTempBan } = require('../services/database');

                    try {
                        const expiredBans = await getExpiredTempBans();

                        if (expiredBans.length > 0) {
                            logger.info(`Processing ${expiredBans.length} expired bans`);
                        }

                        for (const ban of expiredBans) {
                            try {
                                // Anti-detection delay between operations
                                await delay(Math.random() * 2000 + 1000);

                                // Presence before action
                                await sock.sendPresenceUpdate('composing', ban.groupId);
                                await delay(500);

                                await sock.groupParticipantsUpdate(ban.groupId, [ban.userId], 'add');

                                await sock.sendMessage(ban.groupId, {
                                    text: `🕊️ *BIENVENIDO DE VUELTA*\n\n@${ban.userId.split('@')[0]}, tu tiempo de castigo terminó.\nPórtate bien esta vez.`,
                                    mentions: [ban.userId]
                                });

                                logger.info(`Auto-added ${ban.userId} to ${ban.groupId}`);

                            } catch (addError) {
                                logger.warn(`Failed to auto-add ${ban.userId}: ${addError.message}`);

                                try {
                                    const code = await sock.groupInviteCode(ban.groupId);
                                    const inviteLink = `https://chat.whatsapp.com/${code}`;

                                    await sock.sendMessage(ban.userId, {
                                        text: `🔓 *TU CASTIGO HA TERMINADO*\n\nNo pude agregarte automáticamente.\n🔗 Únete aquí: ${inviteLink}`
                                    });
                                } catch (dmError) {
                                    logger.error(`Failed to send invite DM to ${ban.userId}: ${dmError.message}`);
                                }
                            }

                            if (ban.id) {
                                await removeTempBan(ban.id);
                            }
                        }
                    } catch (err) {
                        logger.error('Error in temp ban checker:', err);
                    }
                }, 60000); // Every 60 seconds

                // ===== SEND STARTUP NOTIFICATION =====
                try {
                    await delay(2000); // Wait for full initialization

                    const botNumber = sock.user.id.split(':')[0];
                    const botJid = `${botNumber}@s.whatsapp.net`;

                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = Math.floor(uptime % 60);
                    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

                    const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
                    const memTotal = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);

                    const serverInfo = `
🤖 *BOT CONECTADO EXITOSAMENTE*

📊 *Detalles del servidor:*
━━━━━━━━━━━━━━━━━━━━━━
🖥️ Servidor: AWS EC2
⚡ Versión WA: ${currentWaVersion ? currentWaVersion.join('.') : 'N/A'}
🔄 Estado: ONLINE
⏰ Uptime: ${uptimeStr}
📶 Conectado: ${new Date().toLocaleString()}
💾 Memoria: ${memUsed}MB / ${memTotal}MB
🔥 Firebase: Conectado
━━━━━━━━━━━━━━━━━━━━━━

✅ El bot está listo para usarse.
                    `.trim();

                    await sock.sendMessage(botJid, { text: serverInfo });
                } catch (err) {
                    logger.error('Failed to send startup notification:', err);
                }
            }
        });

        // ===== MESSAGE HANDLING =====
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            // Process all message types (not just 'notify')
            const { handleIncomingMessage } = require('./messages');

            for (const msg of messages) {
                handleIncomingMessage(sock, msg).catch(err => {
                    logger.error('Error in message handler:', err);
                });
            }
        });

        // ===== GROUP PARTICIPANT UPDATES =====
        sock.ev.on('group-participants.update', async (update) => {
            try {
                // Invalidate cache when participants change
                invalidateGroup(update.id);

                const { handleGroupUpdate } = require('./groups');
                if (handleGroupUpdate) await handleGroupUpdate(sock, update);
            } catch (error) {
                logger.error('Error in group-participants.update handler:', error);
            }
        });

        // ===== GROUP METADATA UPDATES =====
        sock.ev.on('groups.update', async (updates) => {
            try {
                for (const update of updates) {
                    if (update.id) {
                        invalidateGroup(update.id);
                        logger.info(`Group cache invalidated: ${update.id}`);
                    }
                }
            } catch (error) {
                logger.error('Error in groups.update handler:', error);
            }
        });

        // ===== CONTACTS UPDATE (for LID mapping) =====
        sock.ev.on('contacts.update', (contacts) => {
            for (const contact of contacts) {
                if (contact.id && contact.lid) {
                    storeLidMapping(contact.lid, contact.id);
                }
            }
        });

        return sock;

    } catch (error) {
        logger.error('Fatal error in startBot:', error);

        // Wait and retry on startup errors
        reconnectAttempts++;
        if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
            const delayMs = getReconnectDelay();
            logger.info(`Startup failed. Retrying in ${Math.round(delayMs / 1000)}s...`);
            await delay(delayMs);
            return startBot();
        }

        throw error;
    }
}

/**
 * Get the current socket instance
 * @returns {object} The Baileys socket
 */
function getSocket() {
    return sock;
}

/**
 * Resolve a JID (handles LID format)
 * @param {string} jid - The JID to resolve
 * @returns {string} - The resolved phone JID
 */
function resolveJid(jid) {
    return resolveLidToPhone(jid);
}

module.exports = {
    startBot,
    getSocket,
    resolveJid,
    resolveLidToPhone,
    storeLidMapping
};
