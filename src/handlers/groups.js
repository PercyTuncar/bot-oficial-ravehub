/**
 * RaveHub WhatsApp Bot - Group Handler
 * 
 * ANTI-BAN COMPLIANT:
 * 1. Random delays before welcome/farewell messages
 * 2. Presence simulation
 */

const path = require('path');
const { getGroup } = require('../services/database');
const { getGroupMetadataCached } = require('../services/cache');
const logger = require('../utils/logger');
const { replacePlaceholders } = require('../utils/textUtils');
const { detectImageUrl, downloadImage } = require('../utils/imageUtils');

// Path to the welcome audio file
const WELCOME_AUDIO_PATH = path.join(__dirname, '../media/Bienvenido.ogg');

// Path to the farewell audio file
const FAREWELL_AUDIO_PATH = path.join(__dirname, '../media/sefue.ogg');

// ANTI-BAN: Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ANTI-BAN: Random delay generator
function getRandomDelay(min = 1000, max = 3000) {
    return Math.random() * (max - min) + min;
}

async function handleGroupUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        // action: 'add', 'remove', 'promote', 'demote'

        logger.debug(`Group update: ${action} in ${id}`);

        // 1. Check if group is active in DB
        const group = await getGroup(id);
        if (!group) {
            return;
        }
        if (!group.active) {
            return;
        }

        // 2. Get fresh group metadata for participant count
        const groupMetadata = await getGroupMetadataCached(sock, id);
        const memberCount = groupMetadata?.participants?.length || group.participants || '?';

        // 3. Welcome (add)
        if (action === 'add') {
            if (group.settings?.welcome?.enabled) {
                const rawMessage = group.settings.welcome.message || '¡Bienvenido {user} a {group}! 🎉';
                const imageUrl = detectImageUrl(rawMessage) || group.settings.welcome.imageUrl;

                for (const item of participants) {
                    const participant = typeof item === 'string' ? item : item?.id;
                    if (!participant) continue;

                    const userMention = `@${participant.split('@')[0]}`;

                    let text = replacePlaceholders(rawMessage, {
                        userMention,
                        groupName: group.name || groupMetadata?.subject || 'este grupo',
                        memberCount: memberCount
                    });

                    // Remove image URL from text if we're sending as image
                    if (imageUrl && text.includes(imageUrl)) {
                        text = text.replace(imageUrl, '').trim();
                    }

                    // ANTI-BAN: Add delay and presence before welcome
                    await delay(getRandomDelay(2000, 4000));
                    try {
                        await sock.sendPresenceUpdate('composing', id);
                    } catch (e) {}
                    await delay(getRandomDelay(1000, 2000));

                    if (imageUrl) {
                        // Try to send as image
                        const imageBuffer = await downloadImage(imageUrl);
                        if (imageBuffer) {
                            await sock.sendMessage(id, {
                                image: imageBuffer,
                                caption: text,
                                mentions: [participant]
                            });
                        } else {
                            // Fallback to URL-based image
                            try {
                                await sock.sendMessage(id, {
                                    image: { url: imageUrl },
                                    caption: text,
                                    mentions: [participant]
                                });
                            } catch (e) {
                                // Final fallback: text only
                                await sock.sendMessage(id, {
                                    text: text,
                                    mentions: [participant]
                                });
                            }
                        }
                    } else {
                        // Text Only
                        await sock.sendMessage(id, {
                            text: text,
                            mentions: [participant]
                        });
                    }

                    // ANTI-BAN: Delay between multiple participants
                    await delay(getRandomDelay(500, 1000));

                    // Send welcome audio after the welcome message
                    // ANTI-BAN: Wait a few seconds before sending the audio
                    await delay(getRandomDelay(3000, 5000));
                    try {
                        await sock.sendPresenceUpdate('recording', id);
                    } catch (e) {}
                    await delay(getRandomDelay(1000, 2000));

                    try {
                        await sock.sendMessage(id, {
                            audio: { url: WELCOME_AUDIO_PATH },
                            mimetype: 'audio/ogg; codecs=opus',
                            ptt: true
                        });
                    } catch (audioError) {
                        logger.error('Error sending welcome audio:', audioError);
                    }
                }
            }
        }

        // 4. Farewell (remove)
        if (action === 'remove') {
            if (group.settings?.farewell?.enabled) {
                const rawMessage = group.settings.farewell.message || 'Adiós {user}, te esperamos de vuelta 👋';
                const imageUrl = detectImageUrl(rawMessage) || group.settings.farewell.imageUrl;

                for (const item of participants) {
                    const participant = typeof item === 'string' ? item : item?.id;
                    if (!participant) continue;

                    const userMention = `@${participant.split('@')[0]}`;

                    let text = replacePlaceholders(rawMessage, {
                        userMention,
                        groupName: group.name || groupMetadata?.subject || 'este grupo',
                        memberCount: memberCount - 1 // Already left
                    });

                    // Remove image URL from text if we're sending as image
                    if (imageUrl && text.includes(imageUrl)) {
                        text = text.replace(imageUrl, '').trim();
                    }

                    // ANTI-BAN: Add delay and presence before farewell
                    await delay(getRandomDelay(2000, 4000));
                    try {
                        await sock.sendPresenceUpdate('composing', id);
                    } catch (e) {}
                    await delay(getRandomDelay(1000, 2000));

                    if (imageUrl) {
                        // Try to send as image
                        const imageBuffer = await downloadImage(imageUrl);
                        if (imageBuffer) {
                            await sock.sendMessage(id, {
                                image: imageBuffer,
                                caption: text,
                                mentions: [participant]
                            });
                        } else {
                            // Fallback to URL-based image
                            try {
                                await sock.sendMessage(id, {
                                    image: { url: imageUrl },
                                    caption: text,
                                    mentions: [participant]
                                });
                            } catch (e) {
                                // Final fallback: text only
                                await sock.sendMessage(id, {
                                    text: text,
                                    mentions: [participant]
                                });
                            }
                        }
                    } else {
                        // Text Only
                        await sock.sendMessage(id, {
                            text: text,
                            mentions: [participant]
                        });
                    }

                    // ANTI-BAN: Delay between multiple participants
                    await delay(getRandomDelay(500, 1000));

                    // Send farewell audio after the farewell message
                    // ANTI-BAN: Wait a few seconds before sending the audio
                    await delay(getRandomDelay(3000, 5000));
                    try {
                        await sock.sendPresenceUpdate('recording', id);
                    } catch (e) {}
                    await delay(getRandomDelay(1000, 2000));

                    try {
                        await sock.sendMessage(id, {
                            audio: { url: FAREWELL_AUDIO_PATH },
                            mimetype: 'audio/ogg; codecs=opus',
                            ptt: true
                        });
                    } catch (audioError) {
                        logger.error('Error sending farewell audio:', audioError);
                    }
                }
            }
        }

    } catch (error) {
        logger.error('Error handling group update:', error);
    }
}

module.exports = {
    handleGroupUpdate,
    replacePlaceholders,
    detectImageUrl,
    downloadImage
};
