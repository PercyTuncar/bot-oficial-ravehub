const { LEVELS } = require('../../services/permissions');
const { normalizeJidForSend, createReactionKey, reactProcessing, reactSuccess, reactError } = require('../../utils/commandUtils');
const { getCacheStats } = require('../../services/cache');

module.exports = {
    name: 'ping',
    description: 'Verifica latencia y estado del servidor',
    requiredLevel: LEVELS.ADMIN,
    async execute(sock, msg, args) {
        const targetJid = normalizeJidForSend(msg.key.remoteJid, sock, msg.key.fromMe);
        const reactionKey = createReactionKey(msg.key);

        try {
            await reactProcessing(sock, targetJid, reactionKey);

            // Measure actual WhatsApp API latency
            const start = Date.now();
            await sock.presenceSubscribe(targetJid);
            const latency = Date.now() - start;

            // Server stats
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const memTotal = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);

            // Cache stats
            let cacheInfo = '';
            try {
                const stats = getCacheStats();
                cacheInfo = `\n📦 Cache: ${stats.groups.keys || 0} grupos | ${stats.users.keys || 0} usuarios`;
            } catch (e) {
                cacheInfo = '';
            }

            const response = `🏓 *PONG!*

⚡ Latencia: ${latency}ms
🖥️ Servidor: AWS EC2
💚 Estado: ONLINE
⏰ Uptime: ${hours}h ${minutes}m ${seconds}s
💾 Memoria: ${memUsed}MB / ${memTotal}MB
🔥 Firebase: Conectado${cacheInfo}
━━━━━━━━━━━━━━━━━━━━━━
📊 Node: ${process.version}
🤖 Bot: RaveHub v1.0`;

            await sock.sendMessage(targetJid, { text: response }, { quoted: msg });
            await reactSuccess(sock, targetJid, reactionKey);
        } catch (error) {
            await reactError(sock, targetJid, reactionKey);
            console.error('Error in ping:', error);
            throw error;
        }
    }
};
