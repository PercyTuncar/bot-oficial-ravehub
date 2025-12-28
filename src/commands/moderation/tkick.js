const { LEVELS } = require('../../services/permissions');
const { addTempBan } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'tkick',
    aliases: ['tempban', 'kicktime'],
    description: 'Expulsa temporalmente a un usuario',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { groupId, isGroup, groupMetadata, user: adminId }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Solo funciona en grupos.' }, { quoted: msg });
            }

            // Args: [time] [user] or [user] [time] - let's enforce [time] [user] based on request
            // .tkick 60 @user

            const durationStr = args[0];
            const minutes = parseInt(durationStr);

            if (isNaN(minutes) || minutes <= 0) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Uso: .tkick [minutos] @usuario\nEjemplo: .tkick 60 @usuario' }, { quoted: msg });
            }

            // Get target
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

            // --- JID NORMALIZATION (Fix for Auto-Add) ---
            // Try to find the canonical JID (phone number) in group metadata
            // This fixes issues where 'participant' gives an LID which fails to add back
            const participant = groupMetadata.participants.find(p => p.id === targetUserId || (p.lid && p.lid === targetUserId));
            if (participant && participant.id.endsWith('@s.whatsapp.net')) {
                targetUserId = participant.id;
            }
            // --------------------------------------------

            // Check if target is admin
            const targetParticipant = groupMetadata.participants.find(p => p.id === targetUserId);
            if (targetParticipant && (targetParticipant.admin === 'admin' || targetParticipant.admin === 'superadmin')) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ No puedes expulsar a un administrador.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Calculate unban time
            const unbanAt = Date.now() + (minutes * 60 * 1000);

            // Save to DB
            await addTempBan({
                groupId,
                userId: targetUserId,
                unbanAt,
                bannedBy: adminId,
                durationMinutes: minutes,
                createdAt: Date.now()
            });

            // Kick user
            await sock.groupParticipantsUpdate(groupId, [targetUserId], 'remove');

            // Confirm
            await sock.sendMessage(targetJid, {
                text: `🚫 *EXPULSIÓN TEMPORAL*\n\n👤 Usuario: @${targetUserId.split('@')[0]}\n⏳ Tiempo: ${minutes} minutos\n\n_Reflexiona sobre tus acciones._`,
                mentions: [targetUserId]
            });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in tkick:', error);
            await reactError(sock, targetJid, reactionKey);
            await sock.sendMessage(targetJid, { text: '❌ Error al procesar la expulsión.' }, { quoted: msg });
        }
    }
};
