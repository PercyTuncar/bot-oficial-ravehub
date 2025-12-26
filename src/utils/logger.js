/**
 * Winston-based Logger
 * Structured logging with file and console transports
 */
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Try to use winston if available, fallback to console
let logger;

try {
    const winston = require('winston');

    logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                let metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                return `${timestamp} [${level.toUpperCase()}] ${message} ${metaStr}`;
            })
        ),
        transports: [
            // Console output
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }),
            // Error log file
            new winston.transports.File({
                filename: path.join(logsDir, 'error.log'),
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            }),
            // Combined log file
            new winston.transports.File({
                filename: path.join(logsDir, 'combined.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5
            })
        ]
    });

    console.log('[LOGGER] Winston logger initialized');
} catch (e) {
    // Fallback to simple console logger if winston not installed
    console.log('[LOGGER] Using fallback console logger');

    const timestamp = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

    logger = {
        info: (msg, ...args) => console.log(`${timestamp()} [INFO] ${msg}`, ...args),
        warn: (msg, ...args) => console.warn(`${timestamp()} [WARN] ${msg}`, ...args),
        error: (msg, ...args) => console.error(`${timestamp()} [ERROR] ${msg}`, ...args),
        debug: (msg, ...args) => console.debug(`${timestamp()} [DEBUG] ${msg}`, ...args)
    };
}

module.exports = logger;
