const { LEVELS } = require('../../services/permissions');
const { getPremiumStatus } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'gaymeter',
    aliases: ['gay', 'homo', 'lgbt'],
    description: 'Calcula el porcentaje de homosexualidad de un usuario (Diversión)',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { groupId, isGroup, user, groupMetadata }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            // 1. Permission Check (Premium, Admin, or Owner)
            // Note: This command is fun but restricted as per request
            const premiumStatus = await getPremiumStatus(groupId, user);
            const isPremium = premiumStatus && !premiumStatus.isExpired;

            let isAdmin = false;
            if (isGroup && groupMetadata) {
                const participant = groupMetadata.participants.find(p => p.id === user);
                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
            }

            const ownerNumber = process.env.BOT_OWNER_NUMBER;
            const isOwner = user.split('@')[0] === ownerNumber;

            if (!isPremium && !isAdmin && !isOwner) {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: '❌ Este comando es exclusivo para Usuarios Premium.\n\n� *¡Suscríbete ahora!*\nEscribe: `.premium on`\nO compra en la tienda: `.buy 4`'
                }, { quoted: msg });
            }

            // 2. Identify Target (Mentioned or Self)
            let targetUser = user;
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                targetUser = msg.message.extendedTextMessage.contextInfo.participant;
            }

            // 3. The Algorithm (Easter Eggs & Random)
            let percentage = 0;
            const targetNumber = targetUser.split('@')[0];
            const botId = sock.user.id.split(':')[0];

            if (targetNumber === ownerNumber || targetNumber === botId) {
                percentage = 0;
            } else {
                percentage = Math.floor(Math.random() * 101);
            }

            // Helper for delay
            const delay = ms => new Promise(res => setTimeout(res, ms));

            // Helper for bar
            function drawBar(pct) {
                const totalBlocks = 10;
                const filled = Math.round(pct / 10);
                const empty = totalBlocks - filled;
                return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
            }

            // 4. ANIMATION SEQUENCE
            // Send Initial Message
            const initialText = `
🏳️‍🌈 *GAYMETER SCANNER* 🏳️‍🌈
━━━━━━━━━━━━━━━━━━
👤 *Analizando a:* @${targetUser.split('@')[0]}

🔄 *Iniciando escaneo...*
[░░░░░░░░░░] 0%
━━━━━━━━━━━━━━━━━━
            `.trim();

            const sentMsg = await sock.sendMessage(targetJid, {
                text: initialText,
                mentions: [targetUser]
            }, { quoted: msg });

            await delay(1000);

            // Step 1
            const step1Text = `
🏳️‍🌈 *GAYMETER SCANNER* 🏳️‍🌈
━━━━━━━━━━━━━━━━━━
👤 *Analizando a:* @${targetUser.split('@')[0]}

🧬 *Analizando cromosomas...*
${drawBar(20)} 20%
━━━━━━━━━━━━━━━━━━
            `.trim();

            await sock.sendMessage(targetJid, {
                edit: sentMsg.key,
                text: step1Text,
                mentions: [targetUser]
            });

            await delay(1000);

            // Step 2
            const step2Text = `
🏳️‍🌈 *GAYMETER SCANNER* 🏳️‍🌈
━━━━━━━━━━━━━━━━━━
👤 *Analizando a:* @${targetUser.split('@')[0]}

🦄 *Calculando brillo...*
${drawBar(60)} 60%
━━━━━━━━━━━━━━━━━━
            `.trim();

            await sock.sendMessage(targetJid, {
                edit: sentMsg.key,
                text: step2Text,
                mentions: [targetUser]
            });

            await delay(1000);

            // 5. Diagnostics Dictionary
            let diagnosis = "";
            let emoji = "";

            if (percentage === 0) {
                diagnosis = "Puro Macho / Vikingo 🛡️";
                emoji = "🗿";
            } else if (percentage > 0 && percentage <= 20) {
                diagnosis = "Hetero Seguro";
                emoji = "🍺";
            } else if (percentage > 20 && percentage <= 49) {
                diagnosis = "Hetero Curioso";
                emoji = "🤔";
            } else if (percentage === 50) {
                diagnosis = "Bisexual Equilibrado";
                emoji = "⚖️";
            } else if (percentage > 50 && percentage <= 79) {
                diagnosis = "Reina en potencia";
                emoji = "💅";
            } else if (percentage > 79 && percentage < 100) {
                diagnosis = "Gagalover Certificado";
                emoji = "🦄";
            } else if (percentage === 100) {
                diagnosis = "¡SALIÓ DEL CLÓSET!";
                emoji = "🏳️‍🌈";
            }

            // 6. Final Result
            const finalText = `
🏳️‍🌈 *GAYMETER SCANNER* 🏳️‍🌈
━━━━━━━━━━━━━━━━━━
👤 *Analizando a:* @${targetUser.split('@')[0]}

📊 *Nivel de Gei:* ${percentage}%
${drawBar(percentage)}

📝 *Diagnóstico:*
_${emoji} ${diagnosis}_
━━━━━━━━━━━━━━━━━━
            `.trim();

            await sock.sendMessage(targetJid, {
                edit: sentMsg.key,
                text: finalText,
                mentions: [targetUser]
            });

            await reactSuccess(sock, targetJid, reactionKey);

            // 7. Audio Easter Egg (>= 50%)
            if (percentage >= 50) {
                const path = require('path');
                // Send as true PTT (Voice Note) - File is .opus
                const audioPath = path.join(__dirname, '../../media/WhatsAppAudioGay.opus');

                await sock.sendMessage(targetJid, {
                    audio: { url: audioPath },
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true
                }, { quoted: msg });
            }

        } catch (error) {
            console.error('Error in gaymeter command:', error);
            await reactError(sock, targetJid, reactionKey);
        }
    }
};
