const { LEVELS } = require('../../services/permissions');
const { updateGroup, getGroup } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'antilink',
    aliases: ['antilinks', 'linkprotection'],
    description: 'Configura el sistema de protección contra enlaces',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            const action = args[0]?.toLowerCase();
            const value = args[1];

            await reactProcessing(sock, targetJid, reactionKey);

            const group = await getGroup(groupId);
            let settings = group.settings || {};
            let antilink = settings.antilink || { enabled: false };
            // Ensure object structure
            if (typeof antilink !== 'object') antilink = { enabled: antilink };

            let allowedLinks = settings.allowedLinks || [];

            if (action === 'on' || action === 'enable' || action === 'activar') {
                antilink.enabled = true;
                await updateGroup(groupId, { settings: { ...settings, antilink, allowedLinks } });
                await sock.sendMessage(targetJid, { text: '✅ *ANTILINK ACTIVADO*\n\nEl bot eliminará los enlaces no autorizados.' }, { quoted: msg });

            } else if (action === 'off' || action === 'disable' || action === 'desactivar') {
                antilink.enabled = false;
                await updateGroup(groupId, { settings: { ...settings, antilink, allowedLinks } });
                await sock.sendMessage(targetJid, { text: '⚠️ *ANTILINK DESACTIVADO*\n\nSe permiten todos los enlaces.' }, { quoted: msg });

            } else if (action === 'list' || action === 'lista') {
                const globalList = [
                    'ravehub.pe',
                    'ravehublatam.com',
                    'instagram.com/ravehub.pe'
                ];

                let msgText = `🛡️ *CONFIGURACIÓN ANTILINK*\n\nEstado: ${antilink.enabled ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n🌐 *Dominios Permitidos (Global):*\n${globalList.map(l => `• ${l}`).join('\n')}\n\n📝 *Dominios Permitidos (Grupo):*\n`;

                if (allowedLinks.length === 0) {
                    msgText += '_(Ninguno configurado)_';
                } else {
                    msgText += allowedLinks.map(l => `• ${l}`).join('\n');
                }

                await sock.sendMessage(targetJid, { text: msgText }, { quoted: msg });

            } else if (action === 'allow' || action === 'permitir' || action === 'add') {
                if (!value) return sock.sendMessage(targetJid, { text: '❌ Especifica el dominio o enlace.\nEjemplo: .antilink add tiktok.com' }, { quoted: msg });

                if (!allowedLinks.includes(value)) {
                    allowedLinks.push(value);
                    await updateGroup(groupId, { settings: { ...settings, antilink, allowedLinks } });
                    await sock.sendMessage(targetJid, { text: `✅ *DOMINIO AGREGADO*\n\nAhora se permiten enlaces que contengan: "${value}"` }, { quoted: msg });
                } else {
                    await sock.sendMessage(targetJid, { text: '⚠️ Ese dominio ya estaba en la lista.' }, { quoted: msg });
                }

            } else if (action === 'block' || action === 'bloquear' || action === 'remove') {
                if (!value) return sock.sendMessage(targetJid, { text: '❌ Especifica el dominio a eliminar.\nEjemplo: .antilink remove tiktok.com' }, { quoted: msg });

                const initialLength = allowedLinks.length;
                allowedLinks = allowedLinks.filter(l => l !== value);

                if (allowedLinks.length < initialLength) {
                    await updateGroup(groupId, { settings: { ...settings, antilink, allowedLinks } });
                    await sock.sendMessage(targetJid, { text: `✅ *DOMINIO ELIMINADO*\n\nSe ha eliminado "${value}" de la lista blanca.` }, { quoted: msg });
                } else {
                    await sock.sendMessage(targetJid, { text: '❌ No se encontró ese dominio en la lista de este grupo.' }, { quoted: msg });
                }

            } else {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, { text: `⚙️ *AYUDA ANTILINK*\n\n.antilink on - Activar\n.antilink off - Desactivar\n.antilink list - Ver configuración\n.antilink add <url> - Permitir un sitio\n.antilink remove <url> - Bloquear un sitio` }, { quoted: msg });
            }

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in antilink command:', error);
            throw error;
        }
    }
};
