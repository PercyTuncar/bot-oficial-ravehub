/**
 * Rate Limiting Middleware
 * Prevents command spam with per-user and per-command cooldowns
 */

// Store for rate limiting
// Key: commandName:userId, Value: last execution timestamp
const commandCooldowns = new Map();

// Global rate limit (any message)
const globalRateLimit = new Map();

// Default cooldowns in seconds per command type
const COMMAND_COOLDOWNS = {
    // Fast commands (minimal cooldown)
    'ping': 2,
    'me': 3,
    'info': 3,
    'shop': 3,

    // Economy commands (moderate cooldown to prevent spam)
    'deposit': 3,
    'withdraw': 3,
    'buy': 5,

    // Games (prevent rapid gambling)
    'slot': 5,
    'flip': 5,
    'dice': 5,
    'coinflip': 5,

    // Risk commands (longer cooldown)
    'rob': 30,
    'robar': 30,

    // Admin commands (moderate)
    'kick': 5,
    'warn': 5,
    'deliver': 3,
    'reject': 3,

    // Default for unlisted commands
    'default': 2
};

// Global rate limit threshold (messages per second)
const GLOBAL_RATE_LIMIT_MS = 500; // 500ms between any action

/**
 * Check if user is rate limited globally
 * @param {string} userId - User ID
 * @returns {boolean} True if allowed, false if rate limited
 */
function checkRateLimit(userId) {
    const now = Date.now();
    const lastAction = globalRateLimit.get(userId);

    if (lastAction && (now - lastAction) < GLOBAL_RATE_LIMIT_MS) {
        return false;
    }

    globalRateLimit.set(userId, now);
    return true;
}

/**
 * Check command-specific rate limit
 * @param {string} userId - User ID
 * @param {string} commandName - Command name
 * @returns {{allowed: boolean, remaining: number}} Result object
 */
function checkCommandCooldown(userId, commandName) {
    const now = Date.now();
    const key = `${commandName}:${userId}`;
    const cooldownSeconds = COMMAND_COOLDOWNS[commandName] || COMMAND_COOLDOWNS.default;
    const cooldownMs = cooldownSeconds * 1000;

    const lastUsed = commandCooldowns.get(key);

    if (lastUsed) {
        const timePassed = now - lastUsed;

        if (timePassed < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - timePassed) / 1000);
            return { allowed: false, remaining };
        }
    }

    commandCooldowns.set(key, now);
    return { allowed: true, remaining: 0 };
}

/**
 * Clean up old entries to prevent memory leaks
 * Call periodically
 */
function cleanupRateLimits() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute

    for (const [key, timestamp] of commandCooldowns.entries()) {
        if (now - timestamp > maxAge) {
            commandCooldowns.delete(key);
        }
    }

    for (const [key, timestamp] of globalRateLimit.entries()) {
        if (now - timestamp > maxAge) {
            globalRateLimit.delete(key);
        }
    }
}

// Run cleanup every minute
setInterval(cleanupRateLimits, 60000);

module.exports = {
    checkRateLimit,
    checkCommandCooldown,
    cleanupRateLimits,
    COMMAND_COOLDOWNS
};
