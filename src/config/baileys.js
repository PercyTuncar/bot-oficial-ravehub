
const { DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');
const logger = require('../utils/logger');
const pino = require('pino');

const BAILEYS_CONFIG = {
    // printQRInTerminal: true, // Deprecated, we handle it manually in connection.js
    logger: pino({ level: 'silent' }), // Hide internal baileys logs to keep console clean
    auth: undefined, // Set dynamically
    browser: ['RaveHub Bot', 'Chrome', '1.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    markOnlineOnConnect: true,
    retryRequestDelayMs: 250, // Fast retry
    maxRetries: 2,           // Fail fast
};

module.exports = {
    BAILEYS_CONFIG,
    DisconnectReason
};
