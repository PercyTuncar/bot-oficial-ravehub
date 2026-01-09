const { LEVELS } = require('../../services/permissions');
const { commands } = require('../index');
const { getPermissionLevel } = require('../../services/permissions');
const { getPremiumUsers } = require('../../services/database');
const { getGroupMetadataCached } = require('../../services/cache');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');
require('dotenv').config();

const PREFIX = process.env.BOT_PREFIX || '.';

// Category emojis and names
const CATEGORY_INFO = {
    admin: { emoji: '👑', name: 'Administración' },
    economy: { emoji: '💰', name: 'Economía' },
    games: { emoji: '🎮', name: 'Juegos' },
    moderation: { emoji: '🛡️', name: 'Moderación' },
    user: { emoji: '👤', name: 'Usuario' }
};

// Level names
const LEVEL_NAMES = {
    [LEVELS.USER]: '👤 Usuario',
    [LEVELS.PREMIUM]: '⭐ Premium',
    [LEVELS.ADMIN]: '🛡️ Admin',
    [LEVELS.OWNER]: '👑 Dueño'
};

module.exports = {
    name: 'menu',
    aliases: ['comandos', 'commands', 'ayuda', 'cmds'],
    description: 'Muestra todos los comandos disponibles según tu nivel de permisos',
    usage: '.menu',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: senderId, groupId, isGroup, groupMetadata }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            // Get user permission level
            let userLevel = LEVELS.USER;
            
            if (isGroup) {
                const premiumList = await getPremiumUsers(groupId);
                const isPremium = premiumList.includes(senderId);
                const metadata = groupMetadata || await getGroupMetadataCached(sock, groupId);
                userLevel = await getPermissionLevel(msg.key, metadata, isPremium);
            } else {
                // In private chat, check if owner
                const ownerNumber = process.env.BOT_OWNER;
                const senderNumber = senderId.split('@')[0];
                if (msg.key.fromMe || senderNumber === ownerNumber) {
                    userLevel = LEVELS.OWNER;
                }
            }

            // Group commands by category and filter by permission
            const categorizedCommands = {};
            
            for (const [name, cmd] of commands) {
                // Only show commands the user can execute
                if (cmd.requiredLevel <= userLevel) {
                    const category = cmd.category || 'user';
                    if (!categorizedCommands[category]) {
                        categorizedCommands[category] = [];
                    }
                    categorizedCommands[category].push(cmd);
                }
            }

            // Build menu text
            let menuText = `
╔═══════════════════════════════╗
║    🤖 *RAVEHUB BOT MENU*    
╚═══════════════════════════════╝

👋 *Hola, @${senderId.split('@')[0]}!*
📊 *Tu nivel:* ${LEVEL_NAMES[userLevel]}
📝 *Prefijo:* ${PREFIX}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

            // Define category order
            const categoryOrder = ['user', 'economy', 'games', 'moderation', 'admin'];

            for (const category of categoryOrder) {
                const cmds = categorizedCommands[category];
                if (!cmds || cmds.length === 0) continue;

                const catInfo = CATEGORY_INFO[category] || { emoji: '📦', name: category };
                
                menuText += `\n\n${catInfo.emoji} *${catInfo.name.toUpperCase()}*\n`;
                menuText += `┌─────────────────────\n`;

                for (const cmd of cmds) {
                    const aliases = cmd.aliases && cmd.aliases.length > 0 
                        ? ` _(${cmd.aliases.slice(0, 2).join(', ')})_` 
                        : '';
                    const levelBadge = cmd.requiredLevel >= LEVELS.PREMIUM 
                        ? (cmd.requiredLevel === LEVELS.OWNER ? ' 👑' : cmd.requiredLevel === LEVELS.ADMIN ? ' 🛡️' : ' ⭐')
                        : '';
                    menuText += `│ ${PREFIX}${cmd.name}${aliases}${levelBadge}\n`;
                }
                
                menuText += `└─────────────────────`;
            }

            menuText += `\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Usa* ${PREFIX}help <comando>
   _para ver detalles de un comando_

⭐ = Premium | 🛡️ = Admin | 👑 = Dueño
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 *RaveHub Bot v2.0* 🔥
            `.trim();

            await sock.sendMessage(targetJid, {
                text: menuText,
                mentions: [senderId]
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in menu command:', error);
            await reactError(sock, targetJid, reactionKey);
            await sock.sendMessage(targetJid, { 
                text: '❌ Error al mostrar el menú.' 
            }, { quoted: msg });
        }
    }
};
