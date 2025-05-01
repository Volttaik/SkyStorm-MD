const fs = require('fs');
const path = require('path');
const config = require('../config'); // Import config file

module.exports = function(sock) {
    const commands = new Map();
    const commandFiles = fs.readdirSync(path.join(__dirname, '../plugins'))
        .filter(file => file.endsWith('.js'));

    // Load commands
    commandFiles.forEach(file => {
        const command = require(path.join(__dirname, '../plugins', file));
        commands.set(command.name, command);
        command.aliases?.forEach(alias => commands.set(alias, command));
    });

    // Command handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            if (!text.startsWith(config.prefix)) continue;

            const args = text.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);
            if (!command) return;

            try {
                // ⏳ Reaction
                await sock.sendMessage(msg.key.remoteJid, {
                    react: { text: '⏳', key: msg.key }
                });

                // Execute command
                await command.execute({ sock, msg, args });

                // ✅ Reaction
                await sock.sendMessage(msg.key.remoteJid, {
                    react: { text: '✅', key: msg.key }
                });
            } catch (err) {
                console.error('Command error:', err);
                // ❌ Reaction
                await sock.sendMessage(msg.key.remoteJid, {
                    react: { text: '❌', key: msg.key }
                });
            }
        }
    });

    console.log(`⚙️ Loaded ${commands.size} commands with prefix "${config.prefix}"`);
};
