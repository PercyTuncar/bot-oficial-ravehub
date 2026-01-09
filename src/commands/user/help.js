const { LEVELS } = require('../../services/permissions');
const { getCommand, commands } = require('../index');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');
require('dotenv').config();

const PREFIX = process.env.BOT_PREFIX || '.';

// Level names for display
const LEVEL_NAMES = {
    [LEVELS.USER]: '👤 Usuario',
    [LEVELS.PREMIUM]: '⭐ Premium',
    [LEVELS.ADMIN]: '🛡️ Admin',
    [LEVELS.OWNER]: '👑 Dueño'
};

// Category names
const CATEGORY_NAMES = {
    admin: '👑 Administración',
    economy: '💰 Economía',
    games: '🎮 Juegos',
    moderation: '🛡️ Moderación',
    user: '👤 Usuario'
};

module.exports = {
    name: 'help',
    aliases: ['ayuda', 'comando', 'cmd'],
    description: 'Muestra información detallada sobre un comando específico',
    usage: '.help <nombre_comando>',
    examples: ['.help balance', '.help addmoney', '.help welcome'],
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: senderId }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            // If no command name provided, show usage
            if (!args[0]) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `❌ *Debes especificar un comando*\n\n📝 *Uso:* ${PREFIX}help <comando>\n📌 *Ejemplo:* ${PREFIX}help balance\n\n💡 Usa ${PREFIX}menu para ver todos los comandos disponibles.`
                }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            const commandName = args[0].toLowerCase().replace(PREFIX, '');
            const command = getCommand(commandName);

            if (!command) {
                await reactError(sock, targetJid, reactionKey);
                
                // Try to suggest similar commands
                const allCommands = Array.from(commands.values());
                const suggestions = allCommands
                    .filter(cmd => 
                        cmd.name.includes(commandName) || 
                        commandName.includes(cmd.name) ||
                        (cmd.aliases && cmd.aliases.some(a => a.includes(commandName)))
                    )
                    .slice(0, 3)
                    .map(cmd => `${PREFIX}${cmd.name}`);

                let suggestionText = '';
                if (suggestions.length > 0) {
                    suggestionText = `\n\n💡 *¿Quisiste decir?*\n${suggestions.join('\n')}`;
                }

                return sock.sendMessage(targetJid, {
                    text: `❌ *Comando "${commandName}" no encontrado*${suggestionText}\n\n📋 Usa ${PREFIX}menu para ver todos los comandos.`
                }, { quoted: msg });
            }

            // Build help text
            const aliases = command.aliases && command.aliases.length > 0 
                ? command.aliases.map(a => `${PREFIX}${a}`).join(', ') 
                : 'Ninguno';
            
            const category = CATEGORY_NAMES[command.category] || '📦 Otros';
            const requiredLevel = LEVEL_NAMES[command.requiredLevel] || '👤 Usuario';
            const usage = command.usage || `${PREFIX}${command.name}`;
            const description = command.description || 'Sin descripción disponible';

            let helpText = `
╔═══════════════════════════════╗
║    📖 *AYUDA DE COMANDO*    
╚═══════════════════════════════╝

🏷️ *Comando:* ${PREFIX}${command.name}
📝 *Descripción:* ${description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 *Categoría:* ${category}
🔐 *Nivel requerido:* ${requiredLevel}
🔀 *Alias:* ${aliases}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Uso:*
\`\`\`${usage}\`\`\`
`.trim();

            // Add examples if available
            if (command.examples && command.examples.length > 0) {
                helpText += `\n\n📋 *Ejemplos:*`;
                for (const example of command.examples) {
                    helpText += `\n• ${example}`;
                }
            }

            // Add placeholders info for certain commands
            if (['welcome', 'farewell'].includes(command.name)) {
                helpText += `\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *Placeholders disponibles:*
• {user} - Menciona al usuario
• {group} - Nombre del grupo
• {count} - Número de miembros

🖼️ *Imagen:* Incluye una URL de imagen
   (jpg, jpeg, png, gif) en el mensaje.
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            }

            helpText += `\n\n💡 Usa ${PREFIX}menu para ver todos los comandos.`;

            await sock.sendMessage(targetJid, {
                text: helpText
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in help command:', error);
            await reactError(sock, targetJid, reactionKey);
            await sock.sendMessage(targetJid, { 
                text: '❌ Error al mostrar la ayuda.' 
            }, { quoted: msg });
        }
    }
};
