const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactError } = require('../../utils/commandUtils');

const EMOJIS = ['🍒', '🍋', '🍇', '💎', '7️⃣'];

/**
 * Weighted random slot result
 * PRD: 3 iguales 5%, 2 iguales 30%, diferentes 65%
 */
function getWeightedSlotResult() {
    const random = Math.random();

    if (random < 0.05) {
        const symbol = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        return [symbol, symbol, symbol];
    } else if (random < 0.35) {
        const pairSymbol = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const otherSymbol = EMOJIS.filter(e => e !== pairSymbol)[Math.floor(Math.random() * 4)];
        const positions = [
            [pairSymbol, pairSymbol, otherSymbol],
            [pairSymbol, otherSymbol, pairSymbol],
            [otherSymbol, pairSymbol, pairSymbol]
        ];
        return positions[Math.floor(Math.random() * 3)];
    } else {
        const shuffled = [...EMOJIS].sort(() => Math.random() - 0.5);
        return [shuffled[0], shuffled[1], shuffled[2]];
    }
}

module.exports = {
    name: 'slot',
    aliases: ['slots', 'tragaperras'],
    description: 'Juega a las tragaperras',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            const bet = parseFloat(args[0]);
            if (isNaN(bet) || bet < 1) {
                return sock.sendMessage(targetJid, { text: '❌ Apuesta mínima: $1.00 USD\nEjemplo: .slot 5' }, { quoted: msg });
            }

            const member = await getMember(groupId, userId);
            if (!member) {
                return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo.' }, { quoted: msg });
            }

            if ((member.wallet || 0) < bet) {
                if ((member.bank || 0) >= bet) {
                    return sock.sendMessage(targetJid, { text: `❌ No tienes suficiente efectivo.\n💡 Usa .withdraw ${bet} para sacar dinero del banco.` }, { quoted: msg });
                }
                return sock.sendMessage(targetJid, { text: '❌ No tienes suficiente dinero. Envía mensajes para ganar.' }, { quoted: msg });
            }

            // Deduct bet immediately
            await updateMember(groupId, userId, { wallet: parseFloat(((member.wallet || 0) - bet).toFixed(2)) });

            const initialText = `🎰 *CASINO RAVEHUB* 🎰
━━━━━━━━━━━━━━━━━━━━━━
| 🟩 | 🟩 | 🟩 |
━━━━━━━━━━━━━━━━━━━━━━
GIRANDO...`;

            const sentMsg = await sock.sendMessage(targetJid, { text: initialText }, { quoted: msg });

            const [s1, s2, s3] = getWeightedSlotResult();

            await new Promise(r => setTimeout(r, 700));
            await sock.sendMessage(targetJid, {
                text: `🎰 *CASINO RAVEHUB* 🎰
━━━━━━━━━━━━━━━━━━━━━━
| ${s1} | 🟩 | 🟩 |
━━━━━━━━━━━━━━━━━━━━━━
...`, edit: sentMsg.key
            });

            await new Promise(r => setTimeout(r, 700));
            await sock.sendMessage(targetJid, {
                text: `🎰 *CASINO RAVEHUB* 🎰
━━━━━━━━━━━━━━━━━━━━━━
| ${s1} | ${s2} | 🟩 |
━━━━━━━━━━━━━━━━━━━━━━
...`, edit: sentMsg.key
            });

            await new Promise(r => setTimeout(r, 700));

            let winMultiplier = 0;
            let resultText = '';

            if (s1 === s2 && s2 === s3) {
                winMultiplier = 10;
                resultText = `🎉 ¡¡¡JACKPOT!!! 🎉\n🏆 ¡ERES UN GANADOR!`;
            } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                winMultiplier = 1.5;
                const pairSymbol = s1 === s2 ? s1 : (s2 === s3 ? s2 : s1);
                resultText = `¡Casi! Tienes par de ${pairSymbol}${pairSymbol}`;
            } else {
                resultText = `😔 No hubo suerte esta vez`;
            }

            const winnings = parseFloat((bet * winMultiplier).toFixed(2));
            const currentWalletAfterBet = parseFloat(((member.wallet || 0) - bet).toFixed(2));
            const newWallet = parseFloat((currentWalletAfterBet + winnings).toFixed(2));

            if (winnings > 0) {
                await updateMember(groupId, userId, { wallet: newWallet });
            }

            const finalText = `🎰 *CASINO RAVEHUB* 🎰
━━━━━━━━━━━━━━━━━━━━━━
| ${s1} | ${s2} | ${s3} |
━━━━━━━━━━━━━━━━━━━━━━
${resultText}
━━━━━━━━━━━━━━━━━━━━━━
${winnings > 0 ? `💰 Ganaste: $${winnings} (x${winMultiplier})\n💵 Efectivo: $${newWallet.toFixed(2)}` : `💸 Perdiste: $${bet.toFixed(2)}\n💵 Efectivo: $${currentWalletAfterBet.toFixed(2)}`}
━━━━━━━━━━━━━━━━━━━━━━
${winnings > 0 ? '💡 Deposita tus ganancias con .deposit all' : '🎲 Intenta de nuevo'}`;

            await sock.sendMessage(targetJid, { text: finalText, edit: sentMsg.key });
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in slot:', error);
            throw error;
        }
    }
};
