const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const { makeWASocket } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'yta',
    description: 'Download YouTube audio using youtube-dl-exec',
    execute: async ({ sock, msg, args }) => {
        const chatId = msg.key.remoteJid;
        const url = args[0];

        if (!url) {
            await sock.sendMessage(chatId, { text: '❌ Please provide a YouTube URL.' });
            return;
        }

        try {
            // Check if URL is valid
            await sock.sendMessage(chatId, { text: '🔍 Checking video info...' });

            // Get video info first
            const info = await youtubedl(url, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                skipDownload: true,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            });

            // Check duration (max 15 minutes)
            if (info.duration > 900) {
                await sock.sendMessage(chatId, { text: '❌ Audio too long (max 15 minutes)' });
                return;
            }

            await sock.sendMessage(chatId, { 
                text: `⬇️ Downloading: ${info.title}\n⏳ Please wait...` 
            });

            // Create temp directory
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const outputPath = path.join(tempDir, `${Date.now()}.mp3`);

            // Download audio
            await youtubedl(url, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 0, // best quality
                output: outputPath,
                noCheckCertificates: true,
                noWarnings: true,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            });

            // Check file size
            const stats = fs.statSync(outputPath);
            const fileSizeMB = stats.size / (1024 * 1024);

            if (fileSizeMB > 16) {
                fs.unlinkSync(outputPath);
                await sock.sendMessage(chatId, { text: '❌ File too large (max 16MB)' });
                return;
            }

            // Send audio
            await sock.sendMessage(chatId, {
                audio: fs.readFileSync(outputPath),
                mimetype: 'audio/mpeg',
                caption: `🎵 ${info.title}`
            });

            // Cleanup
            fs.unlinkSync(outputPath);

        } catch (error) {
            console.error('Download error:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Download failed. Possible reasons:\n- Video is private/restricted\n- Server error\n- Video too long'
            });
        }
    }
};
