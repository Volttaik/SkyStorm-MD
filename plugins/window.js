const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'window',
    description: 'Generate wet glass window text effect using ephoto-api-faris',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg);

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🔴 Usage: *.window YourText*"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/write-text-on-wet-glass-online-589.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: "✅ Done! Here's your wet glass effect."
            });
        } catch (error) {
            console.error("Window command error:", error);
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
