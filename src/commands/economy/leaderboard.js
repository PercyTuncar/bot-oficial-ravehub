const { LEVELS } = require('../../services/permissions');
const { db } = require('../../config/firebase'); // Direct DB access needed for querying collection
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'top', 'ranking', 'rich'],
    description: 'Muestra el top de usuarios con más dinero',
    requiredLevel: LEVELS.USER,
    async execute(sock, msg, args, { groupId, isGroup }) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            if (!isGroup) return sock.sendMessage(targetJid, { text: '❌ Solo en grupos.' }, { quoted: msg });

            await reactProcessing(sock, targetJid, reactionKey);

            // Fetch all members of this group
            // Note: In a massive production app this should be limited or paginated.
            // For now, assuming <1000 active members per group, verifying client-side is acceptable or query ordering.
            // Firestore composite indexes might be needed for server-side order. Client-side sort is safer to avoid index errors initially.

            const snapshot = await db.collection('groups').doc(groupId).collection('members').get();

            if (snapshot.empty) {
                return sock.sendMessage(targetJid, { text: '⚠️ No hay datos para mostrar.' }, { quoted: msg });
            }

            const members = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'Desconocido',
                    netWorth: (data.wallet || 0) + (data.bank || 0),
                    level: data.level || 1
                };
            });

            // Sort by Net Worth Descending
            members.sort((a, b) => b.netWorth - a.netWorth);

            // Get Top 10
            const top10 = members.slice(0, 10);

            let text = `🏆 *TABLA DE LÍDERES (TOP 10)*\n\n`;

            top10.forEach((m, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                text += `${medal} *${m.name}*\n   💰 $${m.netWorth.toFixed(2)} (Nivel ${m.level})\n`;
            });

            text += `\n━━━━━━━━━━━━━━━━━━━━━━\n💡 Sigue participando para subir en el ranking.`;

            await sock.sendMessage(targetJid, { text }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);

        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in leaderboard:', error);
            throw error;
        }
    }
};
