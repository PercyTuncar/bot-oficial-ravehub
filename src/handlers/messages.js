/**
 * RaveHub WhatsApp Bot - Message Handler
 * 
 * ANTI-BAN COMPLIANT:
 * 1. Random delays (jitter) before responses
 * 2. Presence simulation (typing indicator)
 * 3. Self-loop protection
 * 4. Contact interaction tracking
 * 5. Rate limiting
 */

const { getCommand } = require('../commands');
const {
    getUser, createUser, updateUser,
    getMember, createMember, updateMember, logMessage, getOrCreateMember,
    getGroup, getPremiumUsers
} = require('../services/database');
const { processMessageEconomy } = require('../services/economy');
const { checkLevelChange } = require('../services/levels');
const { getPermissionLevel, LEVELS } = require('../services/permissions');
const { getGroupMetadataCached } = require('../services/cache');
const logger = require('../utils/logger');
require('dotenv').config();

const PREFIX = process.env.BOT_PREFIX || '.';

// ===== ANTI-BAN: Message deduplication cache =====
const processedMessages = new Set();

// ===== ANTI-BAN: Contact interaction tracking =====
// Tracks JIDs that have messaged the bot first (never initiate to unknown contacts)
const knownContacts = new Set();

function cleanupProcessedMessages() {
    if (processedMessages.size > 1000) {
        processedMessages.clear();
    }
}

// Cleanup known contacts periodically (keep last 10000)
function cleanupKnownContacts() {
    if (knownContacts.size > 10000) {
        const entries = Array.from(knownContacts);
        knownContacts.clear();
        // Keep last 5000
        entries.slice(-5000).forEach(jid => knownContacts.add(jid));
    }
}

const { extractMessageText, extractMentions } = require('../utils/textUtils');

/**
 * ANTI-BAN: Random delay with jitter
 * Simulates human typing time
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ANTI-BAN: Get random delay between min and max ms
 */
function getRandomDelay(min = 1000, max = 3000) {
    return Math.random() * (max - min) + min;
}

/**
 * ANTI-BAN: Send presence update before responding
 * @param {object} sock - Baileys socket
 * @param {string} jid - Target JID
 * @param {string} presence - Presence type ('composing', 'recording', 'available')
 */
async function simulateTyping(sock, jid, presence = 'composing') {
    try {
        await sock.sendPresenceUpdate(presence, jid);
    } catch (e) {
        // Ignore presence errors
    }
}

/**
 * ANTI-BAN: Safe message sender with delay and presence
 * @param {object} sock - Baileys socket
 * @param {string} jid - Target JID
 * @param {object} content - Message content
 * @param {object} options - Send options
 */
async function safeSendMessage(sock, jid, content, options = {}) {
    try {
        // 1. Send typing indicator
        await simulateTyping(sock, jid, 'composing');
        
        // 2. Random delay (1-3 seconds) to simulate human typing
        await delay(getRandomDelay(1000, 2500));
        
        // 3. Stop typing
        await simulateTyping(sock, jid, 'paused');
        
        // 4. Small delay before sending
        await delay(getRandomDelay(200, 500));
        
        // 5. Send message
        return await sock.sendMessage(jid, content, options);
    } catch (error) {
        logger.error(`safeSendMessage error: ${error.message}`);
        throw error;
    }
}

