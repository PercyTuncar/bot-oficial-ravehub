const { LEVELS } = require('../../services/permissions');
const { getPremiumStatus } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const logger = require('../../utils/logger');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stick'],
    description: 'Convierte imagen/video a sticker (Premium)',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, groupId, isGroup, groupMetadata }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            // 1. Check Permissions (Premium/Admin)
            // Manual check to give custom subscription message
            const premiumStatus = await getPremiumStatus(groupId, userId);
            const isPremium = premiumStatus && !premiumStatus.isExpired;

            let isAdmin = false;
            if (isGroup && groupMetadata) {
                const participant = groupMetadata.participants.find(p => p.id === userId);
                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
            }

            const isOwner = userId.split('@')[0] === process.env.BOT_OWNER_NUMBER;

            if (!isPremium && !isAdmin && !isOwner) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: '❌ Este comando es exclusivo para Usuarios Premium.\n\n💎 *¡Suscríbete ahora!*\nEscribe: `.premium on`\nO compra en la tienda: `.buy 4`'
                }, { quoted: msg });
            }

            // Determine message to process (quoted or current)
            const content = msg.message;
            const quoted = content?.extendedTextMessage?.contextInfo?.quotedMessage;

            let mediaMessage = null;
            let mime = '';

            if (quoted) {
                // Check if quoted is image or video
                if (quoted.imageMessage) {
                    mediaMessage = { message: quoted };
                    mime = 'image';
                } else if (quoted.videoMessage) {
                    mediaMessage = { message: quoted };
                    mime = 'video';
                } else if (quoted.stickerMessage) {
                    mediaMessage = { message: quoted };
                    mime = 'sticker';
                }
            } else {
                // Check if current message is media
                if (content.imageMessage) {
                    mediaMessage = msg;
                    mime = 'image';
                } else if (content.videoMessage) {
                    mediaMessage = msg;
                    mime = 'video';
                }
            }

            if (!mediaMessage) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: '❌ Responde a una imagen o video, o envíalo con el comando.' }, { quoted: msg });
            }

            // Download media
            // Note: downloadMediaMessage requires the full message object structure usually
            // However, baileys helper often takes just the message part if using newer utils.
            // But let's stick to standard practice: pass the message containing the media.
            const buffer = await downloadMediaMessage(
                mediaMessage,
                'buffer',
                { logger }
            );

            if (!buffer) {
                throw new Error('Failed to download media');
            }

            // Create Sticker
            const sticker = new Sticker(buffer, {
                pack: 'RaveHub Bot',
                author: 'RaveHub',
                type: StickerTypes.FULL,
                categories: ['🎉', '🔊'],
                quality: 60
            });

            const stickerBuffer = await sticker.toBuffer();

            // Send Sticker
            await sock.sendMessage(targetJid, {
                sticker: stickerBuffer
            }, { quoted: msg });

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            console.error('Error in sticker command:', error);
            await reactError(sock, targetJid, reactionKey);

            let errorText = '❌ Error al crear sticker.';
            if (error.message.includes('ffmpeg')) {
                errorText += ' (El servidor requiere ffmpeg para videos/stickers animados)';
            }

            await sock.sendMessage(targetJid, { text: errorText }, { quoted: msg });
        }
    }
};
