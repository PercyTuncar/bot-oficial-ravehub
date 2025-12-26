const { LEVELS } = require('../../services/permissions');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { normalizeJidForSend } = require('../../utils/commandUtils');

module.exports = {
    name: 'tagnoadmins',
    aliases: ['tagn', 'noadmins', 'tagmembers'],
    description: 'Etiqueta solo a los miembros que NO son administradores',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { groupMetadata, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);

        try {
            if (!isGroup) return;

            // 1. Get NON-ADMIN participants
            // Admin property can be 'admin', 'superadmin' or null/undefined
            const participants = groupMetadata.participants
                .filter(p => !p.admin)
                .map(p => p.id);

            if (participants.length === 0) {
                return sock.sendMessage(targetJid, { text: '⚠️ No hay miembros sin rango de administrador para etiquetar.' }, { quoted: msg });
            }

            // 2. Determine Message Content (Quoted or Current)
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            // Re-construct quoted msg object for downloadMediaMessage if needed
            const messageToUse = quotedMsg ? { message: quotedMsg } : msg;

            // Check content type
            const messageType = Object.keys(messageToUse.message)[0];
            const isImage = messageType === 'imageMessage';
            const isVideo = messageType === 'videoMessage';

            // Extract text from current command args OR quoted text
            let textToSend = args.join(' ');

            // If no text provided in command, attempt to use quoted text
            if (!textToSend && quotedMsg) {
                textToSend = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || quotedMsg.imageMessage?.caption || quotedMsg.videoMessage?.caption || '';
            }

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
                    console.error('Error downloading media for tagnoadmins:', err);
                    await sock.sendMessage(targetJid, { text: '❌ Error al procesar el archivo multimedia.' }, { quoted: msg });
                }
            } else {
                // 4. Handle Text Re-send
                // Use textToSend. If empty, fallback to "Atención a miembros"
                const finalMsg = textToSend || '📣 Atención a miembros';
                await sock.sendMessage(targetJid, { text: finalMsg, mentions: participants });
            }

        } catch (error) {
            console.error('Error in tagnoadmins:', error);
            throw error;
        }
    }
};
