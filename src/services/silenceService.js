const { addSilence, removeSilence, getActiveSilences } = require('./database');
const logger = require('../utils/logger');

// In-Memory Cache: Map<"${groupId}_${userId}", expirationTimestamp>
const silenceCache = new Map();

/**
 * Initialize cache from persistence on bot startup
 */
async function initSilenceCache() {
    try {
        const silences = await getActiveSilences();
        const now = Date.now();
        let count = 0;

        for (const s of silences) {
            if (s.expiresAt > now) {
                const key = `${s.groupId}_${s.userId}`;
                silenceCache.set(key, s.expiresAt);
                count++;
            } else {
                // Should clean up specified outdated ones if getActiveSilences returned them slightly delayed
                await removeSilence(s.groupId, s.userId);
            }
        }
        logger.info(`Silence Cache Initialized: ${count} users silenced.`);
    } catch (error) {
        logger.error('Failed to init silence cache:', error);
    }
}

/**
 * Check if a user is silenced
 */
function isSilenced(groupId, userId) {
    if (!groupId || !userId) return false;

    const key = `${groupId}_${userId}`;
    const expiresAt = silenceCache.get(key);

    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
        silenceCache.delete(key);
        removeSilence(groupId, userId).catch(err => logger.error('Bg remove silence error:', err));
        return false;
    }

    return true;
}

/**
 * Silence a user
 */
async function silenceUser(groupId, userId, adminId, durationMinutes) {
    const expiresAt = Date.now() + (durationMinutes * 60 * 1000);
    const key = `${groupId}_${userId}`;

    // Update Cache
    silenceCache.set(key, expiresAt);

    // Update DB
    await addSilence({
        groupId,
        userId,
        silencedBy: adminId,
        expiresAt,
        createdAt: Date.now()
    });

    return expiresAt;
}

/**
 * Unsilence a user (Manual)
 */
async function unsilenceUser(groupId, userId) {
    const key = `${groupId}_${userId}`;
    silenceCache.delete(key);
    await removeSilence(groupId, userId);
}

module.exports = {
    initSilenceCache,
    isSilenced,
    silenceUser,
    unsilenceUser
};
