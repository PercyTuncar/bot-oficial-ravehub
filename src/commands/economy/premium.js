const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember, addPremiumUser, getPremiumStatus } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'premium',
    aliases: ['sub', 'subscribe'],
    description: 'Gestiona tu suscripción Premium',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        if (!isGroup) {
            return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
        }

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            // Subcommand: ON (Purchase)
            if (args[0] && args[0].toLowerCase() === 'on') {
                const member = await getMember(groupId, userId);
                if (!member) {
                    await reactError(sock, targetJid, reactionKey);
                    return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo.' }, { quoted: msg });
                }

                const PRICE = 10.00;

                // Check balancce (Bank or Wallet) - User said "verifica si tiene dinero". Usually we check wallet or bank.
                // Let's check Bank first, then Wallet, or ask user? 
                // In buy.js we used Bank. Let's use Bank here for consistency with online purchases, 
                // but usually subscriptions might come from Wallet too. 
                // Let's check Bank as primary.

                if ((member.bank || 0) < PRICE) {
                    await reactError(sock, targetJid, reactionKey);
                    return sock.sendMessage(targetJid, {
                        text: `❌ *FONDOS INSUFICIENTES*\n\n💎 Suscripción Premium\n💰 Precio: $${PRICE.toFixed(2)}\n🏦 Tu banco: $${(member.bank || 0).toFixed(2)}\n❌ Te faltan: $${(PRICE - (member.bank || 0)).toFixed(2)}\n\n💡 Deposita dinero en tu banco con .deposit`
                    }, { quoted: msg });
                }

                // Process purchase
                await updateMember(groupId, userId, { bank: parseFloat(((member.bank || 0) - PRICE).toFixed(2)) });
                const expireDate = await addPremiumUser(groupId, userId, 30);

                await sock.sendMessage(targetJid, {
                    text: `👑 *¡BIENVENIDO A PREMIUM!*\n\nSuscripción activada exitosamente.\n\n💰 Costo: $${PRICE.toFixed(2)}\n📅 Vence: ${expireDate.toLocaleDateString()}\n\n🔥 *Beneficios:*\n- Comando .sticker (crea stickers con marca RaveHub)\n- Prioridad en sorteos (próximamente)\n- Distintivo especial`
                }, { quoted: msg });

                await reactSuccess(sock, targetJid, reactionKey);
                return;
            }

            // Default: Check Status
            const status = await getPremiumStatus(groupId, userId);

            if (status && !status.isExpired) {
                await sock.sendMessage(targetJid, {
                    text: `👑 *ESTADO PREMIUM*\n\n✅ *SUSCRIPCIÓN ACTIVA*\n📅 Vence: ${status.expiresAt.toDate().toLocaleDateString()}\n⏳ Días restantes: ${status.daysRemaining}\n\nGracias por apoyar a RaveHub.`
                }, { quoted: msg });
            } else {
                await sock.sendMessage(targetJid, {
                    text: `💎 *RAVEHUB PREMIUM*\n\nActualmente no tienes una suscripción activa.\n\n*Beneficios:*\n✅ Comando .sticker exclusivo\n✅ Prioridad en soporte\n✅ Acceso a funciones beta\n\n💰 *Precio: $10.00 / mes*\n\n🛒 Para suscribirte escribe:\n*.premium on*\nO compra "Suscripción Premium" en la tienda (.shop)`
                }, { quoted: msg });
            }

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in premium command:', error);
            await reactError(sock, targetJid, reactionKey);
            await sock.sendMessage(targetJid, { text: '❌ Error al procesar la solicitud.' }, { quoted: msg });
        }
    }
};
