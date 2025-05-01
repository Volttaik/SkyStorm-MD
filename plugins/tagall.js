module.exports = {
    name: 'tagall',
    description: 'Mention all group members in a numbered list',
    execute: async ({ sock, msg }) => {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups!"
            });
        }

        try {
            const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = groupMetadata.participants.filter(p => p.id !== sock.user.id);
            
            // Create numbered list with mentions
            let mentionText = "📢 Group Members:\n";
            const mentions = [];
            
            participants.forEach((participant, index) => {
                const username = participant.name || participant.id.split('@')[0];
                mentionText += `${index + 1}. @${username}\n`;
                mentions.push(participant.id);
            });

            await sock.sendMessage(msg.key.remoteJid, {
                text: mentionText,
                mentions: mentions
            });

        } catch (error) {
            console.error('TAGALL ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Failed to tag members. Error: ${error.message}`
            });
        }
    }
};
