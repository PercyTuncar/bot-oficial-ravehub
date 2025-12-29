const { db, admin } = require('../config/firebase');
const logger = require('../utils/logger');

// Collection Names
const USERS_COLLECTION = 'users';
const GROUPS_COLLECTION = 'groups';
const ORDERS_COLLECTION = 'orders';
const SHOP_COLLECTION = 'shop';
const TEMP_BANS_COLLECTION = 'temp_bans';
const SILENCE_COLLECTION = 'silenced_users';

// ============================================
// GLOBAL USER OPERATIONS (Identity Only)
// ============================================

/**
 * Get global user data (identity: name, phone, birthday)
 * This is shared across all groups
 */
async function getUser(userId) {
    try {
        const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
        if (!doc.exists) return null;
        return doc.data();
    } catch (error) {
        logger.error(`Error getting user ${userId}:`, error);
        return null;
    }
}

/**
 * Create global user profile (identity only)
 */
async function createUser(userId, userData) {
    try {
        const initialData = {
            id: userId,
            name: userData.name || 'Unknown',
            phone: userData.phone || userId.split('@')[0],
            birthday: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            ...userData
        };

        await db.collection(USERS_COLLECTION).doc(userId).set(initialData, { merge: true });
        logger.info(`Global user created/updated: ${userId}`);
        return initialData;
    } catch (error) {
        logger.error(`Error creating user ${userId}:`, error);
        throw error;
    }
}

/**
 * Update global user fields (only identity data)
 */
async function updateUser(userId, data) {
    try {
        await db.collection(USERS_COLLECTION).doc(userId).set(data, { merge: true });
    } catch (error) {
        logger.error(`Error updating user ${userId}:`, error);
    }
}

// ============================================
// PER-GROUP MEMBER OPERATIONS (Stats & Economy)
// Path: groups/{groupId}/members/{userId}
// ============================================

/**
 * Get member data for a specific group
 * This contains per-group stats: wallet, bank, warns, kicks, messages, level
 */
async function getMember(groupId, userId) {
    try {
        const doc = await db.collection(GROUPS_COLLECTION)
            .doc(groupId)
            .collection('members')
            .doc(userId)
            .get();

        if (!doc.exists) return null;
        return doc.data();
    } catch (error) {
        logger.error(`Error getting member ${userId} in group ${groupId}:`, error);
        return null;
    }
}

/**
 * Create member in a group with initial stats
 * Called when user sends first message in a group
 */
async function createMember(groupId, userId, memberData = {}) {
    try {
        const initialData = {
            id: userId,
            groupId: groupId,
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: null, // Set to null so the first message triggers isNewDay
            activeDays: 0,
            totalMessages: 0,
            wallet: 0.00,
            bank: 0.00,
            pending: 0.00, // Starts at 0, processBackgroundTasks adds the first $0.01
            debt: 0.00,
            level: 1,
            levelName: 'Youtube',
            warns: [],
            kicks: [],
            ...memberData
        };

        await db.collection(GROUPS_COLLECTION)
            .doc(groupId)
            .collection('members')
            .doc(userId)
            .set(initialData);

        logger.info(`New member created: ${userId} in group ${groupId}`);
        return initialData;
    } catch (error) {
        logger.error(`Error creating member ${userId} in ${groupId}:`, error);
        throw error;
    }
}

/**
 * Update member data in a specific group
 */
async function updateMember(groupId, userId, data) {
    try {
        await db.collection(GROUPS_COLLECTION)
            .doc(groupId)
            .collection('members')
            .doc(userId)
            .update(data);
    } catch (error) {
        logger.error(`Error updating member ${userId} in ${groupId}:`, error);
        throw error;
    }
}

/**
 * Log a message in member's subcollection (per-group)
 * Path: groups/{groupId}/members/{userId}/messages/{messageId}
 */
