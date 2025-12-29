const { getMember, updateMember, getOrCreateMember } = require('../services/database');
const logger = require('../utils/logger');

/**
 * Check if a message contains prohibited words
 */
async function checkAntiwords(sock, msg, text, group, senderId, isGroup) {
    if (!isGroup || !group?.active) return false;

    // Check configuration
    const settings = group.settings || {};
    const antiwords = settings.antiwords;

    // If disabled or not configured, pass
    if (!antiwords || !antiwords.enabled || !antiwords.words || antiwords.words.length === 0) {
        return false;
    }

    // Check permissions (Admins usually bypass, but requirements said "identify user" - assuming strict unless admin)
    // Best practice: Admins usually bypass auto-mod 
    const isUserAdmin = await isAdmin(sock, msg.key.remoteJid, senderId);
    if (isUserAdmin) return false;

    // Check for bad words
    const lowerText = text.toLowerCase();
    const foundWord = antiwords.words.find(word => lowerText.includes(word.toLowerCase()));

    if (foundWord) {
        logger.info(`Antiwords triggered by ${senderId} in ${group.id}: ${foundWord}`);

        try {
            // 1. Delete message
            await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });

            // 2. Warn User
            let member = await getMember(group.id, senderId);
            if (!member) {
                member = await getOrCreateMember(group.id, senderId, { name: 'Unknown' });
            }

            const currentWarns = member.warns || [];
            const newWarn = {
                motivo: `Palabra prohibida: ${foundWord}`,
                admin: 'Sistema (AntiWords)',
                fecha: new Date().toISOString()
            };
            currentWarns.push(newWarn);

            // Update user warnings
            await updateMember(group.id, senderId, { warns: currentWarns });

            const warnCount = currentWarns.length;

            // 3. Logic for Ban if 3 warns (Consistent with warn.js)
            if (warnCount >= 3) {
                try {
                    await sock.groupParticipantsUpdate(group.id, [senderId], 'remove');

                    // Record kick
                    const currentKicks = member.kicks || [];
                    currentKicks.push({
                        motivo: 'Límite de advertencias alcanzado (AntiWords)',
                        admin: 'Sistema',
                        fecha: new Date().toISOString()
                    });

                    // Reset warns on kick
                    await updateMember(group.id, senderId, { kicks: currentKicks, warns: [] });

                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `🚫 *LÍMITE DE ADVERTENCIAS ALCANZADO*\n\n@${senderId.split('@')[0]} ha usado una palabra prohibida y sumó su 3ra advertencia.\n━━━━━━━━━━━━━━━━━━━━━━\n📝 Palabra: ${foundWord}\n⚠️ advertencias: 3/3\n━━━━━━━━━━━━━━━━━━━━━━\n🚪 EXPULSANDO DEL GRUPO...`,
                        mentions: [senderId]
                    });
                } catch (kickError) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `🚫 *ACCIÓN REQUERIDA*\n\n@${senderId.split('@')[0]} debería ser expulsado (3/3 advertencias) por usar palabras prohibidas, pero no tengo permisos de admin.`,
                        mentions: [senderId]
                    });
                }
            } else {
                const warningLevel = warnCount === 2 ? '\n🚨 ÚLTIMA ADVERTENCIA\nUna más y serás expulsado.' : '';

                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🚫 *PALABRA PROHIBIDA DETECTADA*\n\n@${senderId.split('@')[0]}, esa expresión no está permitida aquí.\n━━━━━━━━━━━━━━━━━━━━━━\n📝 Palabra: "${foundWord}"\n⚠️ Advertencia agregada: ${warnCount}/3\n━━━━━━━━━━━━━━━━━━━━━━${warningLevel}`,
                    mentions: [senderId]
                });
            }

            return true; // Stop processing

        } catch (error) {
            logger.error('Error in antiwords enforcement:', error);
        }
    }

    return false;
}

// Helper to check admin status
async function isAdmin(sock, groupId, userId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (e) {
        return false;
    }
}

module.exports = { checkAntiwords };
