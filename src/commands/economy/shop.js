const { LEVELS } = require('../../services/permissions');
const { getShopItems } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'shop',
    aliases: ['tienda', 'store'],
    description: 'Muestra los items de la tienda',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            let items = await getShopItems();

            if (items.length === 0) {
                items = [
                    { id: 1, name: "CERVEZA", price: 25.00, description: "Reclama una cerveza en el proximo festival que asistira ravehub", stock: 50 },
                    { id: 2, name: "STICKER", price: 15.00, description: "Reclama 1 sticker a tu eleccion en el siguiente festival", stock: 100 },
                    { id: 3, name: "POLO RAVEHUB", price: 85.00, description: "Reclama un polo oficial de ravehub", stock: 30 }
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

            let response = '🛒 *TIENDA RAVEHUB*\n\n';
            for (const item of items) {
                response += `━━━━━━━━━━━━━━━━━━━━━━\n${item.id}️⃣ ${item.name}\n💵 Precio: $${item.price.toFixed(2)}\n📦 Stock: ${item.stock}\n📝 ${item.description}\n`;
            }

            response += '━━━━━━━━━━━━━━━━━━━━━━\n\n💡 Para comprar: .buy <número>\n   Ejemplo: .buy 1';

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in shop:', error);
            throw error;
        }
    }
};
