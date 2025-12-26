const { LEVELS } = require('../../services/permissions');
const { getOrdersByStatus } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'requests',
    aliases: ['pedidos', 'orders'],
    description: 'Lista los pedidos pendientes',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            const orders = await getOrdersByStatus('PENDING');

            if (orders.length === 0) {
                await sock.sendMessage(targetJid, {
                    text: '📋 *PEDIDOS PENDIENTES*\n\n✅ No hay pedidos pendientes.\nTodos los pedidos han sido procesados.'
                }, { quoted: msg });
                await reactSuccess(sock, targetJid, reactionKey);
                return;
            }

            let response = '📋 *PEDIDOS PENDIENTES*\n\n';
            for (const order of orders) {
                const diffMs = Date.now() - order.createdAt.toDate().getTime();
                const mins = Math.floor(diffMs / 60000);

                response += `━━━━━━━━━━━━━━━━━━━━━━\n🆔 #${order.orderId}\n👤 ${order.userName} (+${order.userPhone.replace(/\D/g, '')})\n🛍️ ${order.itemName}\n💰 $${order.price.toFixed(2)}\n⏰ Hace ${mins} minutos\n`;
            }

            response += '━━━━━━━━━━━━━━━━━━━━━━\n\nTotal: ' + orders.length + ' pedidos pendientes\n\n💡 Usa:\n.deliver <ID> para marcar entregado\n.reject <ID> para rechazar';

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in requests:', error);
            throw error;
        }
    }
};
