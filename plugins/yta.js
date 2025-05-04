const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const axios = require('axios');
const { makeWASocket } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'yta',
    description: 'Download YouTube audio by URL or search query',
    execute: async ({ sock, msg, args }) => {
        const chatId = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) {
            await sock.sendMessage(chatId, { text: '❌ Please provide a YouTube URL or search query.\nExample:\n• !yta https://youtu.be/example\n• !yta never gonna give you up' });
            return;
        }

        try {
            let videoUrl = query;
            
            // If it's not a URL, treat as search query
            if (!query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
                await sock.sendMessage(chatId, { text: '🔍 Searching YouTube...' });
                
                const searchResults = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
                const videoIds = searchResults.data.match(/"videoId":"([^"]{11})"/g);
                
                if (!videoIds || videoIds.length === 0) {
                    await sock.sendMessage(chatId, { text: '❌ No videos found for your search.' });
                    return;
                }
                
                videoUrl = `https://youtube.com/watch?v=${videoIds[0].split('"')[3]}`;
            }

            // Check if URL is valid
            await sock.sendMessage(chatId, { text: '🔍 Checking video info...' });

            // Get video info first
            const info = await youtubedl(videoUrl, {
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
            await youtubedl(videoUrl, {
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
                text: '❌ Download failed. Possible reasons:\n- Video is private/restricted\n- Server error\n- Video too long\n- Invalid URL/search query'
            });
        }
    }
};
