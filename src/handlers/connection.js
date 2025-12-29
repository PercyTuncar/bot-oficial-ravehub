const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { BAILEYS_CONFIG } = require('../config/baileys');
const { setCachedGroup, invalidateGroup, getGroupMetadataCached } = require('../services/cache');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Helper function to delete auth folder if needed
function clearAuth() {
    const authPath = path.join(process.cwd(), 'auth_info');
    if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        logger.info('Auth folder cleared.');
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    logger.info(`Using WA v${version.join('.')} (Latest: ${isLatest})`);

    let keepAliveInterval;
    let tempBanInterval;

    const sock = makeWASocket({
        ...BAILEYS_CONFIG,
        version,
        auth: state,
        // Cached group metadata for performance
        cachedGroupMetadata: async (jid) => {
            return await getGroupMetadataCached(sock, jid);
        },
        getMessage: async (key) => {
            return undefined;
        }
    });

    sock.ev.on('creds.update', saveCreds);

    const qrcode = require('qrcode-terminal');

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            logger.info('QR Code received, scan it!');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            if (tempBanInterval) clearInterval(tempBanInterval);

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                logger.warn(`Connection closed due to ${lastDisconnect?.error}, reconnecting...`);
                // Let PM2 handle the restart by exiting with success code (or failure if you prefer)
                // We use code 0 or 1. If we want PM2 to restart immediately according to its policy, exiting is best.
                // However, we must ensure we don't loop too fast if there's a permanent error.
                process.exit(0);
            } else {
                logger.error('Logged out. Please delete auth_info and scan QR again.');
                // For logged out, we might want to stop or just exit. 
                // If we exit, it loops unless we delete credentials.
                // We'll exit and let the robust startup handle it or stay down if configured.
                // Better to just delete the session here if we are sure.

                // Optional: automatically clear auth
                // const path = require('path');
                // const fs = require('fs');
                // fs.rmSync(path.join(process.cwd(), 'auth_info'), { recursive: true, force: true });
                process.exit(1);
            }
        } else if (connection === 'open') {
            const { initSilenceCache } = require('../services/silenceService');
            await initSilenceCache();

            logger.info('Bot connected successfully!');

            // LEVANTER-STYLE STABILITY: Keep-Alive Interval
            // Sends a presence update every 30s to prevent silent timeouts
            keepAliveInterval = setInterval(async () => {
                await sock.sendPresenceUpdate('available').catch(() => { });
            }, 30000);

            // TEMP BAN CHECKER CRON JOB
            tempBanInterval = setInterval(async () => {
                const { getExpiredTempBans, removeTempBan } = require('../services/database');

                try {
                    const expiredBans = await getExpiredTempBans();

                    if (expiredBans.length > 0) {
                        logger.info(`Checking expired bans: found ${expiredBans.length}`);
                    }

                    for (const ban of expiredBans) {
                        logger.info(`Processing expired ban for ${ban.userId} in ${ban.groupId}`);

                        try {
                            // Try to add user directly
                            await sock.groupParticipantsUpdate(ban.groupId, [ban.userId], 'add');

                            // Send welcome back message
                            await sock.sendMessage(ban.groupId, {
                                text: `🤡 *¿OTRA VEZ TÚ?*\n\nMira quién volvió...*\n\n 🕊️ Bienvenido de vuelta @${ban.userId.split('@')[0]}.\nTu tiempo de castigo ha terminado. Pórtate bien esta vez.`,
                                mentions: [ban.userId]
                            });

                            logger.info(`Successfully auto-added ${ban.userId} to ${ban.groupId}`);

                        } catch (addError) {
                            logger.warn(`Failed to auto-add ${ban.userId} (Privacy/Perms): ${addError.message}`);

                            try {
                                // If add failed (privacy), send invite link via DM
                                const code = await sock.groupInviteCode(ban.groupId);
                                const inviteLink = `https://chat.whatsapp.com/${code}`;

                                await sock.sendMessage(ban.userId, {
                                    text: `🔓 *TU CASTIGO HA TERMINADO*\n\nHola, ya puedes volver al grupo.\n\n⚠️ No pude agregarte automáticamente debido a tu configuración de privacidad.\n\n🔗 Únete aquí: ${inviteLink}`
                                });
                            } catch (dmError) {
                                logger.error(`Failed to send invite DM to ${ban.userId}: ${dmError.message}`);
                            }
                        }

                        // Always remove the temp ban record after processing attempt
                        if (ban.id) {
                            await removeTempBan(ban.id);
                        }
                    }
                } catch (err) {
                    logger.error('Error in temp ban checker:', err);
                }
            }, 60000); // Check every 60 seconds

            const botNumber = sock.user.id.split(':')[0];
            const jid = `${botNumber}@s.whatsapp.net`;

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
🖥️ Servidor: AWS EC2 (us-east-1)
⚡ Proceso: PM2
🔄 Estado: ONLINE
⏰ Uptime: ${uptimeStr}
📶 Conectado: ${new Date().toLocaleString()}
💾 Memoria: ${memUsed}MB / ${memTotal}MB
🔥 Firebase: Conectado
━━━━━━━━━━━━━━━━━━━━━━

✅ El bot está listo para usarse.
Usa .listgroups para ver grupos disponibles.
            `.trim();

            try {
                await sock.sendMessage(jid, { text: serverInfo });
            } catch (err) {
                logger.error('Failed to send welcome DM to self:', err);
            }
        }
    });

    // Handle messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const { handleIncomingMessage } = require('./messages');
        for (const msg of messages) {
            await handleIncomingMessage(sock, msg);
        }
    });

    // Handle group participant updates (welcome/farewell) and cache invalidation
    sock.ev.on('group-participants.update', async (update) => {
        // Invalidate cache when participants change
        invalidateGroup(update.id);

        const { handleGroupUpdate } = require('./groups');
        if (handleGroupUpdate) await handleGroupUpdate(sock, update);
    });

    // Handle group metadata updates (name changes, settings, etc.)
    sock.ev.on('groups.update', async (updates) => {
        for (const update of updates) {
            if (update.id) {
                // Invalidate cache to force refresh
                invalidateGroup(update.id);
                logger.info(`Group cache invalidated: ${update.id}`);
            }
        }
    });

    return sock;
}

module.exports = { startBot };
