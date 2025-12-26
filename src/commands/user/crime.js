const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'crime',
    aliases: ['crimen', 'delinquir'],
    description: 'Realiza un crimen de alto riesgo (Gana o pierde dinero)',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) return sock.sendMessage(targetJid, { text: '❌ Solo en grupos.' }, { quoted: msg });

            await reactProcessing(sock, targetJid, reactionKey);

            const member = await getMember(groupId, userId);
            if (!member) return;

            // Cooldown check could be added here later (future improvement)

            // Logic:
            // 40% Win: Get $50 - $500
            // 60% Fail: Lose $20 - $200 (Fine)

            const random = Math.random();
            const wallet = member.wallet || 0;
            const bank = member.bank || 0;
            const total = wallet + bank;

            if (random < 0.40) {
                // WIN
                const profit = Math.floor(Math.random() * 5) + 1;
                const newWallet = parseFloat((wallet + profit).toFixed(2));

                await updateMember(groupId, userId, { wallet: newWallet });

                const scenarios = [
                    'Asaltaste un Oxxo',
                    'Robaste autopartes en La Victoria',
                    'Vendiste entradas falsas para el After',
                    'Hackeaste el WiFi del vecino',
                    'Robaste un celular en el Metropolitano',
                    'Vendiste información a la competencia',
                    'Falsificaste un DNI',
                    'Robaste las propinas de un bar',
                    'Hiciste de "campana" en un robo',
                    'Vendiste botellas vacías como nuevas',
                    'Robaste cables de luz',
                    'Estafaste turistas en el centro',
                    'Robaste una bicicleta mal estacionada',
                    'Te fuiste sin pagar de un restaurante',
                    'Robaste un carrito del supermercado',
                    'Vendiste tu voto en las elecciones',
                    'Hackeaste la cuenta de Netflix de tu ex',
                    'Robaste el papel higiénico de un baño público',
                    'Grafiteaste una patrulla de policía',
                    'Vendiste USBs con virus en la universidad',
                    'Estafaste a tu abuela con el "cuento del tío"',
                    'Robaste la limosna de la iglesia',
                    'Falsificaste una receta médica para clonazepam',
                    'Vendiste celulares clonados en la plaza',
                    'Robaste una señal de tránsito de "PARE"',
                    'Revendiste zapatillas falsas a precio original',
                    'Robaste la billetera del chofer del bus',
                    'Hackeaste el sistema de notas de la escuela',
                    'Secuestraste al gato de la vecina por rescate',
                    'Robaste un pedido de Rappi ajeno',
                    'Vendiste rifas falsas "pro-salud"',
                    'Robaste el estéreo de un taxi viejo',
                    'Le quitaste el dulce a un niño en el parque',
                    'Vendiste un curso de trading que era estafa',
                    'Robaste cobre de una construcción abandonada',
                    'Asaltaste un camión de helados',
                    'Falsificaste billetes con una impresora casera',
                    'Robaste las tapas de las llantas de un BMW',
                    'Vendiste cuentas robadas de Spotify',
                    'Te colaste en el cine por la salida de emergencia',
                    'Robaste plantas del parque municipal',
                    'Vendiste capturas de pantalla como NFTs',
                    'Robaste el microondas de la oficina',
                    'Estafaste en Marketplace con depósito falso',
                    'Robaste una moto lineal estacionada',
                    'Vendiste agua del caño como agua mineral',
                    'Robaste la alcancía de tu hermanito',
                    'Intentaste asaltar un banco con pistola de agua',
                    'Robaste el modem de internet de un cibercafé',
                    'Vendiste fotos de pies sacadas de Google'
                ];
                const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

                await sock.sendMessage(targetJid, {
                    text: `🔫 *CRIMEN EXITOSO*\n\n${scenario}.\n💰 Ganancia: $${profit.toFixed(2)}\n💵 Efectivo actual: $${newWallet.toFixed(2)}`
                }, { quoted: msg });

            } else {
                // LOSE
                const fine = Math.floor(Math.random() * 180) + 20;

                let paid = 0;
                let debt = 0;

                let newWallet = wallet;
                let newBank = bank;

                if (total >= fine) {
                    if (newWallet >= fine) {
                        newWallet -= fine;
                    } else {
                        const remainder = fine - newWallet;
                        newWallet = 0;
                        newBank -= remainder;
                    }
                    paid = fine;
                } else {
                    paid = total;
                    debt = fine - total;
                    newWallet = 0;
                    newBank = 0;
                }

                const updates = {
                    wallet: parseFloat(newWallet.toFixed(2)),
                    bank: parseFloat(newBank.toFixed(2))
                };
                if (debt > 0) {
                    updates.debt = parseFloat(((member.debt || 0) + debt).toFixed(2));
                }

                await updateMember(groupId, userId, updates);

                const scenarios = [
                    `La policía te atrapó robando`,
                    `Te estafaron en un trato`,
                    `Tu escape falló`,
                    `Te atraparon hackeando`
                ];
                const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

                let failureMsg = `🚓 *CRIMEN FALLIDO*\n\n${scenario}.\n💸 Multa: $${fine.toFixed(2)}\n`;
                if (debt > 0) failureMsg += `⚠️ No pudiste pagar todo. Deuda generada: -$${debt.toFixed(2)}`;
                else failureMsg += `📉 Se descontó de tus fondos.`;

                await sock.sendMessage(targetJid, { text: failureMsg }, { quoted: msg });
            }

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in crime:', error);
            throw error;
        }
    }
};
