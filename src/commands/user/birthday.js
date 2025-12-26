const { LEVELS } = require('../../services/permissions');
const { getUser, updateUser } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'birthday',
    aliases: ['cumple', 'cumpleaños', 'bday'],
    description: 'Configura tu fecha de cumpleaños (global)',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { user: userId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            const action = args[0]?.toLowerCase();

            if (!action) {
                return sock.sendMessage(targetJid, {
                    text: `🎂 *CUMPLEAÑOS*\n\nUso:\n.birthday set DD/MM - Configura tu cumpleaños\n.birthday show - Ver tu cumpleaños\n.birthday remove - Eliminar cumpleaños\n\nEjemplo: .birthday set 15/08\n\n💡 Tu cumpleaños es global (se comparte entre grupos).`
                }, { quoted: msg });
            }

            await reactProcessing(sock, targetJid, reactionKey);

            // Birthday is stored in GLOBAL user (not per-group)
            // If user doesn't exist (because we removed auto-create), we default to empty object
            // updateUser will lazily create the document.
            let user = await getUser(userId) || {};

            if (action === 'set') {
                const dateStr = args[1];
                if (!dateStr) {
                    await reactError(sock, targetJid, reactionKey);
                    return sock.sendMessage(targetJid, { text: '❌ Especifica la fecha (DD/MM)\nEjemplo: .birthday set 15/08' }, { quoted: msg });
                }

                const dateRegex = /^(\d{1,2})\/(\d{1,2})$/;
                const match = dateStr.match(dateRegex);
                if (!match) {
                    await reactError(sock, targetJid, reactionKey);
                    return sock.sendMessage(targetJid, { text: '❌ Formato inválido. Usa DD/MM\nEjemplo: .birthday set 15/08' }, { quoted: msg });
                }

                const day = parseInt(match[1]);
                const month = parseInt(match[2]);

                if (day < 1 || day > 31 || month < 1 || month > 12) {
                    await reactError(sock, targetJid, reactionKey);
                    return sock.sendMessage(targetJid, { text: '❌ Fecha inválida. Día (1-31), Mes (1-12)' }, { quoted: msg });
                }

                const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
                await updateUser(userId, { birthday: formattedDate });

                await sock.sendMessage(targetJid, {
                    text: `🎂 *CUMPLEAÑOS CONFIGURADO*\n\n📅 Fecha: ${formattedDate}\n━━━━━━━━━━━━━━━━━━━━━━\n✅ Tu cumpleaños ha sido guardado.\n💡 Este dato es global (visible en todos los grupos).`
                }, { quoted: msg });

                await reactSuccess(sock, targetJid, reactionKey);

            } else if (action === 'show' || action === 'ver') {
                const birthday = user.birthday;
                if (!birthday) {
                    await sock.sendMessage(targetJid, {
                        text: `🎂 *CUMPLEAÑOS*\n\n❌ No tienes cumpleaños configurado.\n💡 Usa: .birthday set DD/MM`
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(targetJid, {
                        text: `🎂 *TU CUMPLEAÑOS*\n\n📅 Fecha: ${birthday}\n━━━━━━━━━━━━━━━━━━━━━━\n💡 Usa .birthday remove para eliminarlo.`
                    }, { quoted: msg });
                }
                await reactSuccess(sock, targetJid, reactionKey);

            } else if (action === 'remove' || action === 'eliminar') {
                await updateUser(userId, { birthday: null });
                await sock.sendMessage(targetJid, {
                    text: `🎂 *CUMPLEAÑOS ELIMINADO*\n\n✅ Tu fecha de cumpleaños ha sido eliminada.`
                }, { quoted: msg });
                await reactSuccess(sock, targetJid, reactionKey);

            } else {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `❌ Acción no válida.\n\nUso:\n.birthday set DD/MM\n.birthday show\n.birthday remove`
                }, { quoted: msg });
            }

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in birthday:', error);
            throw error;
        }
    }
};
