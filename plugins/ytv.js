const fs = require('fs');
const path = require('path');
const ytdlp = require('youtube-dl-exec');
const { makeWASocket } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'ytv',
    description: 'Download YouTube videos (simplified format)',
    execute: async ({ sock, msg, args }) => {
        const chatId = msg.key.remoteJid;
        const url = args[0];

        if (!url) {
            return sock.sendMessage(chatId, { text: '❌ Please provide a YouTube URL.' });
        }

        try {
            // Basic URL validation
            if (!url.match(/(youtube\.com|youtu\.be)/)) {
                return sock.sendMessage(chatId, { text: '❌ Please provide a valid YouTube URL.' });
            }

            await sock.sendMessage(chatId, { text: '🔍 Fetching video info...' });

            // Get video info (for title/duration)
            const info = await ytdlp(url, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true
            });

            // Duration check (5-minute limit for WhatsApp)
            if (info.duration > 300) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Video too long (max 5 minutes).'
                });
            }

            await sock.sendMessage(chatId, { 
                text: `⬇️ Downloading: *${info.title}*`
            });

            // Prepare temp file
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const outputPath = path.join(tempDir, `${Date.now()}.mp4`);

            // Download using fallback format only
            await ytdlp(url, {
                format: 'mp4', // Simplified format selector
                output: outputPath,
                noCheckCertificates: true
            });

            // File validation
            if (!fs.existsSync(outputPath)) {
                throw new Error('Download failed: No file created');
            }

            const fileSizeMB = fs.statSync(outputPath).size / (1024 * 1024);
            if (fileSizeMB > 16) {
                fs.unlinkSync(outputPath);
                return sock.sendMessage(chatId, { 
                    text: `❌ Video too large (${fileSizeMB.toFixed(1)}MB, max 16MB).`
                });
            }

            // Send video
            await sock.sendMessage(chatId, {
                video: fs.readFileSync(outputPath),
                caption: `▶️ ${info.title}`,
                mimetype: 'video/mp4'
            });

            // Cleanup
            fs.unlinkSync(outputPath);

        } catch (error) {
            console.error('Error:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Download failed. Try again or check the URL.'
            });
        }
    }
};
