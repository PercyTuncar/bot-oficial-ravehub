const { LEVELS } = require('../../services/permissions');
const { getMember } = require('../../services/database');
const { deposit } = require('../../services/economy');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'deposit',
    aliases: ['depositar', 'dep'],
    description: 'Deposita dinero al banco (protegido de robos)',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            const member = await getMember(groupId, userId);
            if (!member) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo.' }, { quoted: msg });
            }

            let amount = args[0];
            if (!amount) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: '❌ Indica la cantidad.\nEjemplo: .deposit 5 o .deposit all'
                }, { quoted: msg });
            }

            // Handle 'all' or 'todo'
            if (amount === 'all' || amount === 'todo') {
                amount = 'all';
            }

            const result = await deposit(groupId, userId, member, amount);

            const response = `💳 *DEPÓSITO EXITOSO*

💵 Cantidad: $${amount === 'all' ? member.wallet.toFixed(2) : parseFloat(amount).toFixed(2)}
🏦 Banco: $${member.bank.toFixed(2)} → $${result.bank.toFixed(2)}
💰 Efectivo: $${member.wallet.toFixed(2)} → $${result.wallet.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
✅ Tu dinero está protegido.`;

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            // Don't log user input errors as system errors
            if (error.message === "Cantidad inválida" || error.message === "No tienes suficiente efectivo") {
                // Using warn or info for expected user errors
                // Assuming logger is available or we just suppress the console.error
            } else {
                console.error('Error in deposit:', error);
            }

            if (error.message) {
                await sock.sendMessage(targetJid, { text: `❌ ${error.message}` }, { quoted: msg });
            }
        }
    }
};
