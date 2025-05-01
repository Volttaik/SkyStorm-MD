const path = require('path');
const fs = require('fs');

// Define the complete path to your assets folder
const ASSETS_FOLDER = path.join(__dirname, '../assets');
const IMAGE_FILE = 'list.jpg';
const IMAGE_PATH = path.join(ASSETS_FOLDER, IMAGE_FILE);

module.exports = {
    name: 'list',
    description: 'Show all available commands with explanations',
    execute: async ({ sock, msg }) => {
        try {
            const commandList = `
📋 *COMMAND LIST* 📋

*🎨 TEXT MAKERS* (Use without space after prefix: !fire:text)
┣✦ !fire - Fire text effect
┣✦ !neon - Neon text effect
┣✦ !glitchout - Glitch text effect
┣✦ !hackneon - Hacker neon text
┣✦ !angelwings - Angel wings text
┣✦ !bpink - Blackpink style text
┣✦ !lux - Gold text (use: !lux:goldtext)
┣✦ !moon - Moon text (use: !moon:night)
┣✦ !sliver - Silver text effect
┣✦ !advancedglow - Glowing text
┣✦ !cloudheart - Cloud heart text
┣✦ !window - Window text effect
┣✦ !cat - Cat-themed text maker

*⚙️ UTILITY COMMANDS*
┣✦ !ping - Check bot response
┣✦ !owner - Show owner info
┣✦ !dlt - Delete message
┣✦ !clear - Clear chat
┣✦ !alive - Check bot uptime
┣✦ !menu - Show command list
┣✦ !intro - Bot introduction
┣✦ !whois - Get user info
┣✦ !sysinfo - System information
┣✦ !tagall - Mention all group members
┣✦ !tts - Text to speech

*🎵 MEDIA TOOLS*
┣✦ !ytv - Download YouTube video
┣✦ !yta - Download YouTube audio
┣✦ !vv - Anti-view-once message

*🤖 AI TOOLS*
┣✦ !gemini - Use Google AI (Gemini)

*📝 NOTES*
1. For text makers: NO space after prefix
   ✅ Correct: !fire:text
   ❌ Wrong: ! fire text
2. Some commands need additional parameters
3. Owner commands are restricted
            `;

            // Check if image exists
            if (fs.existsSync(IMAGE_PATH)) {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: IMAGE_PATH },
                    caption: commandList,
                    mimetype: 'image/jpeg'
                });
            } else {
                // Fallback to text-only version
                console.warn(`Image not found at: ${IMAGE_PATH}`);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: commandList + `\n\nℹ️ Image preview not available (${IMAGE_FILE} missing)`
                });
            }

        } catch (error) {
            console.error('Error in list command:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📋 *COMMAND LIST* (Text-only version)\n\n${commandList}\n\n❌ Error loading image: ${error.message}`
            });
        }
    }
};
