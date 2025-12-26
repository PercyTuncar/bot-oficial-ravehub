const { LEVELS } = require('../../services/permissions');
const { createGroup, updateGroup, getGroup } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'bot',
    description: 'Controla la activación del bot en grupos (on/off)',
    requiredLevel: LEVELS.OWNER,
    async execute(sock, msg, args, { text }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            const [action, groupId] = args;

            if (!action || !['on', 'off'].includes(action)) {
                return sock.sendMessage(targetJid, { text: '❌ Uso: .bot on/off <id_grupo>' }, { quoted: msg });
            }

            if (!groupId) {
                return sock.sendMessage(targetJid, { text: '❌ Debes especificar el ID del grupo.' }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            if (action === 'on') {
                const groupMetadata = await sock.groupMetadata(groupId).catch(() => null);
                if (!groupMetadata) {
                    await reactError(sock, targetJid, reactionKey);
                    return sock.sendMessage(targetJid, { text: '❌ No se encontró el grupo o no soy miembro.' }, { quoted: msg });
                }

                const statusMsg = await sock.sendMessage(targetJid, { text: `🔄 Activando bot en: ${groupMetadata.subject}` });

                const steps = [
                    '⏳ Cargando sistema... [██░░░░░░░░] 20%',
                    '⏳ Cargando sistema... [█████░░░░░] 50%',
                    '⏳ Cargando sistema... [████████░░] 80%',
                    '⏳ Cargando sistema... [██████████] 100%'
                ];

                for (const step of steps) {
                    await new Promise(r => setTimeout(r, 400));
                    await sock.sendMessage(targetJid, { text: step, edit: statusMsg.key });
                }

                await createGroup(groupId, {
                    name: groupMetadata.subject,
                    participants: groupMetadata.participants.length,
                    active: true,
                    activatedAt: new Date()
                });

                await sock.sendMessage(targetJid, {
                    text: `✅ *BOT ACTIVADO EXITOSAMENTE*

📍 Grupo: ${groupMetadata.subject}
🆔 ID: ${groupId}
👥 Participantes: ${groupMetadata.participants.length}
⏰ Activado: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━
El bot ya puede responder comandos en este grupo.`
                }, { edit: statusMsg.key });

                await reactSuccess(sock, targetJid, reactionKey);

            } else if (action === 'off') {
                await updateGroup(groupId, { active: false, deactivatedAt: new Date() });

                const groupData = await getGroup(groupId) || { name: 'Desconocido' };

                await sock.sendMessage(targetJid, {
                    text: `🔴 *BOT DESACTIVADO*

📍 Grupo: ${groupData.name}
🆔 ID: ${groupId}
⏰ Desactivado: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━
El bot ignorará comandos en este grupo.`
                }, { quoted: msg });

                await reactSuccess(sock, targetJid, reactionKey);
            }
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in botcontrol:', error);
            throw error;
        }
    }
};
