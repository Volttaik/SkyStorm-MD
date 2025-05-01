const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'glitch',
    description: 'Generate glitch text effect using ephoto-api-faris',
    execute: async ({ sock, msg, command }) => {
        const text = extractText(msg, command);

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🔴 Usage: *.glitch YourName*"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl }
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    }
};

// Improved extractor that removes the actual command name, not just first word
function extractText(msg, commandName) {
    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 '';
    const withoutCommand = body.replace(new RegExp(`^\\.?${commandName}\\s+`, 'i'), '');
    return withoutCommand.trim();
}