async function logMessage(groupId, userId, messageData) {
    try {
        await db.collection(GROUPS_COLLECTION)
            .doc(groupId)
            .collection('members')
            .doc(userId)
            .collection('messages')
            .add({
                ...messageData,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        logger.error(`Error logging message for ${userId} in ${groupId}:`, error);
    }
}

/**
 * Get or create member - convenience function
 * Returns existing member or creates new one
 */
async function getOrCreateMember(groupId, userId, userData = {}) {
    let member = await getMember(groupId, userId);

    if (!member) {
        // Global user creation removed to reduce writes.
        // It will be lazily created if commands like .birthday are used.

        member = await createMember(groupId, userId, userData);
    }

    return member;
}

// ============================================
// GROUP OPERATIONS
// ============================================

async function getGroup(groupId) {
    try {
        // Add 5s timeout to prevent hanging indefinitely
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore getGroup timeout')), 5000)
        );

        const docPromise = db.collection(GROUPS_COLLECTION).doc(groupId).get();
        const doc = await Promise.race([docPromise, timeoutPromise]);

        if (!doc.exists) return null;
        return doc.data();
    } catch (error) {
        logger.error(`Error getting group ${groupId}:`, error);
        return null; // Return null on timeout/error so processing can continue (graceful degradation)
    }
}

async function createGroup(groupId, groupData) {
    try {
        const initialData = {
            id: groupId,
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            activatedAt: admin.firestore.FieldValue.serverTimestamp(),
            settings: {
                welcome: { enabled: false, message: "" },
                farewell: { enabled: false, message: "" },
                antilink: false
            },
            ...groupData
        };
        await db.collection(GROUPS_COLLECTION).doc(groupId).set(initialData);
        logger.info(`Group created: ${groupId}`);
        return initialData;
    } catch (error) {
        logger.error(`Error creating group ${groupId}:`, error);
        throw error;
    }
}

async function updateGroup(groupId, data) {
    try {
        await db.collection(GROUPS_COLLECTION).doc(groupId).update(data);
    } catch (error) {
        logger.error(`Error updating group ${groupId}:`, error);
    }
}

async function getPremiumUsers(groupId) {
    try {
        const snapshot = await db.collection(GROUPS_COLLECTION)
            .doc(groupId)
            .collection('premiumUsers')
            .get();

        const now = Date.now();
        return snapshot.docs
            .filter(doc => {
                const data = doc.data();
                // Check if expired
                if (data.expiresAt && data.expiresAt.toMillis() < now) {
                    return false;
                }
                return true;
            })
            .map(doc => doc.id);
    } catch (error) {
        logger.error(`Error fetching premium users for ${groupId}:`, error);
        return [];
    }
}

/**
 * Add or extend premium subscription for a user in a group
 */
async function addPremiumUser(groupId, userId, days = 30) {
    try {
        const userRef = db.collection(GROUPS_COLLECTION)
            .doc(groupId)
            .collection('premiumUsers')
            .doc(userId);

        const doc = await userRef.get();
        let expiresAt = admin.firestore.Timestamp.now();

        // If already premium and not expired, extend
        if (doc.exists) {
            const data = doc.data();
            if (data.expiresAt && data.expiresAt.toMillis() > Date.now()) {
                expiresAt = data.expiresAt;
            }
        }

        // Add days
        const expirationDate = new Date(expiresAt.toMillis() + (days * 24 * 60 * 60 * 1000));
        const newExpiresAt = admin.firestore.Timestamp.fromDate(expirationDate);

        await userRef.set({
            id: userId,
            active: true,
            startedAt: doc.exists ? doc.data().startedAt : admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: newExpiresAt,
            lastRenewed: admin.firestore.FieldValue.serverTimestamp(),
            autoRenew: false // Default to false
        }, { merge: true });

        return expirationDate;
    } catch (error) {
        logger.error(`Error adding premium user ${userId} in ${groupId}:`, error);
        throw error;
    }
}

/**
 * Get detailed premium status for a user
 */
async function getPremiumStatus(groupId, userId) {
    try {
        const doc = await db.collection(GROUPS_COLLECTION)
            .doc(groupId)
            .collection('premiumUsers')
            .doc(userId)
            .get();

        if (!doc.exists) return null;

        const data = doc.data();
        const now = Date.now();
        const isExpired = data.expiresAt ? data.expiresAt.toMillis() < now : true;

        return {
            ...data,
            isExpired,
            daysRemaining: data.expiresAt ? Math.ceil((data.expiresAt.toMillis() - now) / (1000 * 60 * 60 * 24)) : 0
        };
    } catch (error) {
        logger.error(`Error checking premium status for ${userId}:`, error);
        return null;
    }
}

// ============================================
// ORDER OPERATIONS
// ============================================

async function createOrder(orderData) {
    try {
        await db.collection(ORDERS_COLLECTION).doc(orderData.orderId).set({
            ...orderData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        logger.error(`Error creating order:`, error);
        throw error;
    }
}

async function getOrdersByStatus(status, groupId = null) {
    try {
        let query = db.collection(ORDERS_COLLECTION).where('status', '==', status);

        if (groupId) {
            query = query.where('groupId', '==', groupId);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        logger.error('Error fetching orders:', error);
        return [];
    }
}

async function updateOrder(orderId, data) {
    try {
        await db.collection(ORDERS_COLLECTION).doc(orderId).update(data);
    } catch (error) {
        logger.error(`Error updating order ${orderId}:`, error);
        throw error;
    }
}

async function getOrder(orderId) {
    try {
        const doc = await db.collection(ORDERS_COLLECTION).doc(orderId).get();
        if (!doc.exists) return null;
        return doc.data();
    } catch (error) {
        logger.error(`Error getting order ${orderId}:`, error);
        return null;
    }
}

// ============================================
// SHOP OPERATIONS
// ============================================

async function getShopItems() {
    try {
        const doc = await db.collection(SHOP_COLLECTION).doc('inventory').get();
        if (!doc.exists) return [];
        return doc.data().items || [];
    } catch (error) {
        logger.error('Error fetching shop items:', error);
        return [];
    }
}

async function updateShopStock(itemId, decrement = 1) {
    try {
        const doc = await db.collection(SHOP_COLLECTION).doc('inventory').get();
        if (!doc.exists) return false;

        const data = doc.data();
        const items = data.items || [];
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) return false;

        items[itemIndex].stock = Math.max(0, items[itemIndex].stock - decrement);

        await db.collection(SHOP_COLLECTION).doc('inventory').update({ items });
        return true;
    } catch (error) {
        logger.error(`Error updating shop stock:`, error);
        return false;
    }
}

// ============================================
// TEMP BAN OPERATIONS
// ============================================

async function addTempBan(data) {
    try {
        await db.collection(TEMP_BANS_COLLECTION).add(data);
    } catch (error) {
        logger.error('Error adding temp ban:', error);
    }
}

async function getExpiredTempBans() {
    try {
        const now = Date.now();
        const snapshot = await db.collection(TEMP_BANS_COLLECTION)
            .where('unbanAt', '<=', now)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        logger.error('Error fetching expired bans:', error);
        return [];
    }
}

async function removeTempBan(docId) {
    try {
        await db.collection(TEMP_BANS_COLLECTION).doc(docId).delete();
    } catch (error) {
        logger.error(`Error removing ban doc ${docId}:`, error);
    }
}

// ============================================
// SILENCE OPERATIONS
// ============================================

async function addSilence(data) {
    try {
        await db.collection(SILENCE_COLLECTION).doc(`${data.groupId}_${data.userId}`).set(data);
    } catch (error) {
        logger.error('Error adding silence:', error);
    }
}

async function removeSilence(groupId, userId) {
    try {
        await db.collection(SILENCE_COLLECTION).doc(`${groupId}_${userId}`).delete();
    } catch (error) {
        logger.error(`Error removing silence for ${userId}:`, error);
    }
}

async function getActiveSilences() {
    try {
        const now = Date.now();
        const snapshot = await db.collection(SILENCE_COLLECTION)
            .where('expiresAt', '>', now)
            .get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        logger.error('Error fetching active silences:', error);
        return [];
    }
}

module.exports = {
    // Global user (identity)
    getUser,
    createUser,
    updateUser,

    // Per-group member (stats)
    getMember,
    createMember,
    updateMember,
    logMessage,
    getOrCreateMember,

    // Groups
    getGroup,
    createGroup,
    updateGroup,
    getPremiumUsers,
    addPremiumUser,
    getPremiumStatus,

    // Orders
    createOrder,
    getOrdersByStatus,
    updateOrder,
    getOrder,

    // Shop
    getShopItems,
    updateShopStock,

    // Temp Bans
    addTempBan,
    getExpiredTempBans,
    removeTempBan,

    // Silence
    addSilence,
    removeSilence,
    getActiveSilences,

    // Firebase utilities
    FieldValue: admin.firestore.FieldValue
};
