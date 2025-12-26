/**
 * Text Utility Functions
 * Centralized logic for text extraction and replacement
 */

/**
 * Extract text from various message types
 * @param {object} msg - The Baileys message object
 * @returns {string} The extracted text
 */
function extractMessageText(msg) {
    if (!msg.message) return '';
    return msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        '';
}

/**
 * Extract mentions from a message
 * @param {object} msg - The Baileys message object
 * @returns {string[]} Array of mentioned JIDs
 */
function extractMentions(msg) {
    const extended = msg.message?.extendedTextMessage;
    return extended?.contextInfo?.mentionedJid || [];
}

/**
 * Replace placeholders in a text string
 * Support {user}, {group}, {members}, {count}, #{count}
 * @param {string} text - The original text
 * @param {object} data - Data object containing substitution values
 * @returns {string} The processed text
 */
function replacePlaceholders(text, data) {
    if (!text) return '';
    return text
        .replace(/{user}/g, data.userMention || '@Usuario')
        .replace(/{group}/g, data.groupName || 'este grupo')
        .replace(/{members}/g, data.memberCount || '?')
        .replace(/{count}/g, data.memberCount || '?')  // Alias for members
        .replace(/#{count}/g, data.memberCount || '?'); // Support #{count} format
}

module.exports = {
    extractMessageText,
    extractMentions,
    replacePlaceholders
};
