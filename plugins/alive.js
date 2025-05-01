const { readFileSync } = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

module.exports = {
    name: 'alive',
    aliases: ['status', 'storm'],
    description: 'Check cloud bot status',
    execute: async ({ sock, msg }) => {
        const chatId = msg.key.remoteJid;

        try {
            const imagePath = path.join(__dirname, '../assets/alive.jpg');
            const imageBuffer = readFileSync(imagePath);
            const uptimeString = formatUptime(process.uptime());
            const signalPing = getPing();

            const styledMessage = `
   ࿐━━━━━━━━━━━━━━━༺ ࿅skystorm࿅ ༻━━━━━━━━━━━━━━━࿐

         SYSTEM  ::  cloud storm engine
         SIGNAL  ::  ${signalPing}
         UPTIME  ::  ${uptimeString}

        "riding the digital storm..."

   ༺━━━━━━━━━━━━━━━෴━━━━━━━━━━━━━━━༻
            `.trim();

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: styledMessage,
                contextInfo: {
                    isForwarded: true
                }
            });

        } catch (error) {
            console.error('Storm check failed:', error);
            const uptimeString = formatUptime(process.uptime());
            await sock.sendMessage(chatId, {
                text: `
   ࿐━━━━༺ ࿅skystorm࿅ ༻━━━━࿐
   STATUS :: OFFLINE
   UPTIME :: ${uptimeString}
   ERROR  :: ${error.message || 'Unknown storm disruption'}
   ༺━━━━━━━෴━━━━━━━༻`.trim()
            });
        }
    }
};

// Helper functions
function formatUptime(seconds) {
    const units = [
        { value: Math.floor(seconds / 86400), label: 'd' },
        { value: Math.floor((seconds % 86400) / 3600), label: 'h' },
        { value: Math.floor((seconds % 3600) / 60), label: 'm' },
        { value: Math.floor(seconds % 60), label: 's' }
    ];
    return units.filter(u => u.value > 0).map(u => `${u.value}${u.label}`).join(' ') || '0s';
}

function getPing() {
    try {
        const output = execSync('ping -c 1 google.com').toString();
        const match = output.match(/time=([0-9.]+) ms/);
        return match ? `${match[1]} ms` : 'N/A';
    } catch {
        return 'No Signal';
    }
}
