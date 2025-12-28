const { getGroup } = require('../services/database');
const { getGroupMetadataCached } = require('../services/cache');
const logger = require('../utils/logger');
const { replacePlaceholders } = require('../utils/textUtils');
const { detectImageUrl, downloadImage } = require('../utils/imageUtils');

async function handleGroupUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        // action: 'add', 'remove', 'promote', 'demote'

        // 1. Check if group is active in DB, or create it if missing (Consistency Fix)
        let group = await getGroup(id);

        // Fetch metadata early as we might need it for creation or LIDs
        const groupMetadata = await getGroupMetadataCached(sock, id);

        if (!group) {
            // Auto-create group if it doesn't exist (e.g. Bot just joined)
            if (groupMetadata) {
                logger.info(`Group ${id} missing in DB. Auto-creating...`);
                // Import createGroup dynamically to avoid circular deps if any
                const { createGroup } = require('../services/database');
                group = await createGroup(id, {
                    name: groupMetadata.subject,
                    participants: groupMetadata.participants.length,
                    active: true, // Default to active so commands work
                    activatedAt: new Date()
                });
            } else {
                logger.warn(`Group ${id} missing and metadata failed. Cannot process update.`);
                return;
            }
        }

        if (!group.active) return;

        const memberCount = groupMetadata?.participants?.length || group.participants || '?';

        // 3. Welcome (add)
        if (action === 'add') {
            if (group.settings?.welcome?.enabled) {
                const rawMessage = group.settings.welcome.message || '¡Bienvenido {user} a {group}! 🎉';
                const imageUrl = detectImageUrl(rawMessage) || group.settings.welcome.imageUrl;

                for (let participant of participants) {
                    // --- LID FIX: Resolve to Phone JID ---
                    if (participant.endsWith('@lid')) {
                        const realUser = groupMetadata?.participants?.find(p => p.lid === participant);
                        if (realUser && realUser.id) {
                            participant = realUser.id;
                        }
                    }
                    // -------------------------------------

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

                    try {
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
                                await sock.sendMessage(id, {
                                    image: { url: imageUrl },
                                    caption: text,
                                    mentions: [participant]
                                });
                            }
                        } else {
                            // Text Only
                            await sock.sendMessage(id, {
                                text: text,
                                mentions: [participant]
                            });
                        }
                        logger.info(`Welcome message sent to ${participant} in ${id}`);
                    } catch (err) {
                        logger.error(`Failed to send welcome to ${participant}: ${err.message}`);
                        // Fallback: Text only if image fails
                        if (imageUrl) {
                            await sock.sendMessage(id, { text, mentions: [participant] }).catch(() => { });
                        }
                    }
                }
            } else {
                logger.info(`Welcome skipped for ${id}: Disabled in settings.`);
            }
        }

        // 4. Farewell (remove)
        if (action === 'remove') {
            if (group.settings?.farewell?.enabled) {
                const rawMessage = group.settings.farewell.message || 'Adiós {user}, te esperamos de vuelta 👋';

                for (const participant of participants) {
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
