module.exports = {
    name: 'dlt',
    aliases: ['delete'],
    description: 'Silently deletes a quoted message or the last message',
    execute: async ({ sock, msg }) => {
        const chatId = msg.key.remoteJid;
        
        try {
            // Case 1: Delete quoted message (if replying)
            if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                await sock.sendMessage(chatId, {
                    delete: {
                        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                        remoteJid: chatId,
                        fromMe: false // Set to 'true' to only delete bot's messages
                    }
                });
            } 
            // Case 2: Delete last message (if not replying)
            else {
                const [lastMsg] = await sock.fetchMessages(chatId, { limit: 1 });
                if (lastMsg) {
                    await sock.sendMessage(chatId, {
                        delete: {
                            id: lastMsg.key.id,
                            remoteJid: chatId,
                            fromMe: lastMsg.key.fromMe
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Delete Error:', error);
            // Optional: Uncomment to notify on failure
            // await sock.sendMessage(chatId, { text: "❌ Delete failed" });
        }
    }
};
