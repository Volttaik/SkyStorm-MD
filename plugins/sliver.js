const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'sliver',
    description: 'Generate glossy silver 3D text effect using ephoto-api-faris',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'sliver'); // Remove the command name from the input

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "⚪ Usage: *.sliver YourName*"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `⚪ Silver text for: ${text}`
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
