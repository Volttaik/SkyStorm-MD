const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'night',
    description: 'Create beautiful starry night text effect',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'night');

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🌠 Usage: !night YourText\nExample: !night Dream Big"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/stars-night-online-1-85.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `🌌 Starry night text: "${text}"`
            });

        } catch (error) {
            console.error('STARRY NIGHT ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🌧️ Failed to create starry text. Error: ${error.message}`
            });
        }
    }
};

function extractText(msg, commandName) {
    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 '';
    const withoutCommand = body.replace(new RegExp(`^[!.]?${commandName}\\s*`, 'i'), '');
    return withoutCommand.trim();
}
