/**
 * RaveHub WhatsApp Bot Entry Point
 * 
 * This file initializes the application, starting the express server for health checks
 * and initiating the Baileys WhatsApp connection handler.
 */

require('dotenv').config();
const express = require('express');
const { startBot } = require('./src/handlers/connection');
const logger = require('./src/utils/logger');
require('./src/middleware/anticrash'); // Load anti-crash handlers immediately

// --- Express Server for Health Checks & Keeping PM2 Happy ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage()
    });
});

app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
});

// --- Start WhatsApp Bot ---
logger.info('Starting RaveHub WhatsApp Bot...');
startBot().catch(err => {
    logger.error('Fatal error starting bot:', err);
});
