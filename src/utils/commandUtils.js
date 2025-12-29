/**
 * Command Utilities
 * Shared helper functions for all bot commands
 */

/**
 * Normalizes a JID for sending messages.
 * Converts @lid format to @s.whatsapp.net using sock.user.id for self-messages.
 * @param {string} remoteJid - The original JID
 * @param {object} sock - The Baileys socket
 * @param {boolean} isFromMe - Whether the message is from the bot itself
 * @returns {string} The normalized JID
 */
function normalizeJidForSend(remoteJid, sock, isFromMe) {
    if (remoteJid.endsWith('@lid') && isFromMe) {
        const botNumber = sock.user.id.split(':')[0];
        return `${botNumber}@s.whatsapp.net`;
    }
    return remoteJid;
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
        console.error('Failed to react processing:', e.message);
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
        console.error('Failed to react success:', e.message);
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
        // Silent catch for errors
    }
}

module.exports = {
    normalizeJidForSend,
    createReactionKey,
    reactProcessing,
    reactSuccess,
    reactError
};
