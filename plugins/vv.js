module.exports = {
    name: 'vv',
    aliases: ['viewonce', 'reveal'],
    description: 'Converts view-once media into normal media and reacts to it',
    execute: async ({ sock, msg }) => {
        const { createWriteStream, existsSync, mkdirSync, readFileSync, unlinkSync } = require('fs');
        const path = require('path');
        const { downloadMediaMessage, getContentType } = require('@adiwajshing/baileys');

        const chatId = msg.key.remoteJid;
        const tempDir = './temp_vv';
        const supportedTypes = ['imageMessage', 'videoMessage', 'audioMessage'];

        try {
            // Check if message is a reply to view-once media
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                return await sock.sendMessage(
                    chatId,
                    { text: "🚫 Please reply to a view-once image/video/audio" }
                );
            }

            // Verify media type
            const mediaType = getContentType(quotedMsg);
            if (!supportedTypes.includes(mediaType) || !quotedMsg[mediaType]?.viewOnce) {
                return await sock.sendMessage(
                    chatId,
                    { text: "❌ Only view-once images/videos/audio are supported" }
                );
            }

            // Prepare download
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir);
            }

            const media = quotedMsg[mediaType];
            const fileExt = media.mimetype.split('/')[1] || 
                          (mediaType === 'audioMessage' ? 'ogg' : 'bin');
            const fileName = `vv_${Date.now()}.${fileExt}`;
            const filePath = path.join(tempDir, fileName);

            // Download and save
            const stream = await downloadMediaMessage(
                { key: msg.key, message: { [mediaType]: media } },
                'stream',
                {},
                { reuploadRequest: sock.updateMediaMessage }
            );

            await new Promise((resolve, reject) => {
                const writeStream = createWriteStream(filePath);
                stream.pipe(writeStream);
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            // Resend as permanent media
            let messageOptions = {
                mimetype: media.mimetype,
                caption: media.caption || ''
            };

            if (mediaType === 'imageMessage') {
                messageOptions.image = readFileSync(filePath);
            } 
            else if (mediaType === 'videoMessage') {
                messageOptions.video = readFileSync(filePath);
            }
            else if (mediaType === 'audioMessage') {
                messageOptions.audio = readFileSync(filePath);
                messageOptions.mimetype = 'audio/ogg; codecs=opus';
            }

            // Send the media and get its message key
            const sentMsg = await sock.sendMessage(chatId, messageOptions);

            // React to the sent media (not the command)
            await sock.sendMessage(chatId, {
                react: {
                    text: '🔓',
                    key: sentMsg.key // This reacts to the media we just sent
                }
            });

            // Cleanup
            unlinkSync(filePath);

        } catch (error) {
            console.error('ViewOnce Error:', error);
            await sock.sendMessage(
                chatId,
                { text: "⚠️ Failed: Media may have expired or is unsupported" }
            );
        }
    }
};
