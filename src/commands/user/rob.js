const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember } = require('../../services/database');
const { calculateLevel, checkLevelChange } = require('../../services/levels');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'rob',
    aliases: ['robar', 'steal'],
    description: 'Intenta robar dinero a otro usuario',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: robberId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            // Get mentioned victim
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const victimId = mentions[0];

            if (!victimId) {
                return sock.sendMessage(targetJid, { text: '❌ Menciona a quien quieres robar.\nEjemplo: .rob @usuario' }, { quoted: msg });
            }

            if (victimId === robberId) {
                return sock.sendMessage(targetJid, { text: '❌ No puedes robarte a ti mismo.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Get both members from THIS GROUP
            const [robber, victim] = await Promise.all([
                getMember(groupId, robberId),
                getMember(groupId, victimId)
            ]);

            if (!robber) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo.' }, { quoted: msg });
            }



            if (!victim) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `❌ @${victimId.split('@')[0]} no tiene perfil en este grupo.`,
                    mentions: [victimId]
                }, { quoted: msg });
            }

            // Check if victim has money in wallet
            const victimWallet = victim.wallet || 0;
            if (victimWallet <= 0) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `💼 @${victimId.split('@')[0]} no tiene dinero en efectivo.\nNo hay nada que robar.`,
                    mentions: [victimId]
                }, { quoted: msg });
            }

            // Probabilities: 30% success, 50% fail (fine), 20% frustrated
            const random = Math.random();
            let response = '';

            if (random < 0.30) {
                // SUCCESS - Steal random amount
                const stealPercent = Math.random(); // 0-100%
                const stolenAmount = parseFloat((victimWallet * stealPercent).toFixed(2));
                const finalStolen = Math.max(0.01, stolenAmount);

                // Update both members
                await Promise.all([
                    updateMember(groupId, robberId, { wallet: parseFloat(((robber.wallet || 0) + finalStolen).toFixed(2)) }),
                    updateMember(groupId, victimId, { wallet: parseFloat((victimWallet - finalStolen).toFixed(2)) })
                ]);

                const percentStolen = Math.round((finalStolen / victimWallet) * 100);

                if (percentStolen >= 100 || victimWallet - finalStolen < 0.01) {
                    response = `🎉 *¡ROBO PERFECTO!*\n\n💎 ERES UN MAESTRO DEL CRIMEN 💎\nRobaste $${finalStolen.toFixed(2)} (100%) a @${victimId.split('@')[0]}\n━━━━━━━━━━━━━━━━━━━━━━\n💀 DEJASTE EN BANCA ROTA A @${victimId.split('@')[0]}\n💰 Tu efectivo: $${(robber.wallet || 0).toFixed(2)} → $${((robber.wallet || 0) + finalStolen).toFixed(2)}`;
                } else if (percentStolen < 10) {
                    response = `🥷 *ROBO CASI FRUSTRADO*\n\nRobaste $${finalStolen.toFixed(2)} (${percentStolen}%) a @${victimId.split('@')[0]}\n💰 Tu efectivo: $${(robber.wallet || 0).toFixed(2)} → $${((robber.wallet || 0) + finalStolen).toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ ¡Ese fue un robo novato!\nPor poco te atrapan.`;
                } else if (percentStolen < 20) {
                    response = `🥷 *ROBO NOVATO*\n\nRobaste $${finalStolen.toFixed(2)} (${percentStolen}%) a @${victimId.split('@')[0]}\n💰 Tu efectivo: $${(robber.wallet || 0).toFixed(2)} → $${((robber.wallet || 0) + finalStolen).toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\n👀 Este fue un robo novato.`;
                } else if (percentStolen < 50) {
                    response = `💰 *BUEN ROBO*\n\nRobaste $${finalStolen.toFixed(2)} (${percentStolen}%) a @${victimId.split('@')[0]}\n💵 Tu efectivo: $${(robber.wallet || 0).toFixed(2)} → $${((robber.wallet || 0) + finalStolen).toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\n👍 Robo decente, nada mal.`;
                } else {
                    response = `💎 *ROBO EXITOSO*\n\nRobaste $${finalStolen.toFixed(2)} (${percentStolen}%) a @${victimId.split('@')[0]}\n💵 Tu efectivo: $${(robber.wallet || 0).toFixed(2)} → $${((robber.wallet || 0) + finalStolen).toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\n🎯 ¡Gran robo!`;
                }

            } else if (random < 0.80) {
                // FAIL - Fine the robber
                const fineAmount = parseFloat((Math.random() * victimWallet * 0.5 + 1).toFixed(2));
                const robberTotal = (robber.wallet || 0) + (robber.bank || 0);

                let robberWalletAfter = robber.wallet || 0;
                let robberBankAfter = robber.bank || 0;
                let debtGenerated = 0;
                let paidToVictim = 0;

                if (robberTotal >= fineAmount) {
                    // Can pay full fine
                    if (robberWalletAfter >= fineAmount) {
                        robberWalletAfter -= fineAmount;
                    } else {
                        const fromBank = fineAmount - robberWalletAfter;
                        robberWalletAfter = 0;
                        robberBankAfter -= fromBank;
                    }
                    paidToVictim = fineAmount;
                } else {
                    // Generate debt
                    paidToVictim = robberTotal;
                    debtGenerated = parseFloat((fineAmount - robberTotal).toFixed(2));
                    robberWalletAfter = 0;
                    robberBankAfter = 0;
                }

                // Update robber
                const robberUpdates = {
                    wallet: parseFloat(robberWalletAfter.toFixed(2)),
                    bank: parseFloat(robberBankAfter.toFixed(2))
                };
                if (debtGenerated > 0) {
                    robberUpdates.debt = parseFloat(((robber.debt || 0) + debtGenerated).toFixed(2));
                }
                await updateMember(groupId, robberId, robberUpdates);

                // Pay victim
                if (paidToVictim > 0) {
                    await updateMember(groupId, victimId, {
                        bank: parseFloat(((victim.bank || 0) + paidToVictim).toFixed(2))
                    });
                }

                if (debtGenerated > 0) {
                    response = `🚨 *ROBO FALLIDO - DEUDA GENERADA*\n\n❌ TE ATRAPÓ LA POLICÍA\n💸 Multa: $${fineAmount.toFixed(2)} a @${victimId.split('@')[0]}\n━━━━━━━━━━━━━━━━━━━━━━\n📊 INTERVENCIÓN BANCARIA\nEfectivo: $${(robber.wallet || 0).toFixed(2)} → $0.00\nBanco: $${(robber.bank || 0).toFixed(2)} → $0.00\n💳 Deuda pendiente: -$${debtGenerated.toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\n⚠️ NO PUDISTE PAGAR LA MULTA COMPLETA\nTus próximos mensajes pagarán esta deuda.\n@${victimId.split('@')[0]} recibió $${paidToVictim.toFixed(2)} (resto pendiente).`;
                } else {
                    response = `🚨 *ROBO FALLIDO*\n\n❌ TE ATRAPÓ LA POLICÍA\n💸 Multa: $${fineAmount.toFixed(2)} pagados a @${victimId.split('@')[0]}\n━━━━━━━━━━━━━━━━━━━━━━\nTu efectivo: $${(robber.wallet || 0).toFixed(2)} → $${robberWalletAfter.toFixed(2)}\nTu banco: $${(robber.bank || 0).toFixed(2)} → $${robberBankAfter.toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━━━\n⚖️ Se tomó dinero de tu banco.\n@${victimId.split('@')[0]} recibió $${paidToVictim.toFixed(2)} como compensación.`;
                }
            } else {
                // FRUSTRATED - No consequences
                response = `🏃 *ROBO FRUSTRADO*\n\n@${victimId.split('@')[0]} te vio venir y escapó.\nNo pasó nada esta vez.\n━━━━━━━━━━━━━━━━━━━━━━\n💡 Intenta con otro objetivo.`;
            }

            await sock.sendMessage(targetJid, { text: response, mentions: [victimId] }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in rob:', error);
            throw error;
        }
    }
};
