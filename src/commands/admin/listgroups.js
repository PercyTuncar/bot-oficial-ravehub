const { LEVELS } = require('../../services/permissions');
const { db } = require('../../config/firebase');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'listgroups',
    aliases: ['grupos', 'listargrupos'],
    description: 'Lista todos los grupos donde el bot es miembro',
    requiredLevel: LEVELS.OWNER,
    async execute(sock, msg, args) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            // Fetch all groups where bot is participant (Baileys)
            const allGroups = await sock.groupFetchAllParticipating();
            const groupIds = Object.keys(allGroups);

            if (groupIds.length === 0) {
                await sock.sendMessage(targetJid, {
                    text: '📋 *GRUPOS DISPONIBLES*\n\n❌ El bot no está en ningún grupo.'
                }, { quoted: msg });
                await reactSuccess(sock, targetJid, reactionKey);
                return;
            }

            // Batch fetch all group statuses from Firebase
            let activeGroups = new Set();
            if (groupIds.length > 0) {
                const chunks = [];
                for (let i = 0; i < groupIds.length; i += 30) {
                    chunks.push(groupIds.slice(i, i + 30));
                }

                for (const chunk of chunks) {
                    const snapshot = await db.collection('groups')
                        .where('__name__', 'in', chunk)
                        .where('active', '==', true)
                        .get();
                    snapshot.docs.forEach(doc => activeGroups.add(doc.id));
                }
            }

            // Fetch REAL participant counts using groupMetadata for each group
            // This is more accurate than groupFetchAllParticipating
            const groupsWithCounts = await Promise.all(
                groupIds.map(async (id) => {
                    const metadata = allGroups[id];
                    let participantCount = 0;

                    try {
                        // Get fresh metadata with real participant count
                        const freshMetadata = await sock.groupMetadata(id);
                        participantCount = freshMetadata.participants?.length || 0;
                    } catch (e) {
                        // Fallback to the existing data if fresh fetch fails
                        participantCount = metadata.participants?.length || '?';
                    }

                    return {
                        id,
                        subject: metadata.subject,
                        participantCount,
                        isActive: activeGroups.has(id)
                    };
                })
            );

            let response = '📋 *GRUPOS DISPONIBLES*\n\n';

            groupsWithCounts.forEach((group, index) => {
                response += `━━━━━━━━━━━━━━━━━━━━━━\n${index + 1}️⃣ ${group.subject}\n📌 ID: ${group.id}\n👥 Participantes: ${group.participantCount}\n🤖 Estado: ${group.isActive ? '✅ ACTIVO' : '❌ INACTIVO'}\n`;
            });

            response += '━━━━━━━━━━━━━━━━━━━━━━\n\n💡 Usa: .bot on <ID> para activar\n💡 Usa: .bot off <ID> para desactivar';

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in listgroups:', error);
            throw error;
        }
    }
};
