const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'intro',
    aliases: ['welcome', 'start'],
    description: 'Show welcome message',
    execute: async ({ sock, msg }) => {
        const chatId = msg.key.remoteJid;

        try {
            const imagePath = path.join(__dirname, '../assets/intro.jpg');
            const imageBuffer = readFileSync(imagePath);

            const welcomeMessage = `
࿅࿅࿅ 𝕊𝕂𝕐𝕊𝕋𝕆ℝ𝕄 ࿅࿅࿅

𝖂𝖊𝖑𝖈𝖔𝖒𝖊, 𝖘𝖊𝖊𝖐𝖊𝖗 𝖔𝖋 𝖈𝖔𝖉𝖊.
𝕋𝕙𝕖 𝕔𝕙𝕒𝕞𝕓𝕖𝕣 𝕣𝕖𝕤𝕡𝕠𝕟𝕕𝕤…

Type 𝓽𝔂𝓹𝓮 *!help* 𝓽𝓸 𝓮𝓷𝓽𝓮𝓻.
`.trim();

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: welcomeMessage,
                footer: "Let the path unfold.",
                buttons: [
                    { buttonId: '!help', buttonText: { displayText: 'Show Commands' }, type: 1 },
                    { buttonId: '!alive', buttonText: { displayText: 'Check Status' }, type: 1 }
                ],
                headerType: 1
            });

        } catch (error) {
            console.error('Intro command error:', error);
            await sock.sendMessage(chatId, {
                text: `࿅ 𝕊𝕂𝕐𝕊𝕋𝕆ℝ𝕄 ࿅\n\n[Intro image not found]\n\n𝓽𝔂𝓹𝓮 *!help* 𝓽𝓸 𝓬𝓸𝓷𝓽𝓲𝓷𝓾𝓮.`
            });
        }
    }
};
