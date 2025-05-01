const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'goldtext',
    description: 'Generate luxury gold text effect',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'goldtext');

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "✨ Usage: !goldtext YourText\nExample: !goldtext VIP"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `✨ Luxury gold text created: "${text}"`
            });

        } catch (error) {
            console.error('GOLDTEXT ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Failed to create gold text. Error: ${error.message}`
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
