const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'cloudtext',
    description: 'Generate text with clouds in the sky effect',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'cloudtext');

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "☁️ Usage: !cloudtext YourText\nExample: !cloudtext Hello World"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `☁️ Text in clouds created: "${text}"`
            });

        } catch (error) {
            console.error('CLOUDTEXT ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `⛈️ Failed to create cloud text. Error: ${error.message}`
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
