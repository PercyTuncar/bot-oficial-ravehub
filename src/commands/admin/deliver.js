const { LEVELS } = require('../../services/permissions');
const { getOrder, updateOrder, getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'deliver',
    aliases: ['entregar', 'complete'],
    description: 'Marca un pedido como entregado',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { user: adminId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            const orderId = args[0]?.toUpperCase();
            if (!orderId) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Indica el ID del pedido.\nEjemplo: .deliver ORD-123' }, { quoted: msg });
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

            await updateOrder(orderId, {
                status: 'DELIVERED',
                deliveredAt: new Date(),
                handledBy: adminId
            });

            await sock.sendMessage(targetJid, {
                text: `✅ *PEDIDO ENTREGADO*

🆔 Pedido: #${orderId}
👤 Cliente: @${order.userId.split('@')[0]}
🛍️ Producto: ${order.itemName}
💰 Valor: $${order.price.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
📦 Marcado como ENTREGADO
👨‍💼 Procesado por: @${adminId.split('@')[0]}
⏰ ${new Date().toLocaleString()}`,
                mentions: [order.userId, adminId]
            }, { quoted: msg });

            // Notify user
            try {
                await sock.sendMessage(order.groupId, {
                    text: `✅ *TU PEDIDO HA SIDO ENTREGADO*

🆔 Pedido: #${orderId}
🛍️ Producto: ${order.itemName}
━━━━━━━━━━━━━━━━━━━━━━
🎉 ¡Disfrútalo en el festival!
Nos vemos en el próximo evento de RaveHub.`,
                    mentions: [order.userId]
                });
            } catch (e) {
                // Silent fail if can't notify
            }

            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in deliver:', error);
            throw error;
        }
    }
};
