const { GoogleGenerativeAI } = require("@google/generative-ai");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'gemini',
    aliases: ['ai', 'ask'],
    description: 'Chat with Google Gemini 1.5 Flash (supports text and images)',
    execute: async ({ sock, msg }) => {
        const chatId = msg.key.remoteJid;
        const API_KEY = "AIzaSyCV4Q0e1Qa2SzdURdwKemo2bN4lqoQw1Ys";
        const tempDir = './temp_gemini';

        try {
            await sock.sendPresenceUpdate('composing', chatId);

            // Initialize Gemini with current model
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash" // Updated to current model
            });

            // Check if message is a reply to an image
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            let textResponse = '';

            if (quotedMsg?.imageMessage) {
                // Handle image analysis
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
                
                const media = quotedMsg.imageMessage;
                const filePath = path.join(tempDir, `image_${Date.now()}.jpg`);
                const stream = await downloadMediaMessage(
                    { key: msg.key, message: { imageMessage: media } },
                    'buffer',
                    {},
                    { reuploadRequest: sock.updateMediaMessage }
                );

                await fs.promises.writeFile(filePath, stream);

                const imagePart = {
                    inlineData: {
                        data: stream.toString('base64'),
                        mimeType: 'image/jpeg'
                    }
                };

                const userQuery = msg.message?.conversation || 
                                msg.message?.extendedTextMessage?.text || 
                                "Describe this image";
                
                const result = await model.generateContent({
                    contents: [{
                        parts: [
                            { text: userQuery },
                            imagePart
                        ]
                    }]
                });
                textResponse = (await result.response).text();

                // Cleanup
                fs.unlinkSync(filePath);
            } else {
                // Handle text query
                const userQuery = msg.message?.conversation || 
                                msg.message?.extendedTextMessage?.text;
                
                if (!userQuery) {
                    return await sock.sendMessage(chatId, {
                        text: "❌ Please ask a question or reply to an image\nExample:\n!gemini what's in this picture? [reply to image]"
                    });
                }

                const result = await model.generateContent(userQuery);
                textResponse = (await result.response).text();
            }

            // Send response as a single message
            await sock.sendMessage(chatId, {
                text: textResponse,
                linkPreview: false
            });

        } catch (error) {
            console.error('Gemini error:', error);
            await sock.sendMessage(chatId, {
                text: `⚠️ Error: ${error.message || 'API request failed'}\n\nNote: The image might be too large or contain restricted content`
            });
        }
    }
};
