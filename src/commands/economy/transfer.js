const { LEVELS } = require('../../services/permissions');
const { getMember, updateMember } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'transfer',
    aliases: ['pay', 'pagar', 'transferir', 'dar'],
    description: 'Envía dinero de tu banco a otro usuario',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: senderId, groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            // Target (Mention or Quoted)
            const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
            const targetUserId = mentions[0] || quotedParticipant;
            const amountStr = args.find(arg => !arg.includes('@')); // Simple generic parsing

            if (!targetUserId) {
                return sock.sendMessage(targetJid, { text: '❌ Menciona al usuario a quien transferir.\nEjemplo: .transfer @usuario 100' }, { quoted: msg });
            }

            if (targetUserId === senderId) {
                return sock.sendMessage(targetJid, { text: '❌ No puedes transferirte a ti mismo.' }, { quoted: msg });
            }

            // Parse amount logic handled implicitly by users typing format
            // Attempt to find number in args
            const amountMatch = args.find(a => /^\d+(\.\d+)?$/.test(a));
            let amount = amountMatch ? parseFloat(amountMatch) : 0;

            if (!amount || amount <= 0) {
                return sock.sendMessage(targetJid, { text: '❌ Indica una cantidad válida.\nEjemplo: .transfer @usuario 100' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Get Both Members
            const [sender, receiver] = await Promise.all([
                getMember(groupId, senderId),
                getMember(groupId, targetUserId)
            ]);

            if (!sender) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ No tienes perfil en este grupo.' }, { quoted: msg });
            }

            if (!receiver) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: `❌ @${targetUserId.split('@')[0]} no tiene perfil en este grupo.`, mentions: [targetUserId] }, { quoted: msg });
            }

            const senderBank = sender.bank || 0;

            if (senderBank < amount) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `❌ Fondos insuficientes en banco.\n🏦 Tienes: $${senderBank.toFixed(2)}\n💸 Necesitas: $${amount.toFixed(2)}`
                }, { quoted: msg });
            }

            // Transaction
            const newSenderBank = parseFloat((senderBank - amount).toFixed(2));
            const newReceiverBank = parseFloat(((receiver.bank || 0) + amount).toFixed(2));

            await Promise.all([
                updateMember(groupId, senderId, { bank: newSenderBank }),
                updateMember(groupId, targetUserId, { bank: newReceiverBank })
            ]);

            const response = `💸 *TRANSFERENCIA EXITOSA*
            
📤 De: @${senderId.split('@')[0]}
📥 Para: @${targetUserId.split('@')[0]}
💰 Monto: $${amount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━
🏦 Tu saldo: $${senderBank.toFixed(2)} → $${newSenderBank.toFixed(2)}`;

            await sock.sendMessage(targetJid, { text: response, mentions: [senderId, targetUserId] }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in transfer:', error);
            throw error;
        }
    }
};
