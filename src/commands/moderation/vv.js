const { LEVELS, getPermissionLevel } = require('../../services/permissions');
const { getPremiumStatus } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'vv',
    aliases: ['antiviewonce', 'ver', 'retrieve'],
    description: 'Recupera mensajes de "Una Vez" (Premium/Admin)',
    requiredLevel: LEVELS.USER, // Custom handling inside
    async execute(sock, msg, args, { groupId, isGroup, user, groupMetadata }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            // 1. Permission Check (Premium or Admin)
            const premiumStatus = await getPremiumStatus(groupId, user);
            const isPremium = premiumStatus && !premiumStatus.isExpired;

            // Re-calculate level just to be sure, or leverage context if passed securely. 
            // Reuse logic locally for stricter check if needed or trust isPremium passed.
            // But since 'requiredLevel' is USER, we must check manually.

            let isAdmin = false;
            if (isGroup && groupMetadata) {
                const participant = groupMetadata.participants.find(p => p.id === user);
                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
            }

            // Owner also counts
            const isOwner = user.split('@')[0] === process.env.BOT_OWNER_NUMBER;

            if (!isPremium && !isAdmin && !isOwner) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: '❌ Este comando es exclusivo para Usuarios Premium.\n\n💎 *¡Suscríbete ahora!*\nEscribe: `.premium on`\nO compra en la tienda: `.buy 4`'
                }, { quoted: msg });
            }

            // 2. Validate Quoted Message
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Debes responder a una foto o video de "Una vez".' }, { quoted: msg });
            }

            console.log('DEBUG: ViewOnce Retrieval Quoted Object:', JSON.stringify(quotedMsg, null, 2));

            // 3. Detect ViewOnce Type
            // Standard Wrappers
            let viewOnceMessage = quotedMsg.viewOnceMessage || quotedMsg.viewOnceMessageV2 || quotedMsg.viewOnceMessageV2Extension;

            // Unwrapped check (sometimes Baileys/WA handles it differently or it's a "normal" viewonce)
            const isDirectImage = quotedMsg.imageMessage && (quotedMsg.imageMessage.viewOnce || quotedMsg.imageMessage.viewOnce === true);
            const isDirectVideo = quotedMsg.videoMessage && (quotedMsg.videoMessage.viewOnce || quotedMsg.videoMessage.viewOnce === true);

            // If it's direct, we treat the quotedMsg as the wrapper for extraction purposes
            if (isDirectImage || isDirectVideo) {
                viewOnceMessage = { message: quotedMsg };
            }

            if (!viewOnceMessage) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ El mensaje respondido no se detecta como "Una vez". Revisa la consola para ver qué llegó.' }, { quoted: msg });
            }

            // 4. Extract Media Content
            const content = viewOnceMessage.message.imageMessage || viewOnceMessage.message.videoMessage;
            const mediaType = viewOnceMessage.message.imageMessage ? 'image' : 'video';
            const caption = content.caption || '';

            if (!content) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Se detectó el envoltorio pero no el contenido media.' }, { quoted: msg });
            }

            // 5. Download Media
            // Construct a fake msg object for downloadMediaMessage as it expects full structure
            // Need to be careful with structure matching what Baileys expects
            const buffer = await downloadMediaMessage(
                {
                    key: msg.message.extendedTextMessage.contextInfo.quotedMessage, // This might not work directly if structure is nested
                    message: quotedMsg // Pass the quoted message object directly which contains viewOnceMessage...
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            // 6. Resend
            if (mediaType === 'image') {
                await sock.sendMessage(targetJid, { image: buffer, caption: `🕵️ *Anti-ViewOnce*\n\n${caption}` }, { quoted: msg });
            } else {
                await sock.sendMessage(targetJid, { video: buffer, caption: `🕵️ *Anti-ViewOnce*\n\n${caption}` }, { quoted: msg });
            }

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in vv command:', error);
            await reactError(sock, targetJid, reactionKey);
            await sock.sendMessage(targetJid, { text: '❌ Error al recuperar el archivo. Puede que ya haya expirado.' }, { quoted: msg });
        }
    }
};
