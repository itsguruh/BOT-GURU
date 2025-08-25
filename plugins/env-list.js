const fs = require('fs');
const path = require('path');
const { malvin } = require('../malvin');
const config = require('../settings');

// Helper to convert "true"/"false" strings to actual boolean
function convertToBool(text, trueValue = 'true') {
    return text === trueValue;
}

// Convert config values to booleans where applicable
const booleanConfigKeys = [
    'AUTO_STATUS_SEEN', 'AUTO_STATUS_REPLY', 'AUTO_STATUS_REACT',
    'AUTO_REPLY', 'AUTO_STICKER', 'CUSTOM_REACT', 'AUTO_REACT',
    'DELETE_LINKS', 'ANTI_LINK', 'ANTI_BAD_WORD', 'AUTO_TYPING',
    'AUTO_RECORDING', 'ALWAYS_ONLINE', 'PUBLIC_MODE', 'READ_MESSAGE'
];

function generateSettingsList() {
    const settingsList = [
        { name: 'status view', key: 'AUTO_STATUS_SEEN', emoji: '👁️' },
        { name: 'status reply', key: 'AUTO_STATUS_REPLY', emoji: '💬' },
        { name: 'status react', key: 'AUTO_STATUS_REACT', emoji: '🤩' },
        { name: 'status reply msg', key: 'AUTO_STATUS_MSG', emoji: '💭', isText: true },
        { name: 'auto reply', key: 'AUTO_REPLY', emoji: '↩️' },
        { name: 'auto sticker', key: 'AUTO_STICKER', emoji: '🖼️' },
        { name: 'custom reacts', key: 'CUSTOM_REACT', emoji: '👍' },
        { name: 'auto react', key: 'AUTO_REACT', emoji: '💥' },
        { name: 'delete links', key: 'DELETE_LINKS', emoji: '🔗' },
        { name: 'anti-link', key: 'ANTI_LINK', emoji: '🚫' },
        { name: 'anti-bad words', key: 'ANTI_BAD_WORD', emoji: '🛑' },
        { name: 'auto typing', key: 'AUTO_TYPING', emoji: '⌨️' },
        { name: 'auto recording', key: 'AUTO_RECORDING', emoji: '🎙️' },
        { name: 'always online', key: 'ALWAYS_ONLINE', emoji: '🌐' },
        { name: 'public mode', key: 'PUBLIC_MODE', emoji: '🌍' },
        { name: 'read message', key: 'READ_MESSAGE', emoji: '📖' },
    ];

    return settingsList.map(s => {
        if (s.isText) {
            return `├ ${s.emoji} *${s.name}*: ${config[s.key] || 'not set'}`;
        }
        const value = convertToBool(config[s.key]);
        return `├ ${s.emoji} *${s.name}*: ${value ? '✅ enabled' : '❌ disabled'}`;
    }).join('\n');
}

malvin({
    pattern: 'env',
    alias: ['setting', 'allvar'],
    desc: 'view bot settings ⚙️',
    category: 'main',
    react: '⚙️',
    filename: __filename
}, async (malvin, mek, m, { from, reply }) => {
    try {
        await malvin.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const settingsMessage = `
╭───[ *ᴇɴᴠ sᴇᴛᴛɪɴɢs* ]───
├ *ʙᴏᴛ*: ${config.BOT_NAME || 'ᴍᴇʀᴄᴇᴅᴇs'} 🤖
├ *ᴘʀᴇғɪx*: ${config.PREFIX || '.'} 🛠️
├ *ᴍᴏᴅᴇ*: ${config.MODE || 'private'} 🔒
├ *sᴇᴛᴛɪɴɢs*: ⚙️
${generateSettingsList()}
╰───[ *ᴍᴀʟᴠɪɴ-xᴅ* ]───
> *ᴍᴀᴅᴇ ʙʏ ᴍᴀʀɪsᴇʟ*`;

        const imageUrl = config.MENU_IMAGE_URL || 'https://url.bwmxmd.online/Adams.0dhfcjpi.jpeg';

        await malvin.sendMessage(from, {
            image: { url: imageUrl },
            caption: settingsMessage,
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: mek });

        await malvin.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('❌ env error:', e);
        await reply('❌ error fetching settings');
        await malvin.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});