const admin = require('firebase-admin');
const logger = require('../utils/logger');
require('dotenv').config();

try {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined
    };

    if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
        logger.warn('Firebase credentials not found in .env. Database features will fail.');
    } else {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        logger.info('Firebase initialized successfully');
    }
} catch (error) {
    logger.error('Error initializing Firebase:', error);
}

const db = admin.firestore();
module.exports = { admin, db };
