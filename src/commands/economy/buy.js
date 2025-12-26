const { LEVELS } = require('../../services/permissions');
const { getShopItems, getMember, updateMember, createOrder, updateShopStock } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'buy',
    aliases: ['comprar', 'purchase'],
    description: 'Compra un item de la tienda',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            const itemId = parseInt(args[0]);
            if (isNaN(itemId)) {
                return sock.sendMessage(targetJid, { text: '❌ Indica el número del item (ej: .buy 1)' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            let items = await getShopItems();
            if (items.length === 0) {
                items = [
                    { id: 1, name: "CERVEZA", price: 25.00, description: "Reclama una cerveza en el proximo festival", stock: 50 },
                    { id: 2, name: "STICKER", price: 15.00, description: "Reclama 1 sticker", stock: 100 },
                    { id: 3, name: "POLO RAVEHUB", price: 85.00, description: "Reclama un polo oficial", stock: 30 }
                ];
            }

            // Inject Premium Item if not present
            if (!items.find(i => i.id === 4)) {
                items.push({
                    id: 4,
                    name: "SUSCRIPCION PREMIUM",
                    price: 10.00,
                    description: "Acceso mensual a comandos exclusivos",
                    stock: 9999
                });
            }

            const item = items.find(i => i.id === itemId);
            if (!item) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Item no encontrado.' }, { quoted: msg });
            }

            if (item.stock <= 0) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Producto agotado.' }, { quoted: msg });
            }

            // Get per-group member data
            const member = await getMember(groupId, userId);
            if (!member) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo.' }, { quoted: msg });
            }

            if ((member.bank || 0) < item.price) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `❌ *FONDOS INSUFICIENTES*\n\n🛍️ Producto: ${item.name}\n💰 Precio: $${item.price.toFixed(2)}\n🏦 Tu banco: $${(member.bank || 0).toFixed(2)}\n❌ Te faltan: $${(item.price - (member.bank || 0)).toFixed(2)}`
                }, { quoted: msg });
            }

            // === PREMIUM SUBSCRIPTION LOGIC ===
            if (item.id === 4) {
                const { addPremiumUser } = require('../../services/database');

                // Deduct from bank
                await updateMember(groupId, userId, { bank: parseFloat(((member.bank || 0) - item.price).toFixed(2)) });

                // Add Subscription
                const expireDate = await addPremiumUser(groupId, userId, 30);

                await sock.sendMessage(targetJid, {
                    text: `👑 *¡SUSCRIPCIÓN ACTIVADA!*\n\n🛍️ Producto: ${item.name}\n💰 Precio: $${item.price.toFixed(2)}\n📅 Expira: ${expireDate.toLocaleDateString()}\n\n✅ Ahora tienes acceso a comandos exclusivos como .sticker`
                }, { quoted: msg });

                await reactSuccess(sock, targetJid, reactionKey);
                return;
            }

            // Generate unique order ID
            const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

            // Execute all updates in parallel
            await Promise.all([
                updateMember(groupId, userId, { bank: parseFloat(((member.bank || 0) - item.price).toFixed(2)) }),
                updateShopStock(itemId, 1),
                createOrder({
                    orderId,
                    userId,
                    userName: member.name || userId.split('@')[0],
                    userPhone: userId.split('@')[0],
                    itemId: item.id,
                    itemName: item.name,
                    price: item.price,
                    status: 'PENDING',
                    groupId
                })
            ]);

            await sock.sendMessage(targetJid, {
                text: `✅ *COMPRA EXITOSA*

🛍️ Producto: ${item.name}
💰 Precio: $${item.price.toFixed(2)}
🆔 Pedido: #${orderId}
━━━━━━━━━━━━━━━━━━━━━━
💳 MOVIMIENTO BANCARIO
Banco: $${(member.bank || 0).toFixed(2)} → $${((member.bank || 0) - item.price).toFixed(2)}
📦 Stock restante: ${item.stock - 1}
━━━━━━━━━━━━━━━━━━━━━━
📋 Estado: PENDIENTE DE ENTREGA
🔔 Serás notificado cuando los admins procesen tu pedido.`
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in buy:', error);
            throw error;
        }
    }
};
