const { LEVELS } = require('../../services/permissions');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'games',
    aliases: ['juegos', 'casino', 'gamble'],
    description: 'Muestra la lista de juegos disponibles',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            const response = `🎰 *CASINO RAVEHUB* 🎰

¡Pon a prueba tu suerte y multiplica tu dinero!

🎲 *JUEGOS DISPONIBLES*

1️⃣ *Slot (Tragamonedas)*
🎰 Apuesta y busca 3 figuras iguales.
📝 Uso: \`.slot <apuesta>\`
💡 Ejemplo: \`.slot 100\`

2️⃣ *Cara o Cruz*
🪙 Duplica o nada. 50% de probabilidad.
📝 Uso: \`.coinflip <apuesta> <cara/cruz>\`
💡 Ejemplo: \`.coinflip 50 cara\`

3️⃣ *Dados*
🎲 Lanza los dados. Si sacas 7 o más, ¡ganas!
📝 Uso: \`.dice <apuesta>\`
💡 Ejemplo: \`.dice 25\`

━━━━━━━━━━━━━━━━━━━━━━
💰 Usa \`.balance\` para ver tus fondos.
⚠️ Juega con responsabilidad.`;

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in games:', error);
            throw error;
        }
    }
};
