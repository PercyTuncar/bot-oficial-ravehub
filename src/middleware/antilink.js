const { getPermissionLevel, LEVELS } = require('../services/permissions');
const { updateGroup } = require('../services/database');
const logger = require('../utils/logger');

// Hardcoded safe domains (Always allowed)
const GLOBAL_WHITELIST = [
    'ravehub.pe',
    'www.ravehub.pe',
    'ravehublatam.com',
    'www.ravehublatam.com',
    'instagram.com/ravehub.pe'
];

/**
 * Check if a message contains prohibited links
 */
async function checkAntilink(sock, msg, text, group, senderId, isGroup) {
    if (!isGroup || !group?.active) return false;

    // Check if antilink is enabled
    const antilinkConfig = group.settings?.antilink;
    const isEnabled = typeof antilinkConfig === 'object' ? antilinkConfig.enabled : antilinkConfig === true;

    if (!isEnabled) return false;

    // Check permissions (Admins bypass)
    const isAdmin = await isUserAdmin(sock, msg.key.remoteJid, senderId);
    if (isAdmin) return false;

    // Regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/)/gi;
    const links = text.match(urlRegex);

    if (!links || links.length === 0) return false;

    // Get allowed list from group settings
    const groupWhitelist = group.settings?.allowedLinks || [];
    const fullWhitelist = [...GLOBAL_WHITELIST, ...groupWhitelist];

    let detectedBadLink = false;

    for (const link of links) {
        const lowerLink = link.toLowerCase();

        // Check if link matches any whitelist item
        const isSafe = fullWhitelist.some(allowed => lowerLink.includes(allowed.toLowerCase()));

        if (!isSafe) {
            detectedBadLink = true;
            break;
        }
    }

    if (detectedBadLink) {
        try {
            // Delete message
            await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });

            // Warn User
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🚫 *ENLACE DETECTADO*\n\n@${senderId.split('@')[0]}, los enlaces no están permitidos en este grupo.\n\n✅ Solo se permiten enlaces oficiales de RaveHub.`,
                mentions: [senderId]
            });

            // Optional: Kick logic could go here if strict mode is requested

            return true; // Stop processing further
        } catch (error) {
            logger.error('Error in antilink enforcement:', error);
        }
    }

    return false;
}

// Helper to check admin status efficiently
async function isUserAdmin(sock, groupId, userId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (e) {
        return false;
    }
}

module.exports = { checkAntilink };
