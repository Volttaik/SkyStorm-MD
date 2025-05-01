const fs = require('fs');
const path = require('path');
const config = require('../config');

// Categorize each command
const categorizeCommand = (cmdName) => {
    if (['intro','alive', 'ping', 'menu', 'help'].includes(cmdName)) return '🌪️ CORE SYSTEM';
    if (['gemini'].includes(cmdName)) return '🧠 AI TOOLS';
    if (['tts', 'photo360', 'whois'].includes(cmdName)) return '🛠️ UTILITIES';
    if (['tagall','vv','dlt', 'clear'].includes(cmdName)) return '🧹 CHAT TOOLS';
    if (
        [
            'cat', 'neon', 'glitch', 'fire', 'sliver', 'bpink', 'lux',
            'advancedglow', 'angelwings', 'moon', 'window',
            'cloudheart', 'glitchout', 'hackneon'
        ].includes(cmdName)
    ) return '✨ TEXT EFFECTS';
    if (['sysinfo','owner',].includes(cmdName)) return '🖥️ SYSTEM COMMANDS';
    if (['yta', 'ytv'].includes(cmdName)) return '▶️ YOUTUBE TOOLS';
    return '⚡ UNCATEGORIZED';
};

module.exports = {
    name: 'menu',
    aliases: ['help', 'cmd'],
    description: 'Show elegantly organized command menu',
    execute: async ({ sock, msg }) => {
        const chatId = msg.key.remoteJid;
        const prefix = config.prefix || '.';

        try {
            const commandFiles = fs.readdirSync(path.join(__dirname, '../plugins'))
                .filter(file => file.endsWith('.js') && !file.startsWith('_'));

            const categorizedCommands = {};
            commandFiles.forEach(file => {
                const cmdName = file.replace('.js', '');
                const category = categorizeCommand(cmdName);
                if (!categorizedCommands[category]) {
                    categorizedCommands[category] = [];
                }
                categorizedCommands[category].push(cmdName);
            });

            let menuText = `╭───────────────────────────╮\n` +
                           `│      ⚡ *SKYSTORM v2.0* ⚡      │\n` +
                           `├───────────────────────────┤\n` +
                           `│  ⌬ Prefix: » \`${prefix}\`      │\n` +
                           `╰───────────────────────────╯\n\n`;

            for (const [category, commands] of Object.entries(categorizedCommands)) {
                menuText += `▛ ${category}\n▌\n`;
                const half = Math.ceil(commands.length / 2);
                for (let i = 0; i < half; i++) {
                    const leftCmd = commands[i] ? `» ${prefix}${commands[i].padEnd(12)}` : '';
                    const rightCmd = commands[i + half] ? `» ${prefix}${commands[i + half]}` : '';
                    menuText += `▌ ${leftCmd} ${rightCmd}\n`;
                }
                menuText += `▙${'━'.repeat(26)}\n\n`;
            }

            menuText += `╭───────────────────────────╮\n` +
                        `│ ℘ Total: ${commandFiles.length} commands available │\n` +
                        `╰───────────────────────────╯`;

            await sock.sendMessage(chatId, {
                image: {
                    url: path.join(__dirname, '../assets/menu.jpg')
                },
                caption: menuText,
                footer: `Type ${prefix}help <command> for details`
            });

        } catch (error) {
            console.error('Menu error:', error);
            await sock.sendMessage(chatId, {
                text: '⚠️ Failed to load command menu. Please try again later.'
            });
        }
    }
};
