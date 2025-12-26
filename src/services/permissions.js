require('dotenv').config();

const LEVELS = {
    USER: 0,
    PREMIUM: 1,
    ADMIN: 2,
    OWNER: 3
};

const BOT_OWNER_NUMBER = process.env.BOT_OWNER;

async function getPermissionLevel(msgKey, groupMetadata, isPremiumUser) {
    const sender = msgKey.participant || msgKey.remoteJid;
    const senderNumber = sender.split('@')[0];

    // 1. Owner
    // Check strict number match OR if message is fromMe (automatically owner)
    if (msgKey.fromMe || String(senderNumber).trim() === String(BOT_OWNER_NUMBER).trim()) return LEVELS.OWNER;

    // 2. Admin
    // groupMetadata.participants is array of { id, admin }
    if (groupMetadata) {
        const participant = groupMetadata.participants.find(p => p.id === sender);
        if (participant && (participant.admin === 'admin' || participant.admin === 'superadmin')) {
            return LEVELS.ADMIN;
        }
    }

    // 3. Premium
    if (isPremiumUser) return LEVELS.PREMIUM;

    // 4. User
    return LEVELS.USER;
}

module.exports = {
    LEVELS,
    getPermissionLevel
};
