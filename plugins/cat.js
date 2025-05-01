const Photo360 = require('imran-photo360-apis');

module.exports = {
    name: 'cat',
    description: 'Generate a 360-style image using Photo360 API',
    execute: async ({ sock, msg }) => {
        const name = extractText(msg);

        if (!name) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🔴 Example: *.cat Imran*"
            });
        }

        const generator = new Photo360();
        generator.setName(name);

        try {
            const result = await generator.execute();
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl }
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Generation failed: ${error.message}`
            });
        }
    }
};

function extractText(msg) {
    return (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '')
        .split(' ').slice(1).join(' ').trim();
}
