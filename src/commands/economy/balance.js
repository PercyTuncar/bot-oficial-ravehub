const { LEVELS } = require('../../services/permissions');
const { getMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'billetera', 'wallet', 'bank'],
    description: 'Muestra tu balance o el de otro usuario',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: senderId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            // Determine target user (Mention > Quoted > Sender)
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

            let targetUserId = mentions[0] || quotedParticipant || senderId;
            const isSelf = targetUserId === senderId;

            await reactProcessing(sock, targetJid, reactionKey);

            // Get per-group member data
            const member = await getMember(groupId, targetUserId);

            if (!member) {
                await reactError(sock, targetJid, reactionKey);
                if (isSelf) {
                    return sock.sendMessage(targetJid, { text: '❌ No tienes cuenta en este grupo. Envía un mensaje para registrarte.' }, { quoted: msg });
                } else {
                    return sock.sendMessage(targetJid, { text: `❌ El usuario @${targetUserId.split('@')[0]} no tiene cuenta en este grupo.`, mentions: [targetUserId] }, { quoted: msg });
                }
            }

            // Calculate stats
            const wallet = member.wallet || 0;
            const bank = member.bank || 0;
            const netWorth = wallet + bank;
            const debt = member.debt || 0;

            let debtText = '';
            if (debt > 0) {
                debtText = `\n💳 Deuda: -$${debt.toFixed(2)}`;
            }

            const pending = member.pending || 0;

            const targetName = isSelf ? 'TU CUENTA' : '@' + targetUserId.split('@')[0];

            const response = `🏦 *ESTADO FINANCIERO* 🏦
👤 Usuario: ${targetName}
━━━━━━━━━━━━━━━━━━━━━━
💰 *Efectivo:* $${wallet.toFixed(2)}
🏛️ *Banco:* $${bank.toFixed(2)}
📉 *Deuda:* $${debt.toFixed(2)}
⏳ *Pendiente:* $${pending.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
💎 *PATRIMONIO NETO:* $${netWorth.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
💡 _¿Necesitas dinero rápido? Usa .recargar_`;

            await sock.sendMessage(targetJid, {
                text: response,
                mentions: isSelf ? [] : [targetUserId]
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in balance:', error);
            throw error;
        }
    }
};
