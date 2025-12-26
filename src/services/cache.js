/**
 * Group Cache Service
 * Caches group metadata to avoid repeated API calls
 */
const NodeCache = require('node-cache');

// Cache with 5 minute TTL, check every 2 minutes
const groupCache = new NodeCache({
    stdTTL: 300,        // 5 minutes default
    checkperiod: 120,   // Check for expired keys every 2 min
    useClones: false    // Don't clone for performance
});

// User cache for frequently accessed user data
const userCache = new NodeCache({
    stdTTL: 60,         // 1 minute for user data (changes more often)
    checkperiod: 30,
    useClones: false
});

/**
 * Get cached group metadata
 * @param {string} jid - Group JID
 * @returns {object|undefined} Cached metadata or undefined
 */
function getCachedGroup(jid) {
    return groupCache.get(jid);
}

/**
 * Set group metadata in cache
 * @param {string} jid - Group JID
 * @param {object} metadata - Group metadata
 * @param {number} ttl - Optional TTL override in seconds
 */
function setCachedGroup(jid, metadata, ttl = 300) {
    groupCache.set(jid, metadata, ttl);
}

/**
 * Invalidate a group's cache (on updates)
 * @param {string} jid - Group JID
 */
function invalidateGroup(jid) {
    groupCache.del(jid);
}

/**
 * Update participant count without refetching all metadata
 * @param {string} jid - Group JID
 * @param {number} delta - Change in participants (+1 or -1)
 */
function updateGroupParticipants(jid, delta) {
    const cached = groupCache.get(jid);
    if (cached && cached.participants) {
        cached.participants = cached.participants.length + delta;
        groupCache.set(jid, cached);
    }
}

/**
 * Get group metadata with caching
 * @param {object} sock - Baileys socket
 * @param {string} jid - Group JID
 * @returns {Promise<object>} Group metadata
 */
async function getGroupMetadataCached(sock, jid) {
    let metadata = groupCache.get(jid);

    if (!metadata) {
        try {
            metadata = await sock.groupMetadata(jid);
            groupCache.set(jid, metadata);
        } catch (error) {
            console.error(`Failed to fetch group metadata for ${jid}:`, error.message);
            return null;
        }
    }

    return metadata;
}

// --- User Cache Functions ---

function getCachedUser(userId) {
    return userCache.get(userId);
}

function setCachedUser(userId, userData, ttl = 60) {
    userCache.set(userId, userData, ttl);
}

function invalidateUser(userId) {
    userCache.del(userId);
}

// --- Stats ---

function getCacheStats() {
    return {
        groups: groupCache.getStats(),
        users: userCache.getStats()
    };
}

module.exports = {
    getCachedGroup,
    setCachedGroup,
    invalidateGroup,
    updateGroupParticipants,
    getGroupMetadataCached,
    getCachedUser,
    setCachedUser,
    invalidateUser,
    getCacheStats,
    groupCache,
    userCache
};
