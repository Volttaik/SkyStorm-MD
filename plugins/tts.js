const axios = require('axios');
const { createWriteStream, existsSync, mkdirSync, unlinkSync } = require('fs');
const path = require('path');

module.exports = {
    name: 'tts',
    aliases: ['speak', 'voice'],
    description: 'Convert text to speech with a DEEP ANIME VOICE',
    execute: async ({ sock, msg }) => {
        const chatId = msg.key.remoteJid;
        const tempDir = './temp_tts';
        
        const fullText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const text = fullText.split(' ').slice(1).join(' ').trim();

        if (!text) {
            return await sock.sendMessage(chatId, {
                text: "❌ You must... speak my name... (Include text after !tts)"
            });
        }

        if (text.length > 200) {
            return await sock.sendMessage(chatId, {
                text: "⚠️ My power... is not enough... (Max 200 characters)"
            });
        }

        try {
            await sock.sendPresenceUpdate('composing', chatId);

            if (!existsSync(tempDir)) mkdirSync(tempDir);
            const outputFile = path.join(tempDir, `tts_${Date.now()}.mp3`);

            // **Modified Google TTS URL for deeper voice**
            // tl=ja (Japanese) tends to sound more anime-like
            // Play with speed (slow = more dramatic)
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&q=${encodeURIComponent(text)}&client=tw-ob&ttsspeed=0.7`;
            
            const response = await axios({ 
                url, 
                method: 'GET', 
                responseType: 'stream',
                headers: {
                    // Some user-agents help avoid Google blocking
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const writer = createWriteStream(outputFile);
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            await sock.sendMessage(chatId, {
                audio: { url: outputFile },
                mimetype: 'audio/mpeg',
                ptt: true  // Push-to-talk effect for more impact
            });

            unlinkSync(outputFile);

        } catch (error) {
            console.error('TTS error:', error);
            await sock.sendMessage(chatId, {
                text: `⚠️ My voice... has been sealed... (Error: ${error.message || "Unknown"})`
            });
        }
    }
};