async function handleIncomingMessage(sock, msg) {
    const handlerStart = Date.now();

    try {
        if (!msg.message) return;

        // ===== DEDUPLICATION CHECK =====
        const msgId = msg.key.id;
        if (processedMessages.has(msgId)) {
            return;
        }
        processedMessages.add(msgId);
        cleanupProcessedMessages();

        // ===== Extract text =====
        const text = extractMessageText(msg).trim();

        // ===== ANTI-BAN: Self-loop protection =====
        // Never respond to own messages unless it's a command
        if (msg.key.fromMe && !text.startsWith(PREFIX)) {
            return;
        }

        const remoteJid = msg.key.remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');

        // Skip status broadcasts
        if (remoteJid === 'status@broadcast') return;

        const userId = msg.key.participant || remoteJid;
        const groupId = isGroup ? remoteJid : null;

        // ===== ANTI-BAN: Track known contacts =====
        // Only respond to contacts that have messaged first
        if (!isGroup && !msg.key.fromMe) {
            knownContacts.add(userId);
        }
        cleanupKnownContacts();

        // ===== Rate Limit Check =====
        const { checkRateLimit } = require('../middleware/ratelimit');
        if (!checkRateLimit(userId)) {
            return;
        }

        // ===== Group validation =====
        let currentGroup = null;
        if (isGroup) {
            currentGroup = await getGroup(remoteJid);
            if (!currentGroup || !currentGroup.active) return;

            // ===== SILENCE CHECK (In-Memory) =====
            const { isSilenced } = require('../services/silenceService');
            if (isSilenced(remoteJid, userId)) {
                try {
                    await sock.sendMessage(remoteJid, { delete: msg.key });
                } catch (e) {
                    // Ignore delete errors
                }
                return;
            }
        }

        // ===== ANTILINK CHECK =====
        const { checkAntilink } = require('../middleware/antilink');
        if (isGroup && await checkAntilink(sock, msg, text, currentGroup, userId, isGroup)) {
            return;
        }

        // ===== ANTIWORDS CHECK =====
        const { checkAntiwords } = require('../middleware/antiwords');
        if (isGroup && await checkAntiwords(sock, msg, text, currentGroup, userId, isGroup)) {
            return;
        }

        // ===== COMMAND DETECTION =====
        const isCommand = text.startsWith(PREFIX);

        // ===== COMMAND EXECUTION =====
        if (isCommand) {
            const args = text.slice(PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = getCommand(commandName);

            if (command) {
                const [groupMetadata, premiumList] = await Promise.all([
                    isGroup ? getGroupMetadataCached(sock, remoteJid) : Promise.resolve(null),
                    isGroup ? getPremiumUsers(remoteJid) : Promise.resolve([])
                ]);

                const isPremium = premiumList.includes(userId);
                const userLevel = await getPermissionLevel(msg.key, groupMetadata, isPremium);

                logger.debug(`Command '${commandName}' | User: ${userId} | Level: ${userLevel}/${command.requiredLevel}`);

                if (command.requiredLevel > userLevel) {
                    // ANTI-BAN: Use safe sender with delay
                    await safeSendMessage(sock, remoteJid, { 
                        text: '❌ No tienes permiso para este comando.' 
                    }, { quoted: msg });
                    return;
                }

                // Execute command with enhanced context
                await command.execute(sock, msg, args, {
                    user: userId,
                    group: groupId,
                    groupId: groupId,
                    text,
                    isGroup,
                    groupMetadata,
                    // Provide safe sender to commands
                    safeSend: (content, opts) => safeSendMessage(sock, remoteJid, content, { ...opts, quoted: msg }),
                    simulateTyping: () => simulateTyping(sock, remoteJid),
                    delay
                });

                logger.debug(`Command '${commandName}' completed in ${Date.now() - handlerStart}ms`);
                return;
            }
        }

        // ===== NON-COMMAND MESSAGES: Process stats/economy in background =====
        if (isGroup) {
            processBackgroundTasks(groupId, userId, text, msg, sock).catch(err => {
                logger.error('Background task error:', err);
            });
        }

    } catch (error) {
        logger.error('Error handling message:', error);
    }
}

/**
 * Process non-critical background tasks per-group
 */
async function processBackgroundTasks(groupId, userId, text, msg, sock) {
    try {
        // Get or create member in this group
        let member = await getMember(groupId, userId);

        if (!member) {
            // Create member in this group
            member = await createMember(groupId, userId, { name: msg.pushName });
        }

        // Calculate active days
        const today = new Date().toDateString();
        const lastMessageDate = member.lastMessage?.toDate ? member.lastMessage.toDate().toDateString() : null;
        const isNewDay = lastMessageDate !== today;

        // Build updates
        const updates = {
            totalMessages: (member.totalMessages || 0) + 1,
            lastMessage: new Date()
        };

        if (isNewDay) {
            updates.activeDays = (member.activeDays || 0) + 1;
        }

        // Update member stats and log message in parallel
        await Promise.all([
            updateMember(groupId, userId, updates),
            logMessage(groupId, userId, {
                content: text,
                mentions: extractMentions(msg),
                repliedTo: msg.message?.extendedTextMessage?.contextInfo?.participant || null
            })
        ]);

        // Refresh member data for economy processing
        member = { ...member, ...updates };

        // Economy processing (per-group)
        const economyResult = await processMessageEconomy(groupId, userId, member);

        if (economyResult.payout) {
            // ANTI-BAN: Add delay before economy notifications
            await delay(getRandomDelay(1500, 3000));
            await simulateTyping(sock, groupId);
            await delay(getRandomDelay(800, 1500));
            
            await sock.sendMessage(groupId, {
                text: `💰 *PAGO REALIZADO*\nUsuario: @${userId.split('@')[0]}\nMonto: $${economyResult.amount.toFixed(2)} 💵\nModalidad: Efectivo\n\n💡 Usa .deposit ${economyResult.amount.toFixed(2)} para guardarlo.`,
                mentions: [userId]
            }, { quoted: msg });
            member.wallet = (member.wallet || 0) + economyResult.amount;
            member.pending = 0;
        } else if (economyResult.paidDebt && economyResult.cleared) {
            await delay(getRandomDelay(1500, 3000));
            await simulateTyping(sock, groupId);
            await delay(getRandomDelay(800, 1500));
            
            await sock.sendMessage(groupId, {
                text: `🧾 *DEUDA PAGADA*\nSe han descontado $${economyResult.totalPayout.toFixed(2)} para pagar tu deuda.\n✅ Ahora estás libre de deudas.`
            }, { quoted: msg });
            member.debt = 0;
        }

        // Level check (per-group)
        const lvlChange = checkLevelChange(member.level, member.wallet || 0, member.bank || 0);
        if (lvlChange) {
            await updateMember(groupId, userId, {
                level: lvlChange.level,
                levelName: lvlChange.name
            });

            const emoji = lvlChange.level > member.level ? '🎉' : '⚠️';
            const action = lvlChange.level > member.level ? 'SUBISTE' : 'BAJASTE';

            // ANTI-BAN: Add delay before level notifications
            await delay(getRandomDelay(2000, 4000));
            await simulateTyping(sock, groupId);
            await delay(getRandomDelay(1000, 2000));

            await sock.sendMessage(groupId, {
                text: `${emoji} *¡${action} DE NIVEL!*\n\n@${userId.split('@')[0]} ${action.toLowerCase()} a NIVEL ${lvlChange.level}\n🎫 ZONA: ${lvlChange.name}\n━━━━━━━━━━━━━━━━━━━━━━\n${lvlChange.desc}`,
                mentions: [userId]
            });
        }
    } catch (error) {
        logger.error('Background processing error:', error);
    }
}

module.exports = {
    handleIncomingMessage,
    safeSendMessage,
    simulateTyping,
    delay,
    getRandomDelay
};
