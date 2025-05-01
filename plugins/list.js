const { writeFileSync } = require('fs');

module.exports = {
    name: 'list',
    description: 'Show all available commands with explanations',
    execute: async ({ sock, msg }) => {
        try {
            // Create the command list image (you should prepare list.png separately)
            // For now we'll just send the text explanation
            
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
┣✦ !cat - Random cat images

*🤖 AI TOOLS*
┣✦ !gemini - Use Google AI (Gemini)

*📝 NOTES*
1. For text makers: NO space after prefix
   ✅ Correct: !fire:text
   ❌ Wrong: ! fire text
2. Some commands need additional parameters
3. Owner commands are restricted
            `;

            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: 'list.png' }, // Make sure this image exists
                caption: commandList
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error showing command list: ${error.message}`
            });
        }
    }
};
