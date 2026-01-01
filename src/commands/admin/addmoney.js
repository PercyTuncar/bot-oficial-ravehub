const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'addmoney',
    aliases: ['inject', 'dar-dinero'],
    description: 'Inyecta saldo al banco de un usuario (Solo Dueño)',
    requiredLevel: LEVELS.OWNER, // Exclusivo Owner
    async execute(sock, msg, args, { groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos para registrar la transacción.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // 1. Obtener usuario objetivo
            let targetUserId = null;

            // Check mentions
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUserId = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            // Check quoted message
            else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                targetUserId = msg.message.extendedTextMessage.contextInfo.participant;
            }

            if (!targetUserId) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Etiqueta a un usuario o responde a su mensaje.' }, { quoted: msg });
            }

            // 2. Obtener monto
            // Si es mención: args[0] es la mención, args[1] es el monto
            // Si es quote: args[0] es el monto
            let amountStr = args[0];
            if (args[0] && args[0].includes('@')) {
                amountStr = args[1];
            }

            const amount = parseFloat(amountStr);

            if (isNaN(amount) || amount <= 0) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Ingresa un monto válido. Ejemplo: .addmoney @user 100' }, { quoted: msg });
            }

            // 3. Ejecutar transacción
            const member = await getMember(groupId, targetUserId);

            // Si el usuario no existe en la DB del grupo, crearlo (aunque el getMember ya debería manejar esto si entra al grupo, pero por seguridad)
            // Aquí asumimos que existe o que updateMember manejará el caso simple, pero idealmente validamos.

            const currentBank = member ? (member.bank || 0) : 0;
            const currentDebt = member ? (member.debt || 0) : 0;
            let newBank = currentBank;
            let newDebt = currentDebt;
            let paidDebt = 0;
            let depositAmount = amount;

            // Lógica de Deuda Automática
            if (currentDebt > 0) {
                if (amount >= currentDebt) {
                    // Paga toda la deuda
                    paidDebt = currentDebt;
                    depositAmount = amount - currentDebt;
                    newDebt = 0;
                } else {
                    // Paga parte de la deuda
                    paidDebt = amount;
                    depositAmount = 0;
                    newDebt = currentDebt - amount;
                }
            }

            newBank += depositAmount;

            const memberName = member?.name || "Beneficiario";

            // Update DB
            await updateMember(groupId, targetUserId, {
                bank: parseFloat(newBank.toFixed(2)),
                debt: parseFloat(newDebt.toFixed(2))
            });

            // 4. Generar Ticket
            const transactionId = `TXN-${Date.now().toString().slice(-6)}`;
            const date = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();

            let ticketDetails = "";
            if (paidDebt > 0) {
                ticketDetails += `💸 *DEUDA PAGADA:* $${paidDebt.toFixed(2)}\n`;
                if (newDebt > 0) ticketDetails += `⚠️ *DEUDA RESTANTE:* $${newDebt.toFixed(2)}\n`;
            }
            if (depositAmount > 0 || paidDebt === 0) {
                ticketDetails += `💵 *DEPOSITADO BANCO:* $${depositAmount.toFixed(2)}\n`;
            }

            const ticket = `
🧾 *COMPROBANTE DE TRANSACCIÓN* 🧾
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 *ID:* ${transactionId}
📅 *Fecha:* ${date} - ${time}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Beneficiario:* @${targetUserId.split('@')[0]}
🏦 *Concepto:* Admin Inyección
${ticketDetails}
💰 *NUEVO SALDO BANCO:* $${newBank.toFixed(2)}

✅ *ESTADO:* APROBADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *RAVEHUB SECURITY SYSTEM*
`;

            await sock.sendMessage(targetJid, {
                text: ticket.trim(),
                mentions: [targetUserId]
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in addmoney:', error);
            await reactError(sock, targetJid, reactionKey);
            await sock.sendMessage(targetJid, { text: '❌ Error procesando la transacción.' }, { quoted: msg });
        }
    }
};
