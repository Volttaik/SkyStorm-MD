const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'adglow',
    description: 'Create multicolored neon light signatures',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'adglow');

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🌟 Usage: !adglow YourText\nExample: !adglow OPEN 24/7"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `🌟 Neon sign created: "${text}"`
            });

        } catch (error) {
            console.error('NEON SIGN ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `⚠️ Failed to create neon sign. Error: ${error.message}`
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
