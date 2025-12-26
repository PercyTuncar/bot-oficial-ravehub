const { LEVELS } = require('../../services/permissions');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { normalizeJidForSend } = require('../../utils/commandUtils');

module.exports = {
    name: 'tagall',
    aliases: ['todos', 'everyone', 'all'],
    description: 'Etiqueta a todos los miembros del grupo (soporta texto y multimedia)',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { groupMetadata, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);

        try {
            if (!isGroup) return;

            // 1. Get all participants
            const participants = groupMetadata.participants.map(p => p.id);

            // 2. Determine Message Content (Quoted or Current)
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedKey = msg.message?.extendedTextMessage?.contextInfo?.stash?.quotedMessageKey // This is usually internal, better to construct key if needed
                || { id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId, remoteJid: targetJid, participant: msg.message?.extendedTextMessage?.contextInfo?.participant };

            // Re-construct quoted msg object for downloadMediaMessage if needed
            const messageToUse = quotedMsg ? { message: quotedMsg } : msg;

            // Check content type
            const messageType = Object.keys(messageToUse.message)[0];
            const isImage = messageType === 'imageMessage';
            const isVideo = messageType === 'videoMessage';

            // Extract text from current command args OR quoted text
            // If user typed ".tagall Hola", text is "Hola".
            // If user typed ".tagall" on a quoted text, text is Quoted Text.
            // If user typed ".tagall caption" on a quoted image, caption is "caption".

            let textToSend = args.join(' ');

            // If no text provided in command, attempt to use quoted text
            if (!textToSend && quotedMsg) {
                textToSend = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || '';
            }

            const options = {
                mentions: participants
            };

            // 3. Handle Media Re-send
            if (isImage || isVideo) {
                // Download media
                try {
                    const buffer = await downloadMediaMessage(
                        messageToUse,
                        'buffer',
                        {},
                        { logger: console }
                    );

                    if (isImage) {
                        await sock.sendMessage(targetJid, { image: buffer, caption: textToSend, mentions: participants });
                    } else if (isVideo) {
                        await sock.sendMessage(targetJid, { video: buffer, caption: textToSend, mentions: participants });
                    }
                } catch (err) {
                    console.error('Error downloading media for tagall:', err);
                    await sock.sendMessage(targetJid, { text: '❌ Error al procesar el archivo multimedia.' }, { quoted: msg });
                }
            } else {
                // 4. Handle Text Re-send
                // Use textToSend. If empty, fallback to "Atención a todos"
                const finalMsg = textToSend || '📣 Atención a todos';
                await sock.sendMessage(targetJid, { text: finalMsg, mentions: participants });
            }

        } catch (error) {
            console.error('Error in tagall:', error);
            throw error;
        }
    }
};
