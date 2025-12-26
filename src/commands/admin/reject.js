const { LEVELS } = require('../../services/permissions');
const { getOrder, updateOrder, getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'reject',
    aliases: ['rechazar', 'cancel'],
    description: 'Rechaza un pedido y reembolsa al usuario',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { user: adminId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            const orderId = args[0]?.toUpperCase();
            if (!orderId) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Indica el ID del pedido.\nEjemplo: .reject ORD-123' }, { quoted: msg });
            }

            const order = await getOrder(orderId);
            if (!order) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: `❌ Pedido #${orderId} no encontrado.` }, { quoted: msg });
            }

            if (order.status !== 'PENDING') {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: `❌ El pedido #${orderId} ya fue ${order.status === 'DELIVERED' ? 'entregado' : 'rechazado'}.` }, { quoted: msg });
            }

            // Refund to user's BANK in the order's group (per-group)
            const member = await getMember(order.groupId, order.userId);
            if (member) {
                await updateMember(order.groupId, order.userId, {
                    bank: parseFloat(((member.bank || 0) + order.price).toFixed(2))
                });
            }

            await updateOrder(orderId, {
                status: 'REJECTED',
                rejectedAt: new Date(),
                handledBy: adminId
            });

            await sock.sendMessage(targetJid, {
                text: `❌ *PEDIDO RECHAZADO*

🆔 Pedido: #${orderId}
👤 Cliente: @${order.userId.split('@')[0]}
🛍️ Producto: ${order.itemName}
💰 Valor: $${order.price.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
❌ Marcado como RECHAZADO
💸 Reembolso: $${order.price.toFixed(2)} → Banco
👨‍💼 Procesado por: @${adminId.split('@')[0]}
⏰ ${new Date().toLocaleString()}`,
                mentions: [order.userId, adminId]
            }, { quoted: msg });

            // Notify user
            try {
                const updatedMember = await getMember(order.groupId, order.userId);
                await sock.sendMessage(order.groupId, {
                    text: `❌ *TU PEDIDO FUE RECHAZADO*

🆔 Pedido: #${orderId}
🛍️ Producto: ${order.itemName}
━━━━━━━━━━━━━━━━━━━━━━
💳 REEMBOLSO PROCESADO
Se reembolsaron $${order.price.toFixed(2)} a tu banco.
🏦 Banco: $${updatedMember ? updatedMember.bank.toFixed(2) : '?.??'}
━━━━━━━━━━━━━━━━━━━━━━
📧 Contacta a un admin para más información.`,
                    mentions: [order.userId]
                });
            } catch (e) {
                // Silent fail if can't notify
            }

            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in reject:', error);
            throw error;
        }
    }
};
