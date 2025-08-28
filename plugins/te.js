const config = require('../settings');
const moment = require('moment-timezone');
const { malvin, commands } = require('../malvin');
const { runtime } = require('../lib/functions');
const os = require('os');
const { getPrefix } = require('../lib/prefix');

// Fonction pour styliser les majuscules comme ʜɪ
function toUpperStylized(str) {
  const stylized = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.split('').map(c => stylized[c.toUpperCase()] || c).join('');
}

// Normalisation des catégories
const normalize = (str) => str.toLowerCase().replace(/\s+menu$/, '').trim();

// Emojis par catégorie normalisée
const emojiByCategory = {
  ai: '🤖',
  anime: '🍥',
  audio: '🎧',
  bible: '📖',
  download: '⬇️',
  downloader: '📥',
  fun: '🎮',
  game: '🕹️',
  group: '👥',
  img_edit: '🖌️',
  info: 'ℹ️',
  information: '🧠',
  logo: '🖼️',
  main: '🏠',
  media: '🎞️',
  menu: '📜',
  misc: '📦',
  music: '🎵',
  other: '📁',
  owner: '👑',
  privacy: '🔒',
  search: '🔎',
  settings: '⚙️',
  sticker: '🌟',
  tools: '🛠️',
  user: '👤',
  utilities: '🧰',
  utility: '🧮',
  wallpapers: '🖼️',
  whatsapp: '📱',
};

// Function to create menu navigation buttons
function createMenuNavigation(categories, prefix) {
  const sections = [];
  const rows = [];
  
  for (const cat of Object.keys(categories).sort()) {
    const emoji = emojiByCategory[cat] || '💫';
    const title = `${emoji} ${toUpperStylized(cat)}`;
    const description = `${toUpperStylized(cat)} ${toUpperStylized('Menu')}`;
    
    rows.push({
      title: title,
      rowId: `${prefix}${cat}-menu`,
      description: description
    });
  }
  
  sections.push({
    title: "Menu Navigation",
    rows: rows
  });
  
  return {
    text: "MERCEDES BOT MENU",
    footer: "Select a category to explore commands",
    title: "MERCEDES BOT MENU",
    buttonText: "Browse Categories",
    sections: sections
  };
}

// Function to create sub-menu for a specific category
function createSubMenu(category, commands, prefix) {
  const emoji = emojiByCategory[category] || '💫';
  const categoryTitle = `${emoji} ${toUpperStylized(category)} ${toUpperStylized('Menu')}`;
  
  const rows = commands.map(cmd => ({
    title: `${prefix}${cmd}`,
    rowId: `${prefix}${cmd}`,
    description: `Execute ${cmd} command`
  }));
  
  // Add back button
  rows.push({
    title: "🔙 Back to Main Menu",
    rowId: `${prefix}menu`,
    description: "Return to main menu"
  });
  
  return {
    text: categoryTitle,
    footer: "MERCEDES BOT",
    title: categoryTitle,
    buttonText: "Select a Command",
    sections: [{
      title: "Available Commands",
      rows: rows
    }]
  };
}

malvin({
  pattern: 'meu',
  alias: ['allmeu'],
  desc: 'Show all bot commands',
  category: 'menu',
  react: '👌',
  filename: __filename
}, async (malvin, mek, m, { from, sender, reply }) => {
  try {
    const prefix = getPrefix();
    const timezone = config.TIMEZONE || 'Africa/Nairobi';
    const time = moment().tz(timezone).format('HH:mm:ss');
    const date = moment().tz(timezone).format('dddd, DD MMMM YYYY');

    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    let menu = `
*┏────〘 ᴍᴇʀᴄᴇᴅᴇs 〙───⊷*
*┃* ᴜꜱᴇʀ : @${sender.split("@")[0]}
*┃* ʀᴜɴᴛɪᴍᴇ : ${uptime()}
*┃* ᴍᴏᴅᴇ : *${config.MODE}*
*┃* ᴘʀᴇғɪx : 「 ${config.PREFIX} 」
*┃* ᴏᴡɴᴇʀ : ${config.OWNER_NAME}
*┃* ᴘʟᴜɢɪɴꜱ : 『 ${commands.length} 』
*┃* ᴅᴇᴠ : ᴍᴀʀɪsᴇʟ
*┃* ᴠᴇʀꜱɪᴏɴ : 2.0.0
*┗──────────────⊷*`;

    // Group commands by category (improved logic)
    const categories = {};
    for (const cmd of commands) {
      if (cmd.category && !cmd.dontAdd && cmd.pattern) {
        const normalizedCategory = normalize(cmd.category);
        categories[normalizedCategory] = categories[normalizedCategory] || [];
        categories[normalizedCategory].push(cmd.pattern.split('|')[0]);
      }
    }

    // Add sorted categories with stylized text
    for (const cat of Object.keys(categories).sort()) {
      const emoji = emojiByCategory[cat] || '💫';
      menu += `\n\n┏─『 ${emoji} ${toUpperStylized(cat)} ${toUpperStylized('Menu')} 』──⊷\n`;
      for (const cmd of categories[cat].sort()) {
        menu += `│ ${prefix}${cmd}\n`;
      }
      menu += `┗──────────────⊷`;
    }

    menu += `\n\n> ${config.DESCRIPTION || toUpperStylized('Explore the bot commands!')}`;

    // Context info for image message
    const imageContextInfo = {
      mentionedJid: [sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.NEWSLETTER_JID || '120363299029326322@newsletter',
        newsletterName: config.OWNER_NAME || toUpperStylized('marisel'),
        serverMessageId: 143
      }
    };

    // Create menu navigation
    const listMessage = createMenuNavigation(categories, prefix);

    // Send menu image with navigation buttons
    await malvin.sendMessage(
      from,
      {
        image: { url: config.MENU_IMAGE_URL || 'https://url.bwmxmd.online/Adams.zjrmnw18.jpeg' },
        caption: menu,
        ...listMessage,
        contextInfo: imageContextInfo
      },
      { quoted: mek }
    );

    // Send audio if configured
    if (config.MENU_AUDIO_URL) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await malvin.sendMessage(
        from,
        {
          audio: { url: config.MENU_AUDIO_URL },
          mimetype: 'audio/mp4',
          ptt: true,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: config.OWNER_NAME || toUpperStylized('marisel'),
              serverMessageId: 143
            }
          }
        },
        { quoted: mek }
      );
    }

  } catch (e) {
    console.error('Menu Error:', e.message);
    await reply(`❌ ${toUpperStylized('Error')}: Failed to show menu. Try again.\n${toUpperStylized('Details')}: ${e.message}`);
  }
});

