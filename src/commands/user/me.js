const { LEVELS } = require('../../services/permissions');
const { getMember, getUser } = require('../../services/database');
const { calculateLevel } = require('../../services/levels');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'me',
    aliases: ['perfil', 'yo', 'stats'],
    description: 'Muestra tu perfil en este grupo',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Get per-group member data
            const member = await getMember(groupId, userId);
            if (!member) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo. Envía un mensaje primero.' }, { quoted: msg });
            }

            // Get global user data for identity info
            const globalUser = await getUser(userId);

            const netWorth = (member.wallet || 0) + (member.bank || 0);
            const lvlInfo = calculateLevel(netWorth);
            const nextLvl = lvlInfo.level < 11 ? lvlInfo.max - netWorth : 0;

            let debtText = '';
            if (member.debt > 0) {
                debtText = `💳 Deuda: -$${member.debt.toFixed(2)}\n`;
            }

            // Format birthday from global user
            const birthdayText = globalUser?.birthday || 'No configurado';

            // Format last message
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

            const response = `👤 *PERFIL EN ESTE GRUPO*

━━━━━━━━━━━━━━━━━━━━━━
📛 Nombre: ${globalUser?.name || member.name || 'Unknown'}
📞 Teléfono: +${userId.split('@')[0]}
🎂 Cumpleaños: ${birthdayText}
━━━━━━━━━━━━━━━━━━━━━━

💰 *ECONOMÍA (Este Grupo)*
💵 Efectivo: $${(member.wallet || 0).toFixed(2)}
🏦 Banco: $${(member.bank || 0).toFixed(2)}
💎 Patrimonio: $${netWorth.toFixed(2)}
📊 Pendiente: $${(member.pending || 0).toFixed(2)}
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
Expulsiones: ${member.kicks?.length || 0}
━━━━━━━━━━━━━━━━━━━━━━
💡 _¿Quieres subir de nivel más rápido? Usa .recargar_`;

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in me:', error);
            throw error;
        }
    }
};
