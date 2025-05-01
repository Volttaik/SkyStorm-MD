module.exports = {
    name: 'ping',
    aliases: ['p', 'speed'],
    execute: async ({ sock, msg }) => {
        // Start time measurement
        const start = Date.now();

        // Send initial reply with 📡
        const replyMsg = await sock.sendMessage(
            msg.key.remoteJid,
            { 
                text: '📡 Measuring response time...' 
            },
            { quoted: msg }
        );

        // Calculate latency
        const latency = Date.now() - start;

        // Edit the message with results
        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: `📡 Network Speed: ${latency}ms\n` +
                      `${latency < 200 ? '🚀 Blazing fast!' : latency < 500 ? '👍 Good' : '🐢 Slow'}`,
                edit: replyMsg.key
            }
        );
    }
};
