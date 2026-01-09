const { LEVELS } = require('../../services/permissions');
const { getMember } = require('../../services/database');
const { withdraw } = require('../../services/economy');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'withdraw',
    aliases: ['retirar', 'sacar'],
    description: 'Retira dinero del banco a efectivo',
    usage: '.withdraw <cantidad|all>',
    examples: ['.withdraw 100', '.sacar 500', '.retirar all'],
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
                    text: '❌ Indica la cantidad.\nEjemplo: .withdraw 5 o .withdraw all'
                }, { quoted: msg });
            }

            if (amount === 'all' || amount === 'todo') {
                amount = 'all';
            }

            const result = await withdraw(groupId, userId, member, amount);

            const response = `🏧 *RETIRO EXITOSO*

💵 Cantidad: $${amount === 'all' ? member.bank.toFixed(2) : parseFloat(amount).toFixed(2)}
🏦 Banco: $${member.bank.toFixed(2)} → $${result.bank.toFixed(2)}
💰 Efectivo: $${member.wallet.toFixed(2)} → $${result.wallet.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
💡 Recuerda: El efectivo puede ser robado.`;

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            if (error.message) {
                await sock.sendMessage(targetJid, { text: `❌ ${error.message}` }, { quoted: msg });
            }
            console.error('Error in withdraw:', error);
        }
    }
};
