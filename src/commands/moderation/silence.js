const { LEVELS } = require('../../services/permissions');
const { silenceUser, unsilenceUser, isSilenced } = require('../../services/silenceService');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'silence',
    aliases: ['mute', 'shh', 'callar'],
    description: 'Silencia a un usuario por X minutos (borra sus mensajes)',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { groupId, isGroup, groupMetadata, user: adminId }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) return sock.sendMessage(targetJid, { text: '❌ Solo en grupos.' }, { quoted: msg });

            // .silence [minutos] @user  OR  .silence stop @user
            const arg1 = args[0] ? args[0].toLowerCase() : null;

            // --- MANEJO DE TARGET ---
            let targetUserId = null;
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUserId = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                targetUserId = msg.message.extendedTextMessage.contextInfo.participant;
            }

            if (!targetUserId) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Debes etiquetar a alguien.' }, { quoted: msg });
            }

            // --- CHECK ADMIN IMMUNITY ---
            const targetParticipant = groupMetadata.participants.find(p => p.id === targetUserId);
            if (targetParticipant && (targetParticipant.admin === 'admin' || targetParticipant.admin === 'superadmin')) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ No puedes silenciar a un admin.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // --- UNSILENCE (STOP) ---
            if (arg1 === 'stop' || arg1 === 'off' || arg1 === 'unmute') {
                if (!isSilenced(groupId, targetUserId)) {
                    await sock.sendMessage(targetJid, { text: '⚠️ El usuario no está silenciado.' }, { quoted: msg });
                    return;
                }
                await unsilenceUser(groupId, targetUserId);
                await sock.sendMessage(targetJid, { text: `🔊 @${targetUserId.split('@')[0]} ya puede hablar de nuevo.`, mentions: [targetUserId] }, { quoted: msg });
                await reactSuccess(sock, targetJid, reactionKey);
                return;
            }

            // --- SILENCE START ---
            const minutes = parseInt(arg1);
            if (isNaN(minutes) || minutes <= 0) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Uso: .silence [minutos] @usuario\nEjemplo: .silence 10 @usuario' }, { quoted: msg });
            }

            await silenceUser(groupId, targetUserId, adminId, minutes);

            await sock.sendMessage(targetJid, {
                text: `🤫 *SILENCIO APLICADO*\n\n👤 Usuario: @${targetUserId.split('@')[0]}\n⏳ Tiempo: ${minutes} minutos\n\n_Sus mensajes serán eliminados automáticamente._`,
                mentions: [targetUserId]
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in silence command:', error);
            await reactError(sock, targetJid, reactionKey);
        }
    }
};
