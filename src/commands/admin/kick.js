const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember, getOrCreateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'kick',
    aliases: ['expulsar', 'remove'],
    description: 'Expulsa a un usuario del grupo',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { user: adminId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Get target user
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            let targetUserId = mentions[0] || quotedParticipant;

            if (!targetUserId) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Menciona a un usuario o responde a su mensaje.\nEjemplo: .kick @usuario Motivo' }, { quoted: msg });
            }

            // Determine reason
            let reason = args.slice(mentions.length > 0 ? 1 : 0).join(' ');
            if (!reason && quotedMessage) {
                reason = quotedMessage.conversation ||
                    quotedMessage.extendedTextMessage?.text ||
                    'Contenido del mensaje';
            }
            if (!reason) {
                reason = 'Sin motivo especificado';
            }

            // Get or create member to record kick
            let member = await getMember(groupId, targetUserId);
            if (!member) {
                member = await getOrCreateMember(groupId, targetUserId, { name: 'Unknown' });
            }

            // Record kick in member history
            const currentKicks = member.kicks || [];
            currentKicks.push({
                motivo: reason,
                admin: adminId,
                fecha: new Date().toISOString()
            });
            await updateMember(groupId, targetUserId, { kicks: currentKicks });

            // Animation
            const sentMsg = await sock.sendMessage(targetJid, {
                text: `🚪 *EXPULSIÓN EN PROCESO*\n\n@${targetUserId.split('@')[0]} será removido del grupo.\n━━━━━━━━━━━━━━━━━━━━━━\n📝 Motivo: ${reason}\n👮 Admin: @${adminId.split('@')[0]}\n━━━━━━━━━━━━━━━━━━━━━━\nSe va... se va... se va...`,
                mentions: [targetUserId, adminId]
            });

            await new Promise(r => setTimeout(r, 1500));

            // Execute kick
            try {
                await sock.groupParticipantsUpdate(groupId, [targetUserId], 'remove');

                await sock.sendMessage(targetJid, {
                    text: `✅ *¡SE FUE!*\n\n@${targetUserId.split('@')[0]} ha sido expulsado del grupo.\n━━━━━━━━━━━━━━━━━━━━━━\n📝 Motivo: ${reason}\n👮 Expulsado por: @${adminId.split('@')[0]}\n⏰ ${new Date().toLocaleString()}`,
                    mentions: [targetUserId, adminId],
                    edit: sentMsg.key
                });
            } catch (kickError) {
                await sock.sendMessage(targetJid, {
                    text: `❌ *ERROR AL EXPULSAR*\n\nNo se pudo expulsar a @${targetUserId.split('@')[0]}.\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ El bot no tiene permisos de administrador.`,
                    mentions: [targetUserId],
                    edit: sentMsg.key
                });
            }

            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in kick:', error);
            throw error;
        }
    }
};
