const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'neon',
    description: 'Generate neon text effect using ephoto-api-faris',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg);

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🔴 Usage: *.neon YourName*"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html");
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

function extractText(msg) {
    return (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '')
        .split(' ').slice(1).join(' ').trim();
}
