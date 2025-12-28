const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'flip',
    aliases: ['coinflip', 'moneda'],
    description: 'Cara o cruz - 50/50',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            const bet = parseFloat(args[0]);
            const choice = args[1]?.toLowerCase();

            if (isNaN(bet) || bet < 1) {
                return sock.sendMessage(targetJid, { text: '❌ Apuesta mínima: $1.00\nEjemplo: .flip 5 cara' }, { quoted: msg });
            }

            if (!choice || !['cara', 'cruz', 'heads', 'tails'].includes(choice)) {
                return sock.sendMessage(targetJid, { text: '❌ Indica cara o cruz.\nEjemplo: .flip 5 cara' }, { quoted: msg });
            }

            const member = await getMember(groupId, userId);
            if (!member) {
                return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo.' }, { quoted: msg });
            }

            if ((member.wallet || 0) < bet) {
                if ((member.bank || 0) >= bet) {
                    return sock.sendMessage(targetJid, { text: `❌ No tienes suficiente efectivo.\n💡 Usa .withdraw ${bet} para sacar dinero del banco.` }, { quoted: msg });
                }
                return sock.sendMessage(targetJid, { text: '❌ No tienes suficiente dinero.' }, { quoted: msg });
            }

            // Deduct bet
            await updateMember(groupId, userId, { wallet: parseFloat(((member.wallet || 0) - bet).toFixed(2)) });

            const userChoice = ['cara', 'heads'].includes(choice) ? 'CARA' : 'CRUZ';

            const sentMsg = await sock.sendMessage(targetJid, {
                text: `🪙 *CARA O CRUZ*\n━━━━━━━━━━━━━━━━━━━━━━\nApostaste: $${bet.toFixed(2)} a ${userChoice}\nLanzando moneda... 🤜🪙`
            }, { quoted: msg });

            await new Promise(r => setTimeout(r, 1000));
            await sock.sendMessage(targetJid, {
                text: `🪙 *CARA O CRUZ*\n━━━━━━━━━━━━━━━━━━━━━━\nGirando en el aire... 🌀`,
                edit: sentMsg.key
            });

            await new Promise(r => setTimeout(r, 1000));

            const result = Math.random() < 0.5 ? 'CARA' : 'CRUZ';
            const won = result === userChoice;
            const payout = won ? parseFloat((bet * 1.95).toFixed(2)) : 0;
            const currentWallet = parseFloat(((member.wallet || 0) - bet).toFixed(2));
            const newWallet = parseFloat((currentWallet + payout).toFixed(2));

            if (won) {
                await updateMember(groupId, userId, { wallet: newWallet });
            }

            const resultIcon = result === 'CARA' ? '🤴' : '⚔️';
            const finalText = won
                ? `🪙 *CARA O CRUZ*\n━━━━━━━━━━━━━━━━━━━━━━\nResultado: ${result} ${resultIcon}\n━━━━━━━━━━━━━━━━━━━━━━\n✅ ¡GANASTE!\n💰 Premio: $${payout.toFixed(2)} (x1.95)\n💵 Efectivo: $${newWallet.toFixed(2)}`
                : `🪙 *CARA O CRUZ*\n━━━━━━━━━━━━━━━━━━━━━━\nResultado: ${result} ${resultIcon}\n━━━━━━━━━━━━━━━━━━━━━━\n❌ Perdiste\nApostaste a ${userChoice} pero salió ${result}\n💸 Pérdida: $${bet.toFixed(2)}\n💵 Efectivo: $${currentWallet.toFixed(2)}`;

            await sock.sendMessage(targetJid, { text: finalText, edit: sentMsg.key });
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in flip:', error);
            throw error;
        }
    }
};
