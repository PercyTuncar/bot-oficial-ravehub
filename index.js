/**
 * RaveHub WhatsApp Bot Entry Point
 * 
 * PRODUCTION-OPTIMIZED for 24/7 operation with PM2.
 * Includes health checks, graceful shutdown, and PM2 ready signal.
 */

require('dotenv').config();
const express = require('express');
const { startBot } = require('./src/handlers/connection');
const logger = require('./src/utils/logger');
require('./src/middleware/anticrash'); // Load anti-crash handlers immediately

// --- Express Server for Health Checks ---
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint for PM2/load balancers
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        version: require('./package.json').version
    });
});

// Ready check endpoint
app.get('/ready', (req, res) => {
    res.status(200).json({ ready: true });
});

const server = app.listen(PORT, () => {
    logger.info(`Health server listening on port ${PORT}`);
});

// --- Graceful Shutdown Handler ---
async function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    // Close HTTP server
    server.close(() => {
        logger.info('HTTP server closed');
    });
    
    // Give time for cleanup
    setTimeout(() => {
        logger.info('Shutdown complete');
        process.exit(0);
    }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// --- Start WhatsApp Bot ---
logger.info('Starting RaveHub WhatsApp Bot...');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Node.js version: ${process.version}`);

startBot()
    .then(() => {
        logger.info('Bot startup sequence completed');
        
        // Send ready signal to PM2 (for wait_ready: true)
        if (process.send) {
            process.send('ready');
            logger.info('PM2 ready signal sent');
        }
    })
    .catch(err => {
        logger.error('Fatal error starting bot:', err);
        process.exit(1);
    });
