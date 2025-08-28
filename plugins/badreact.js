const { malvin } = require("../malvin");

// List of bad emojis that will get users immediately removed
const BAD_EMOJIS = ['😠','🖕', '👎', '💩', '🤮', '👊', '🔫', '💣', '🗑️', '❌', '🚫', '⛔', '💔', '🤬', '😡', '🥊'];

// Store group settings
let groupSettings = {};

malvin({
    pattern: 'badreact',
    alias: ['reactfilter', 'emojifilter'],
    desc: 'Configure immediate removal for bad reactions',
    category: 'moderation',
    filename: __filename,
    usage: '.badreact [on/off/list]'
}, async (malvin, mek, m, { args, reply, isAdmin, isGroup, from }) => {
    if (!isGroup) return reply('*This command only works in groups*');
    if (!isAdmin) return reply('*Only admins can use this command*');

    const [action] = args;

    switch (action) {
        case 'on':
            // Enable bad reaction filtering
            groupSettings[from] = groupSettings[from] || {};
            groupSettings[from].badReactFilter = true;
            reply('*STRICT MODE ENABLED*\n\n⚠️ Users will be *IMMEDIATELY REMOVED* for using any bad emoji reactions!');
            break;

        case 'off':
            // Disable bad reaction filtering
            groupSettings[from] = groupSettings[from] || {};
            groupSettings[from].badReactFilter = false;
            reply('❌ Bad reaction filtering disabled.');
            break;

        case 'list':
            // Show all bad emojis
            const emojiList = BAD_EMOJIS.join(' ');
            reply(`🚫 *BAD EMOJIS THAT GET USERS REMOVED:*\n\n${emojiList}\n\n⚠️ Reacting with any of these will result in immediate removal!`);
            break;

        default:
            const status = groupSettings[from]?.badReactFilter ? '🟢 ENABLED' : '🔴 DISABLED';
            reply(
                `*STRICT REACTION FILTER*\n\n` +
                `Status: ${status}\n` +
                `Action: *IMMEDIATE REMOVAL*\n` +
                `Bad Emojis: ${BAD_EMOJIS.length} emojis\n\n` +
                `*Commands:*\n` +
                `• .badreact on - Enable strict filtering\n` +
                `• .badreact off - Disable filtering\n` +
                `• .badreact list - Show banned emojis\n\n` +
                `⚠️ *WARNING:* Any user reacting with bad emojis will be *IMMEDIATELY REMOVED* from the group!`
            );
    }
});

// Handle message reactions - IMMEDIATE REMOVAL
malvin.on('message-reaction', async (reaction) => {
    try {
        const { key, reaction: emoji } = reaction;
        const groupId = key.remoteJid;
        
        // Check if it's a group and strict filtering is enabled
        if (!groupId.includes('@g.us') || !groupSettings[groupId]?.badReactFilter) {
            return;
        }

        // Get the reacted message
        const message = await malvin.loadMessage(key.id);
        if (!message) return;

        const user = reaction.participant || key.participant || key.remoteJid;

        // Check if the reaction is a bad emoji
        if (BAD_EMOJIS.includes(emoji)) {
            try {
                // Remove user from group IMMEDIATELY
                await malvin.groupParticipantsUpdate(groupId, [user], 'remove');
                
                // Get user info for the message
                const userInfo = await malvin.getContact(user);
                const userName = userInfo?.name || user.split('@')[0];
                
                // Send removal notice to the group
                await malvin.sendMessage(groupId, {
                    text: `⚡ *USER REMOVED IMMEDIATELY!*\n\n` +
                          `👤 *User:* ${userName}\n` +
                          `🚫 *Violation:* Used banned emoji ${emoji}\n` +
                          `⏰ *Time:* ${new Date().toLocaleTimeString()}\n\n` +
                          `⚠️ *Warning:* Bad reactions are not tolerated in this group!`,
                    mentions: [user]
                });

                console.log(`🚫 Removed user ${user} from group ${groupId} for bad reaction: ${emoji}`);

            } catch (error) {
                console.error('Error removing user:', error);
                // If bot doesn't have admin rights, notify in group
                if (error.message.includes('not authorized')) {
                    await malvin.sendMessage(groupId, {
                        text: `❌ Failed to remove user!\n\n` +
                              `I need admin permissions to remove users who use bad emojis.`
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
    }
});

// Command to add more bad emojis
malvin({
    pattern: 'addbademoji',
    alias: ['bademojiadd'],
    desc: 'Add emoji to the banned list',
    category: 'moderation',
    filename: __filename,
    usage: '.addbademoji 😡'
}, async (malvin, mek, m, { args, reply, isAdmin, isGroup }) => {
    if (!isGroup) return reply('❌ This command only works in groups');
    if (!isAdmin) return reply('❌ Only admins can use this command');

    const emoji = args[0];
    if (!emoji) return reply('❌ Please provide an emoji to add');

    if (BAD_EMOJIS.includes(emoji)) {
        return reply(`❌ ${emoji} is already in the banned emoji list!`);
    }

    BAD_EMOJIS.push(emoji);
    reply(`✅ Added ${emoji} to banned emoji list!\n\n⚠️ Users reacting with this emoji will now be immediately removed!`);
});

// Command to remove emoji from banned list
malvin({
    pattern: 'removebademoji',
    alias: ['bademojiremove'],
    desc: 'Remove emoji from the banned list',
    category: 'moderation',
    filename: __filename,
    usage: '.removebademoji 😡'
}, async (malvin, mek, m, { args, reply, isAdmin, isGroup }) => {
    if (!isGroup) return reply('❌ This command only works in groups');
    if (!isAdmin) return reply('❌ Only admins can use this command');

    const emoji = args[0];
    if (!emoji) return reply('❌ Please provide an emoji to remove');

    const index = BAD_EMOJIS.indexOf(emoji);
    if (index === -1) {
        return reply(`❌ ${emoji} is not in the banned emoji list!`);
    }

    BAD_EMOJIS.splice(index, 1);
    reply(`Removed ${emoji} from banned emoji list!\n\nUsers can now react with this emoji without being removed.`);
});

// Initialize group settings when bot joins a group
malvin.on('group-participants-update', async (update) => {
    const { id, action } = update;
    
    if (action === 'add' && update.participants.includes(malvin.user.id)) {
        // Bot added to group
        groupSettings[id] = groupSettings[id] || { badReactFilter: false };
        
        // Send welcome message with info about strict mode
        await malvin.sendMessage(id, {
            text: `🤖 *Bot Joined Group*\n\n` +
                  `⚡ *Strict Reaction Filter Available*\n\n` +
                  `Use *.badreact on* to enable immediate removal of users who react with bad emojis!\n` +
                  `Use *.badreact list* to see banned emojis.\n\n` +
                  `⚠️ *Warning:* When enabled, users will be *IMMEDIATELY REMOVED* for bad reactions!`
        });
    }
});

// Export for potential external use
module.exports = {
    BAD_EMOJIS,
    groupSettings
};
