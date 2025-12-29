const { LEVELS } = require('../../services/permissions');
const { getMember, getUser } = require('../../services/database');
const { calculateLevel } = require('../../services/levels');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'info',
    aliases: ['perfil', 'ver'],
    description: 'Muestra el perfil de un usuario mencionado en este grupo',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            // Get mentioned user
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

            let targetUserId = mentions[0] || quotedParticipant;

            if (!targetUserId) {
                return sock.sendMessage(targetJid, { text: '❌ Menciona a un usuario.\nEjemplo: .info @usuario' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Get per-group member data for this user
            const member = await getMember(groupId, targetUserId);

            if (!member) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `❌ *USUARIO NO REGISTRADO*\n\n@${targetUserId.split('@')[0]} aún no ha interactuado en este grupo.\nDebe enviar al menos 1 mensaje para registrarse.`,
                    mentions: [targetUserId]
                }, { quoted: msg });
            }

            // Get global user data
            const globalUser = await getUser(targetUserId);

            const netWorth = (member.wallet || 0) + (member.bank || 0);
            const lvlInfo = calculateLevel(netWorth);
            const nextLvl = lvlInfo.level < 11 ? lvlInfo.max - netWorth : 0;

            let debtText = '';
            if (member.debt > 0) {
                debtText = `💳 Deuda: -$${member.debt.toFixed(2)}\n`;
            }

            const birthdayText = globalUser?.birthday || 'No configurado';

            let lastMsgText = 'N/A';
            if (member.lastMessage) {
                const lastMsgDate = member.lastMessage.toDate ? member.lastMessage.toDate() : new Date(member.lastMessage);
                const diffMs = Date.now() - lastMsgDate.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 1) {
                    lastMsgText = 'Ahora';
                } else if (diffMins < 60) {
                    lastMsgText = `Hace ${diffMins}m`;
                } else if (diffMins < 1440) {
                    lastMsgText = `Hace ${Math.floor(diffMins / 60)}h`;
                } else {
                    lastMsgText = `Hace ${Math.floor(diffMins / 1440)}d`;
                }
            }

            const response = `👤 *PERFIL DE @${targetUserId.split('@')[0]}*

━━━━━━━━━━━━━━━━━━━━━━
📛 Nombre: ${globalUser?.name || member.name || 'Unknown'}
📞 Teléfono: +${targetUserId.split('@')[0].split(':')[0]}
🎂 Cumpleaños: ${birthdayText}
━━━━━━━━━━━━━━━━━━━━━━

💰 *ECONOMÍA (Este Grupo)*
💵 Efectivo: $${(member.wallet || 0).toFixed(2)}
🏦 Banco: $${(member.bank || 0).toFixed(2)}
⏳ Pendiente: $${(member.pending || 0).toFixed(2)}
💎 Patrimonio: $${netWorth.toFixed(2)}
${debtText}
━━━━━━━━━━━━━━━━━━━━━━

📊 *ESTADÍSTICAS (Este Grupo)*
✉️ Mensajes: ${(member.totalMessages || 0).toLocaleString()}
📅 Días activo: ${member.activeDays || 1}
⏰ Último mensaje: ${lastMsgText}

━━━━━━━━━━━━━━━━━━━━━━

🎯 *NIVEL (Este Grupo)*
🔰 Nivel ${lvlInfo.level}: ${lvlInfo.name}
🎵 "${lvlInfo.desc}"
${nextLvl > 0 ? `📈 Próximo nivel: $${nextLvl.toFixed(2)} más` : '🏆 ¡Nivel Máximo!'}

━━━━━━━━━━━━━━━━━━━━━━

⚠️ *INFRACCIONES (Este Grupo)*
Advertencias: ${member.warns?.length || 0}/3
Expulsiones: ${member.kicks?.length || 0}`;

            await sock.sendMessage(targetJid, { text: response, mentions: [targetUserId] }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in info:', error);
            throw error;
        }
    }
};
