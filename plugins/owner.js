module.exports = {
    name: 'contact',
    aliases: ['owner', 'creator'],
    description: 'Sends my contact information as a vCard',
    execute: async ({ sock, msg }) => {
        const { writeFileSync, existsSync, mkdirSync, readFileSync, unlinkSync } = require('fs');
        const path = require('path');

        const chatId = msg.key.remoteJid;
        const tempDir = './temp_contact';
        
        try {
            // Get current user info
            const user = sock.user;
            if (!user || !user.id) {
                return await sock.sendMessage(
                    chatId,
                    { text: "❌ Couldn't fetch my contact information" }
                );
            }

            // Extract and format phone number (e.g., 2348061938576@s.whatsapp.net → +2348061938576)
            const phoneNumber = user.id.split('@')[0];
            const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            
            // Create vCard file
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir);
            }

            const vCard = `
BEGIN:VCARD
VERSION:3.0
FN:${user.name || 'WhatsApp User'}
TEL;type=CELL;type=VOICE;waid=${phoneNumber}:${formattedNumber}
END:VCARD
            `.trim();

            const filePath = path.join(tempDir, `contact_${Date.now()}.vcf`);
            writeFileSync(filePath, vCard);

            // Send contact card
            await sock.sendMessage(chatId, {
                contacts: {
                    displayName: user.name || 'Contact',
                    contacts: [{ 
                        vcard: readFileSync(filePath, 'utf-8') 
                    }]
                }
            });

            // Cleanup
            unlinkSync(filePath);

        } catch (error) {
            console.error('Contact card error:', error);
            await sock.sendMessage(
                chatId,
                { text: "⚠️ Failed to send contact card" }
            );
        }
    }
};
