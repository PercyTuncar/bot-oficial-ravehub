const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactError } = require('../../utils/commandUtils');

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

module.exports = {
    name: 'dice',
    aliases: ['dados', 'roll'],
    description: 'Apuesta si la suma de dados será más o menos de 7',
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
                return sock.sendMessage(targetJid, { text: '❌ Apuesta mínima: $1.00\nEjemplo: .dice 5 mas' }, { quoted: msg });
            }

            if (!choice || !['mas', 'menos', 'more', 'less', 'high', 'low'].includes(choice)) {
                return sock.sendMessage(targetJid, { text: '❌ Indica "mas" o "menos" (mayor o menor a 7)\nEjemplo: .dice 5 mas' }, { quoted: msg });
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

            const userChoice = ['mas', 'more', 'high'].includes(choice) ? 'MÁS' : 'MENOS';

            const sentMsg = await sock.sendMessage(targetJid, {
                text: `🎲 *DADOS - HIGH/LOW*\n━━━━━━━━━━━━━━━━━━━━━━\nApostaste: $${bet.toFixed(2)} a ${userChoice} DE 7\nAgitando el cubilete... 🥤`
            });

            await new Promise(r => setTimeout(r, 1000));
            await sock.sendMessage(targetJid, {
                text: `🎲 *DADOS - HIGH/LOW*\n━━━━━━━━━━━━━━━━━━━━━━\nTirando dados... 🎲 🎲`,
                edit: sentMsg.key
            });

            await new Promise(r => setTimeout(r, 1000));

            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            const sum = die1 + die2;

            const currentWallet = parseFloat(((member.wallet || 0) - bet).toFixed(2));
            let won = false;
            let resultText = '';

            if (sum === 7) {
                resultText = `🏛️ LA CASA GANA\nSalió exactamente 7\n💸 Pérdida: $${bet.toFixed(2)}\n💵 Efectivo: $${currentWallet.toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\n🎲 El 7 siempre pertenece a la casa`;
            } else if ((sum > 7 && userChoice === 'MÁS') || (sum < 7 && userChoice === 'MENOS')) {
                won = true;
                const payout = parseFloat((bet * 2).toFixed(2));
                const newWallet = parseFloat((currentWallet + payout).toFixed(2));
                await updateMember(groupId, userId, { wallet: newWallet });
                resultText = `✅ ¡GANASTE!\nApostaste ${userChoice} y salió ${sum}\n💰 Premio: $${payout.toFixed(2)} (x2)\n💵 Efectivo: $${newWallet.toFixed(2)}`;
            } else {
                const opposite = userChoice === 'MÁS' ? 'MENOS' : 'MÁS';
                resultText = `❌ Perdiste\nApostaste ${userChoice} pero salió ${sum} (${opposite})\n💸 Pérdida: $${bet.toFixed(2)}\n💵 Efectivo: $${currentWallet.toFixed(2)}`;
            }

            const finalText = `🎲 *DADOS - HIGH/LOW*
━━━━━━━━━━━━━━━━━━━━━━
Dados: [ ${DICE_FACES[die1 - 1]} ] [ ${DICE_FACES[die2 - 1]} ] = ${sum}
━━━━━━━━━━━━━━━━━━━━━━
${resultText}`;

            await sock.sendMessage(targetJid, { text: finalText, edit: sentMsg.key });
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in dice:', error);
            throw error;
        }
    }
};
