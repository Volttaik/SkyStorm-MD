const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'fire',
    description: 'Generate fire text effect using ephoto-api-faris',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'fire'); // Pass the command name to remove it from input

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "🔥 Usage: *.fire YourName*"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/flame-lettering-effect-372.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `🔥 Flame text for: ${text}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    }
};

function extractText(msg, commandName) {
    const body = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 '';
    const withoutCommand = body.replace(new RegExp(`^\\.?${commandName}\\s+`, 'i'), '');
    return withoutCommand.trim();
}
