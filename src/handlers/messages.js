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

// Message deduplication cache
const processedMessages = new Set();

function cleanupProcessedMessages() {
    if (processedMessages.size > 1000) {
        processedMessages.clear();
    }
}

const { extractMessageText, extractMentions } = require('../utils/textUtils');

async function handleIncomingMessage(sock, msg) {
    const handlerStart = Date.now();

    try {
        if (!msg.message) return;

        // --- DEDUPLICATION CHECK ---
        const msgId = msg.key.id;
        if (processedMessages.has(msgId)) {
            return;
        }
        processedMessages.add(msgId);
        cleanupProcessedMessages();

        // --- Extract text ---
        const text = extractMessageText(msg).trim();

        // --- Self-Message Handling ---
        if (msg.key.fromMe && !text.startsWith(PREFIX)) {
            return;
        }

        const remoteJid = msg.key.remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');

        if (remoteJid === 'status@broadcast') return;

        const userId = msg.key.participant || remoteJid;
        const groupId = isGroup ? remoteJid : null;

        // --- Rate Limit Check ---
        const { checkRateLimit } = require('../middleware/ratelimit');
        if (!checkRateLimit(userId)) {
            return;
        }

        // --- Group validation ---
        let currentGroup = null;
        if (isGroup) {
            currentGroup = await getGroup(remoteJid);
            if (!currentGroup || !currentGroup.active) return;

            // --- SILENCE CHECK (Optimized In-Memory) ---
            const { isSilenced } = require('../services/silenceService');
            if (isSilenced(remoteJid, userId)) {
                // Delete message
                try {
                    await sock.sendMessage(remoteJid, { delete: msg.key });
                } catch (e) {
                    // Ignore delete errors (e.g. admin restriction)
                }
                return;
            }
        }

        // --- ANTILINK CHECK ---
        const { checkAntilink } = require('../middleware/antilink');
        if (isGroup && await checkAntilink(sock, msg, text, currentGroup, userId, isGroup)) {
            return; // Message deleted due to antilink
        }

        // --- FAST PATH: Command check ---
        const isCommand = text.startsWith(PREFIX);

        // --- COMMAND EXECUTION ---
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

                console.log(`DEBUG: Command '${commandName}' | User: ${userId} | Level: ${userLevel}/${command.requiredLevel} | Time: ${Date.now() - handlerStart}ms`);

                if (command.requiredLevel > userLevel) {
                    await sock.sendMessage(remoteJid, { text: '❌ No tienes permiso para este comando.' }, { quoted: msg });
                    return;
                }

                // Execute command with context
                await command.execute(sock, msg, args, {
                    user: userId,
                    group: groupId,
                    groupId: groupId,
                    text,
                    isGroup,
                    groupMetadata
                });

                console.log(`DEBUG: Command '${commandName}' completed in ${Date.now() - handlerStart}ms`);
                return;
            }
        }

        // --- NON-COMMAND MESSAGES: Process stats/economy in background (only in groups) ---
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
            await sock.sendMessage(groupId, {
                text: `💰 *PAGO REALIZADO*\nUsuario: @${user.split('@')[0]}\nMonto: $${economyResult.amount.toFixed(2)} 💵\nModalidad: Efectivo\n\n💡 Usa .deposit ${economyResult.amount.toFixed(2)} para guardarlo.`,
                mentions: [user]
            }, { quoted: msg });
            member.wallet = (member.wallet || 0) + economyResult.amount;
            member.pending = 0;
        } else if (economyResult.paidDebt && economyResult.cleared) {
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
    handleIncomingMessage
};
