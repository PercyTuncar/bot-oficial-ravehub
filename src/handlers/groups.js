const { getGroup } = require('../services/database');
const { getGroupMetadataCached } = require('../services/cache');
const logger = require('../utils/logger');
const { replacePlaceholders } = require('../utils/textUtils');
const { detectImageUrl, downloadImage } = require('../utils/imageUtils');

async function handleGroupUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        // action: 'add', 'remove', 'promote', 'demote'

        // 1. Check if group is active in DB
        const group = await getGroup(id);
        if (!group) return;
        if (!group.active) return;

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
                }
            }
        }

        // 4. Farewell (remove)
        if (action === 'remove') {
            if (group.settings?.farewell?.enabled) {
                const rawMessage = group.settings.farewell.message || 'Adiós {user}, te esperamos de vuelta 👋';

                for (const item of participants) {
                    const participant = typeof item === 'string' ? item : item?.id;
                    if (!participant) continue;

                    const userMention = `@${participant.split('@')[0]}`;

                    let text = replacePlaceholders(rawMessage, {
                        userMention,
                        groupName: group.name || groupMetadata?.subject || 'este grupo',
                        memberCount: memberCount - 1 // Already left
                    });

                    await sock.sendMessage(id, {
                        text: text,
                        mentions: [participant]
                    });
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
