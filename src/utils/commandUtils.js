/**
 * Command Utilities
 * Shared helper functions for all bot commands
 * 
 * BAILEYS v7 COMPLIANT: Includes LID handling
 */

/**
 * Normalizes a JID for sending messages.
 * Handles LID (@lid) format conversion to @s.whatsapp.net
 * @param {string} remoteJid - The original JID
 * @param {object} sock - The Baileys socket
 * @param {boolean} isFromMe - Whether the message is from the bot itself
 * @returns {string} The normalized JID
 */
function normalizeJidForSend(remoteJid, sock, isFromMe) {
    // Handle LID format (Baileys v7)
    if (remoteJid && remoteJid.endsWith('@lid')) {
        // For self messages, use the bot's phone number
        if (isFromMe && sock?.user?.id) {
            const botNumber = sock.user.id.split(':')[0];
            return `${botNumber}@s.whatsapp.net`;
        }
        // For other LIDs, try to resolve from connection handler
        try {
            const { resolveLidToPhone } = require('../handlers/connection');
            const resolved = resolveLidToPhone(remoteJid);
            if (resolved && resolved !== remoteJid) {
                return resolved;
            }
        } catch (e) {
            // Fallback: return as-is
        }
    }
    return remoteJid;
}

/**
 * Check if a JID is a phone number JID (not LID or group)
 * @param {string} jid - The JID to check
 * @returns {boolean} True if phone number JID
 */
function isPhoneJid(jid) {
    if (!jid) return false;
    return jid.endsWith('@s.whatsapp.net');
}

/**
 * Check if a JID is a LID (Linked Identity)
 * @param {string} jid - The JID to check
 * @returns {boolean} True if LID
 */
function isLidJid(jid) {
    if (!jid) return false;
    return jid.endsWith('@lid');
}

/**
 * Check if a JID is a group
 * @param {string} jid - The JID to check
 * @returns {boolean} True if group JID
 */
function isGroupJid(jid) {
    if (!jid) return false;
    return jid.endsWith('@g.us');
}

/**
 * Extract phone number from any JID format
 * @param {string} jid - The JID
 * @returns {string} Phone number without suffix
 */
function extractPhoneNumber(jid) {
    if (!jid) return '';
    return jid.split('@')[0].split(':')[0];
}

/**
 * Creates a reaction key object for message reactions
 * @param {object} msgKey - The original message key
 * @returns {object} The reaction key
 */
function createReactionKey(msgKey) {
    return {
        remoteJid: msgKey.remoteJid,
        fromMe: msgKey.fromMe,
        id: msgKey.id,
        participant: msgKey.participant
    };
}

/**
 * Sends a processing reaction (⏳)
 */
async function reactProcessing(sock, targetJid, reactionKey) {
    try {
        await sock.sendMessage(targetJid, {
            react: { text: '⏳', key: reactionKey }
        });
    } catch (e) {
        // Silent catch
    }
}

/**
 * Sends a success reaction (✅)
 */
async function reactSuccess(sock, targetJid, reactionKey) {
    try {
        await sock.sendMessage(targetJid, {
            react: { text: '✅', key: reactionKey }
        });
    } catch (e) {
        // Silent catch
    }
}

/**
 * Sends an error reaction (❌)
 */
async function reactError(sock, targetJid, reactionKey) {
    try {
        await sock.sendMessage(targetJid, {
            react: { text: '❌', key: reactionKey }
        });
    } catch (e) {
        // Silent catch
    }
}

module.exports = {
    normalizeJidForSend,
    isPhoneJid,
    isLidJid,
    isGroupJid,
    extractPhoneNumber,
    createReactionKey,
    reactProcessing,
    reactSuccess,
    reactError
};
