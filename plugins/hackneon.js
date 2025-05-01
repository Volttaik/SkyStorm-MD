const Photo360 = require('ephoto-api-faris');

module.exports = {
    name: 'hacker',
    description: 'Generate anonymous hacker avatars with cyan neon effect',
    execute: async ({ sock, msg }) => {
        const text = extractText(msg, 'hacker');

        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "💻 Usage: !hacker YourText\nExample: !hacker Anonymous"
            });
        }

        try {
            const photo360 = new Photo360("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html");
            photo360.setName(text);
            const result = await photo360.execute();

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: result.imageUrl },
                caption: `🖥️ Hacker avatar generated: "${text}"`
            });

        } catch (error) {
            console.error('HACKER AVATAR ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `⚠️ System failure! Error: ${error.message}`
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
