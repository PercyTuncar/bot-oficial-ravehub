const { LEVELS } = require('../../services/permissions');
const { updateGroup, getGroup } = require('../../services/database');
const { createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'farewell',
    aliases: ['despedida', 'goodbye'],
    category: 'moderation',
    description: 'Configura las despedidas del grupo',
    usage: '.farewell <on|off|message> [texto]',
    examples: ['.farewell on', '.farewell off', '.farewell message Adiós {user}, te esperamos de vuelta 👋'],
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
                await updateGroup(groupId, { 'settings.farewell.enabled': true });
                await sock.sendMessage(groupId, { text: '✅ Despedidas activadas.\n💡 Configura el mensaje con: .farewell message [texto]' }, { quoted: msg });
                await reactSuccess(sock, groupId, reactionKey);

            } else if (subCommand === 'off') {
                await updateGroup(groupId, { 'settings.farewell.enabled': false });
                await sock.sendMessage(groupId, { text: '❌ Despedidas desactivadas.' }, { quoted: msg });
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
                    'settings.farewell.message': message,
                    'settings.farewell.imageUrl': imageUrl
                });

                let previewText = `✅ Mensaje de despedida configurado.\n━━━━━━━━━━━━━━━━━━━━━━\nVista previa:\n\n${message}`;
                if (imageUrl) {
                    previewText += `\n\n🖼️ Imagen detectada: ${imageUrl}\n💡 Las despedidas se enviarán como imagen.`;
                }

                await sock.sendMessage(groupId, { text: previewText }, { quoted: msg });
                await reactSuccess(sock, groupId, reactionKey);

            } else {
                await reactError(sock, groupId, reactionKey);
                await sock.sendMessage(groupId, { text: '❌ Uso: .farewell on | .farewell off | .farewell message <texto>' }, { quoted: msg });
            }
        } catch (error) {
            await reactError(sock, groupId, reactionKey);
            console.error('Error in farewell:', error);
            throw error;
        }
    }
};
