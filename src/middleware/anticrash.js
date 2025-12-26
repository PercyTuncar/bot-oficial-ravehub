const logger = require('../utils/logger');

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Recommended: restart process on unhandled rejection in production
    // process.exit(1); 
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // process.exit(1);
});

logger.info('Anti-crash middleware loaded');
