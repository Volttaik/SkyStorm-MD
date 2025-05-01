const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'bpink',
    description: 'Generate a Blackpink style logo',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'bpink');

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "💖 Usage: !bpink YourName\nExample: !bpink Lisa"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `💖 Blackpink logo created for: ${text}`
            });
            
        } catch (error) {
            console.error('BPINK ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Failed to create logo. Error: ${error.message}`
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
