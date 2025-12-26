const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember, getOrCreateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'warn',
    aliases: ['advertir', 'warning'],
    description: 'Advierte a un usuario (3 warns = expulsión)',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { user: adminId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Get target user (mentioned or quoted)
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            let targetUserId = mentions[0] || quotedParticipant;

            if (!targetUserId) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Menciona a un usuario o responde a su mensaje.\nEjemplo: .warn @usuario Spam' }, { quoted: msg });
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

            // Get or create member in this group
            let member = await getMember(groupId, targetUserId);
            if (!member) {
                member = await getOrCreateMember(groupId, targetUserId, { name: 'Unknown' });
            }

            const currentWarns = member.warns || [];
            const newWarn = {
                motivo: reason,
                admin: adminId,
                fecha: new Date().toISOString()
            };
            currentWarns.push(newWarn);

            await updateMember(groupId, targetUserId, { warns: currentWarns });

            const warnCount = currentWarns.length;

            if (warnCount >= 3) {
                // Auto-kick at 3 warns
                try {
                    await sock.groupParticipantsUpdate(groupId, [targetUserId], 'remove');

                    // Record kick
                    const currentKicks = member.kicks || [];
                    currentKicks.push({
                        motivo: 'Límite de advertencias alcanzado (3/3)',
                        admin: 'Sistema',
                        fecha: new Date().toISOString()
                    });
                    await updateMember(groupId, targetUserId, { kicks: currentKicks, warns: [] });

                    await sock.sendMessage(targetJid, {
                        text: `🚫 *LÍMITE DE ADVERTENCIAS ALCANZADO*\n\n@${targetUserId.split('@')[0]} ha superado el límite de 3 advertencias.\n━━━━━━━━━━━━━━━━━━━━━━\n📝 Última infracción: ${reason}\n👮 Admin: @${adminId.split('@')[0]}\n⚠️ Advertencias: 3/3\n━━━━━━━━━━━━━━━━━━━━━━\n🚪 EXPULSANDO DEL GRUPO...\n\n✅ @${targetUserId.split('@')[0]} ha sido expulsado del grupo.`,
                        mentions: [targetUserId, adminId]
                    });
                } catch (kickError) {
                    await sock.sendMessage(targetJid, {
                        text: `🚫 *LÍMITE DE ADVERTENCIAS ALCANZADO*\n\n@${targetUserId.split('@')[0]} tiene 3/3 advertencias.\n━━━━━━━━━━━━━━━━━━━━━━\n❌ Error al expulsar: El bot no tiene permisos de admin.`,
                        mentions: [targetUserId]
                    });
                }
            } else {
                const warningLevel = warnCount === 2 ? '\n🚨 ÚLTIMA ADVERTENCIA\nUna más y serás expulsado automáticamente.' : '\n💡 Al llegar a 3 advertencias serás expulsado.';

                await sock.sendMessage(targetJid, {
                    text: `⚠️ *ADVERTENCIA${warnCount > 1 ? ` #${warnCount}` : ''}*\n\n@${targetUserId.split('@')[0]} ha sido advertido.\n━━━━━━━━━━━━━━━━━━━━━━\n📝 Motivo: ${reason}\n👮 Admin: @${adminId.split('@')[0]}\n⚠️ Advertencias: ${warnCount}/3\n━━━━━━━━━━━━━━━━━━━━━━${warningLevel}`,
                    mentions: [targetUserId, adminId]
                });
            }

            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in warn:', error);
            throw error;
        }
    }
};
