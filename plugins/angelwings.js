const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'angel',
    description: 'Create beautiful angel wings with galaxy text effect',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'angel');

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "👼 Usage: !angel YourText\nExample: !angel Heaven"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/the-effect-of-galaxy-angel-wings-289.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `✨ Angelic text created: "${text}"`
            });

        } catch (error) {
            console.error('ANGEL WINGS ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `😇 Angelic error! Couldn't create wings. Error: ${error.message}`
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
