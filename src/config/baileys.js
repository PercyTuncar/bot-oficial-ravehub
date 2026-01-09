/**
 * Baileys Configuration - Optimized for Stability and Anti-Ban
 * 
 * CRITICAL: This config follows Baileys v7 best practices for 24/7 operation.
 * Changes here affect stability, detection risk, and resource usage.
 */

const { DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const path = require('path');
const logger = require('../utils/logger');
const pino = require('pino');

/**
 * WA VERSION CONFIGURATION
 * Fallback version if fetchLatestBaileysVersion fails
 * Format: [major, minor, patch] e.g. [2, 2413, 51]
 */
const WA_VERSION_FALLBACK = [2, 2413, 51];

/**
 * Browser fingerprint configuration
 * Using macOS Desktop simulates legitimate desktop traffic
 * Avoids detection patterns associated with custom/bot browsers
 */
const BROWSER_CONFIG = Browsers.macOS('Desktop');

const BAILEYS_CONFIG = {
    // ===== IDENTITY & FINGERPRINT =====
    browser: BROWSER_CONFIG,                    // Legitimate browser fingerprint
    // version is set dynamically in connection.js
    
    // ===== LOGGING =====
    logger: pino({ level: 'warn' }),            // Reduce noise, only warnings+
    
    // ===== CONNECTION SETTINGS =====
    connectTimeoutMs: 60000,                    // 60s connection timeout
    defaultQueryTimeoutMs: 0,                   // No timeout for queries (prevents premature disconnects)
    keepAliveIntervalMs: 25000,                 // Keep-alive every 25s (within WhatsApp's tolerance)
    qrTimeout: 40000,                           // QR code timeout 40s
    
    // ===== BEHAVIOR FLAGS =====
    emitOwnEvents: true,                        // Emit events for own messages
    markOnlineOnConnect: false,                 // DON'T auto mark online (reduces footprint)
    syncFullHistory: false,                     // Don't sync history (faster startup, less suspicious)
    
    // ===== RETRY SETTINGS =====
    retryRequestDelayMs: 500,                   // 500ms between retries (not too aggressive)
    maxMsgRetryCount: 3,                        // Max message send retries
    
    // ===== ANTI-DETECTION =====
    generateHighQualityLinkPreview: false,      // Disable link previews (reduces API calls)
    
    // ===== AUTH (Set dynamically in connection.js) =====
    auth: undefined,
};

/**
 * Disconnect reasons that require immediate reconnection (not exit)
 * These are transient errors that don't indicate session invalidation
 */
const RECONNECT_REASONS = [
    DisconnectReason.connectionClosed,          // 428 - Generic close
    DisconnectReason.connectionLost,            // 408 - Connection lost
    DisconnectReason.connectionReplaced,        // 440 - Another device connected
    DisconnectReason.timedOut,                  // 408 - Timeout
    DisconnectReason.restartRequired,           // 515 - Server restart
    // 503 - Service unavailable (handled separately)
];

/**
 * Disconnect reasons that require session reset (logged out)
 */
const LOGOUT_REASONS = [
    DisconnectReason.loggedOut,                 // 401 - Session invalidated
    DisconnectReason.badSession,                // 500 - Bad session
];

module.exports = {
    BAILEYS_CONFIG,
    WA_VERSION_FALLBACK,
    BROWSER_CONFIG,
    DisconnectReason,
    RECONNECT_REASONS,
    LOGOUT_REASONS
};
