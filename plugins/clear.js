module.exports = {
    name: 'clear',
    aliases: ['purge'],
    description: 'Clears the entire chat and sends a confirmation',
    execute: async ({ sock, msg }) => {
        const chatId = msg.key.remoteJid;

        try {
            // 1. Clear the chat (using the command message as reference)
            await sock.chatModify(
                {
                    delete: true,
                    lastMessages: [{
                        key: msg.key, // Uses the command itself as reference
                        messageTimestamp: Math.floor(Date.now() / 1000) // Current Unix timestamp
                    }]
                },
                chatId
            );

            // 2. Send confirmation AFTER clearing
            await sock.sendMessage(
                chatId,
                { text: "✅ Chat cleared successfully." }
            );

        } catch (error) {
            console.error('Clear Error:', error);
            await sock.sendMessage(
                chatId,
                { text: "❌ Failed to clear chat. (Works only in private chats)" }
            );
        }
    }
};
