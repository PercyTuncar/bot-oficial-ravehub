/**
 * Image Utility Functions
 * Centralized logic for image handling
 */
const axios = require('axios');
const logger = require('./logger');

/**
 * Detect if text contains an image URL
 * @param {string} text - Text to check
 * @returns {string|null} The first found image URL or null
 */
function detectImageUrl(text) {
    if (!text) return null;
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = text.match(urlRegex) || [];

    for (const url of urls) {
        const cleanUrl = url.replace(/[.,!?;:)]+$/, ''); // Remove trailing punctuation
        if (imageExtensions.some(ext => cleanUrl.toLowerCase().includes(ext))) {
            return cleanUrl;
        }
    }
    return null;
}

/**
 * Download image from URL as a buffer
 * @param {string} url - Image URL
 * @returns {Promise<Buffer|null>} Image buffer or null on failure
 */
async function downloadImage(url) {
    if (!url) return null;
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 5000, // Reduced timeout for speed (fail fast)
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return Buffer.from(response.data);
    } catch (error) {
        logger.error(`Failed to download image: ${error.message}`);
        return null;
    }
}

module.exports = {
    detectImageUrl,
    downloadImage
};
