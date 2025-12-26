const { LEVELS } = require('../../services/permissions');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'recargar',
    aliases: ['recharge', 'deposit-info', 'atm'],
    description: 'Muestra información para recargar saldo (Plin)',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            const atmMessage = `
🏧 *ATM - RAVEHUB BANK* 
━━━━━━━━━━━━━━━━━━━━━━━
💵 *TASA DE CAMBIO:*
S/ 1.00 PEN = $1.00
━━━━━━━━━━━━━━━━━━━━━━━

📱 *MÉTODO DE PAGO:*
 -  *PLIN:* 944 784 488

🧾 *INSTRUCCIONES:*
1. Realiza el pago.
2. Toma un screenshot.
3. Envía la captura al aquí:
   🔗 wa.me/51944784488
4. Espera la confirmación.

━━━━━━━━━━━━━━━━━━━━━━━
💳 *RAVEHUB FINANCIAL SERVICES* 💳
`;

            // Enviar mensaje con mención al usuario para que le llegue la notificación si es grupo
            await sock.sendMessage(targetJid, {
                text: atmMessage,
                contextInfo: {
                    externalAdReply: {
                        title: "RAVEHUB ATM",
                        body: "Sistema de Recargas Seguro",
                        mediaType: 1,
                        thumbnailUrl: "https://i.imgur.com/3q3QzZp.jpg", // Puedes cambiar esto por un logo de banco o Plin
                        sourceUrl: "https://wa.me/51944784488",
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in recargar command:', error);
            await reactError(sock, targetJid, reactionKey);
            await sock.sendMessage(targetJid, { text: '❌ Error al mostrar información del cajero.' }, { quoted: msg });
        }
    }
};