// Handle sub-menu commands (category-menu)
for (const category of Object.keys(emojiByCategory)) {
  malvin({
    pattern: `${category}-menu`,
    desc: `Show ${category} commands`,
    category: 'menu',
    filename: __filename
  }, async (malvin, mek, m, { from, sender, reply }) => {
    try {
      const prefix = getPrefix();
      
      // Group commands by category
      const categories = {};
      for (const cmd of commands) {
        if (cmd.category && !cmd.dontAdd && cmd.pattern) {
          const normalizedCategory = normalize(cmd.category);
          categories[normalizedCategory] = categories[normalizedCategory] || [];
          categories[normalizedCategory].push(cmd.pattern.split('|')[0]);
        }
      }
      
      // Check if category exists
      if (!categories[category]) {
        await reply(`❌ ${toUpperStylized('Error')}: Category "${category}" not found.`);
        return;
      }
      
      const emoji = emojiByCategory[category] || '💫';
      const categoryTitle = `${emoji} ${toUpperStylized(category)} ${toUpperStylized('Menu')}`;
      
      let subMenu = `*${categoryTitle}*\n\n`;
      for (const cmd of categories[category].sort()) {
        subMenu += `• ${prefix}${cmd}\n`;
      }
      
      subMenu += `\n*Total Commands*: ${categories[category].length}`;
      
      // Create sub-menu navigation
      const listMessage = createSubMenu(category, categories[category], prefix);
      
      // Send sub-menu
      await malvin.sendMessage(
        from,
        {
          text: subMenu,
          ...listMessage
        },
        { quoted: mek }
      );
      
    } catch (e) {
      console.error('Sub-Menu Error:', e.message);
      await reply(`❌ ${toUpperStylized('Error')}: Failed to show ${category} menu. Try again.`);
    }
  });
}

// Handle button responses
malvin({
  on: 'message'
}, async (malvin, mek, m) => {
  try {
    const prefix = getPrefix();
    const from = mek.key.remoteJid;
    
    // Check for button responses
    if (mek.message?.buttonsResponseMessage) {
      const selectedId = mek.message.buttonsResponseMessage.selectedButtonId;
      
      if (selectedId) {
        // Handle menu navigation
        if (selectedId.endsWith('-menu')) {
          // Simulate the menu command
          const simulatedMessage = {
            ...mek,
            body: selectedId
          };
          // Find and execute the corresponding handler
          for (const handler of malvin.handlers) {
            if (handler.pattern === selectedId.replace(prefix, '')) {
              await handler.func(malvin, simulatedMessage, m, {
                from: from,
                sender: mek.key.participant || from,
                reply: (text) => malvin.sendMessage(from, { text: text }, { quoted: mek })
              });
              break;
            }
          }
          return;
        }
        
        // Handle direct command execution
        if (selectedId.startsWith(prefix)) {
          const commandName = selectedId.slice(prefix.length);
          
          // Find and execute the command
          for (const handler of malvin.handlers) {
            if (handler.pattern === commandName || 
                (handler.alias && handler.alias.includes(commandName))) {
              await handler.func(malvin, mek, m, {
                from: from,
                sender: mek.key.participant || from,
                reply: (text) => malvin.sendMessage(from, { text: text }, { quoted: mek })
              });
              break;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Button Response Error:', e.message);
  }
});
