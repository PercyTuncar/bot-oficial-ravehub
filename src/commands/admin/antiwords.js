const { LEVELS } = require('../../services/permissions');
const { updateGroup, getGroup } = require('../../services/database');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'antiwords',
    aliases: ['badwords', 'prohibitedwords', 'palabrasprohibidas'],
    description: 'Configura el sistema de palabras prohibidas',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args, { groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) {
                return sock.sendMessage(targetJid, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
            }

            const action = args[0]?.toLowerCase();
            const value = args.slice(1).join(' ');

            await reactProcessing(sock, targetJid, reactionKey);

            const group = await getGroup(groupId);
            let settings = group.settings || {};
            let antiwords = settings.antiwords || { enabled: false, words: [] };

            // Ensure object structure
            if (!Array.isArray(antiwords.words)) antiwords.words = [];
            if (typeof antiwords.enabled === 'undefined') antiwords.enabled = false;

            if (action === 'on' || action === 'enable' || action === 'activar') {
                antiwords.enabled = true;
                await updateGroup(groupId, { settings: { ...settings, antiwords } });
                await sock.sendMessage(targetJid, { text: '✅ *ANTIWORDS ACTIVADO*\n\nEl bot eliminará mensajes con palabras prohibidas y advertirá al usuario.' }, { quoted: msg });

            } else if (action === 'off' || action === 'disable' || action === 'desactivar') {
                antiwords.enabled = false;
                await updateGroup(groupId, { settings: { ...settings, antiwords } });
                await sock.sendMessage(targetJid, { text: '⚠️ *ANTIWORDS DESACTIVADO*\n\nSe permiten todas las palabras.' }, { quoted: msg });

            } else if (action === 'list' || action === 'lista') {
                let msgText = `🤬 *PALABRAS PROHIBIDAS*\n\nEstado: ${antiwords.enabled ? '✅ ACTIVADO' : '❌ DESACTIVADO'}\n\n📝 *Lista:*\n`;

                if (antiwords.words.length === 0) {
                    msgText += '_(Ninguna configurada)_';
                } else {
                    msgText += antiwords.words.map(w => `• ${w}`).join('\n');
                }

                await sock.sendMessage(targetJid, { text: msgText }, { quoted: msg });

            } else if (action === 'add' || action === 'agregar') {
                if (!value) return sock.sendMessage(targetJid, { text: '❌ Especifica las palabras separadas por comas.\nEjemplo: .antiwords add tonto, estufa, frase larga' }, { quoted: msg });

                // Split by comma and trim
                const newWords = value.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
                let addedCount = 0;

                for (const word of newWords) {
                    if (!antiwords.words.includes(word)) {
                        antiwords.words.push(word);
                        addedCount++;
                    }
                }

                if (addedCount > 0) {
                    await updateGroup(groupId, { settings: { ...settings, antiwords } });
                    await sock.sendMessage(targetJid, { text: `✅ *PALABRAS AGREGADAS*\n\nSe han añadido ${addedCount} palabras/frases a la lista negra.` }, { quoted: msg });
                } else {
                    await sock.sendMessage(targetJid, { text: '⚠️ Las palabras ya estaban en la lista.' }, { quoted: msg });
                }

            } else if (action === 'remove' || action === 'eliminar') {
                if (!value) return sock.sendMessage(targetJid, { text: '❌ Especifica la palabra a eliminar.\nEjemplo: .antiwords remove tonto' }, { quoted: msg });

                const wordToRemove = value.trim().toLowerCase();
                const initialLength = antiwords.words.length;

                antiwords.words = antiwords.words.filter(w => w !== wordToRemove);

                if (antiwords.words.length < initialLength) {
                    await updateGroup(groupId, { settings: { ...settings, antiwords } });
                    await sock.sendMessage(targetJid, { text: `✅ *PALABRA ELIMINADA*\n\nSe ha eliminado "${wordToRemove}" de la lista.` }, { quoted: msg });
                } else {
                    await sock.sendMessage(targetJid, { text: '❌ No se encontró esa palabra en la lista.' }, { quoted: msg });
                }

            } else {
                await reactError(sock, targetJid, reactionKey);
                return sock.sendMessage(targetJid, {
                    text: `⚙️ *AYUDA ANTIWORDS*\n\n.antiwords on - Activar\n.antiwords off - Desactivar\n.antiwords list - Ver lista\n.antiwords add <p1, p2...> - Agregar palabras\n.antiwords remove <palabra> - Eliminar palabra`
                }, { quoted: msg });
            }

            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in antiwords command:', error);
            throw error;
        }
    }
};
