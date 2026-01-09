/**
 * RaveHub WhatsApp Bot - Anti-Crash Middleware
 * 
 * Handles uncaught exceptions and unhandled promise rejections
 * to prevent unexpected process termination.
 * 
 * CRITICAL: Do NOT exit on errors unless absolutely necessary.
 * Let PM2 handle restarts for fatal errors only.
 */

const logger = require('../utils/logger');

// Track error frequency to detect crash loops
const errorTracker = {
    count: 0,
    lastReset: Date.now(),
    threshold: 10,           // Max errors per window
    windowMs: 60000          // 1 minute window
};

function trackError() {
    const now = Date.now();
    
    // Reset counter if window expired
    if (now - errorTracker.lastReset > errorTracker.windowMs) {
        errorTracker.count = 0;
        errorTracker.lastReset = now;
    }
    
    errorTracker.count++;
    
    // If too many errors in window, it's a crash loop - exit for PM2
    if (errorTracker.count > errorTracker.threshold) {
        logger.error(`CRASH LOOP DETECTED: ${errorTracker.count} errors in ${errorTracker.windowMs}ms. Exiting for PM2 restart.`);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    trackError();
    
    // Log the error with full stack trace
    const errorMessage = reason instanceof Error 
        ? reason.stack || reason.message 
        : String(reason);
    
    logger.error('Unhandled Promise Rejection:', errorMessage);
    
    // Don't exit - let the application continue
    // Only fatal errors should cause exit
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    trackError();
    
    logger.error('Uncaught Exception:', error.stack || error.message || error);
    
    // Check if it's a fatal error that requires restart
    const fatalErrors = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'EAI_AGAIN',
        'EPIPE',
        'ERR_STREAM_DESTROYED'
    ];
    
    const isFatal = fatalErrors.some(code => 
        error.code === code || 
        error.message?.includes(code)
    );
    
    if (isFatal) {
        logger.error('Fatal network error detected. Exiting for PM2 restart...');
        process.exit(1);
    }
    
    // For non-fatal errors, continue running
});

// Handle warning events (memory leaks, deprecations)
process.on('warning', (warning) => {
    logger.warn(`Process Warning: ${warning.name} - ${warning.message}`);
    
    // Log stack for memory leak warnings
    if (warning.name === 'MaxListenersExceededWarning') {
        logger.warn('Possible memory leak detected:', warning.stack);
    }
});

// Graceful shutdown handlers
process.on('SIGINT', () => {
    logger.info('Received SIGINT. Graceful shutdown...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM. Graceful shutdown...');
    process.exit(0);
});

logger.info('Anti-crash middleware loaded with enhanced error handling');
