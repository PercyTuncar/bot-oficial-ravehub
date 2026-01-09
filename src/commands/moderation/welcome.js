const { LEVELS } = require('../../services/permissions');
const { updateGroup, getGroup } = require('../../services/database');
const { createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'welcome',
    category: 'moderation',
    description: 'Configura las bienvenidas del grupo',
    usage: '.welcome <on|off|message> [texto]',
    examples: ['.welcome on', '.welcome off', '.welcome message ¡Bienvenido {user} a {group}! Eres el miembro #{count}'],
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { isGroup, text, group: groupId }) {
        if (!isGroup) return;

        const reactionKey = createReactionKey(msg.key);

        try {
            const subCommand = args[0]?.toLowerCase();

            let groupConfig = await getGroup(groupId);
            if (!groupConfig) return;

            await reactProcessing(sock, groupId, reactionKey);

            if (subCommand === 'on') {
                await updateGroup(groupId, { 'settings.welcome.enabled': true });
                await sock.sendMessage(groupId, { text: '✅ Bienvenidas activadas en este grupo.\n💡 Configura el mensaje con: .welcome message [tu mensaje]' }, { quoted: msg });
                await reactSuccess(sock, groupId, reactionKey);

            } else if (subCommand === 'off') {
                await updateGroup(groupId, { 'settings.welcome.enabled': false });
                await sock.sendMessage(groupId, { text: '❌ Bienvenidas desactivadas en este grupo.' }, { quoted: msg });
                await reactSuccess(sock, groupId, reactionKey);

            } else if (subCommand === 'message') {
                const message = args.slice(1).join(' ');
                if (!message) {
                    await reactError(sock, groupId, reactionKey);
                    return sock.sendMessage(groupId, { text: '❌ Debes escribir el mensaje.' }, { quoted: msg });
                }

                const urlRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif))/i;
                const match = message.match(urlRegex);
                const imageUrl = match ? match[0] : null;

                await updateGroup(groupId, {
                    'settings.welcome.message': message,
                    'settings.welcome.imageUrl': imageUrl
                });

                let previewText = `✅ Mensaje de bienvenida configurado.\n━━━━━━━━━━━━━━━━━━━━━━\nVista previa:\n\n${message}`;
                if (imageUrl) {
                    previewText += `\n\n🖼️ Imagen detectada: ${imageUrl}\n💡 Las bienvenidas se enviarán como imagen.`;
                }

                await sock.sendMessage(groupId, { text: previewText }, { quoted: msg });
                await reactSuccess(sock, groupId, reactionKey);

            } else {
                await reactError(sock, groupId, reactionKey);
                await sock.sendMessage(groupId, { text: '❌ Uso: .welcome on | .welcome off | .welcome message <texto>' }, { quoted: msg });
            }
        } catch (error) {
            await reactError(sock, groupId, reactionKey);
            console.error('Error in welcome:', error);
            throw error;
        }
    }
};
