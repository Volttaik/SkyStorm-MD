const fs = require('fs');
const path = require('path');
const os = require('os');
const process = require('process');

module.exports = {
    name: 'sysinfo',
    description: '📊 Display system information with image',
    execute: async ({ sock, msg }) => {
        try {
            // ─── SAFE VALUE HANDLING ───────────────────────
            const safeString = (value, maxLength = 15) => {
                if (value === undefined || value === null) return 'N/A';
                return String(value).padEnd(maxLength).slice(0, maxLength);
            };

            // ─── SYSTEM METRICS ───────────────────────────
            const metrics = {
                '🖥️ Platform': `${safeString(os.platform(), 10)} (${safeString(os.arch())})`,
                '⚡ CPU': safeString(getCpuInfo()),
                '⏱️ Uptime': safeString(formatUptime(process.uptime())),
                '📦 Node.js': safeString(process.version),
                '📊 Memory': `Used: ${safeString(formatMemory(process.memoryUsage().rss))}/${safeString(formatMemory(os.totalmem()))}`,
                '🌐 Network': `${safeString(os.hostname())} | ${safeString(getIP())}`
            };

            // ─── BUILD MESSAGE ───────────────────────────
            let message = '*🛠️ SYSTEM INFORMATION*\n╭──────────────────────────────╮\n';
            
            Object.entries(metrics).forEach(([key, value]) => {
                message += `│ ${key.padEnd(10)}: ${value} │\n`;
            });
            
            message += '╰──────────────────────────────╯';

            // ─── ATTACH JPG IMAGE ────────────────────────
            const imagePath = path.join(__dirname, '../assets/engine.jpg');
            
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: imagePath },
                    caption: message
                });
            } else {
                await sock.sendMessage(msg.key.remoteJid, { 
                    text: message + '\n\n⚠️ System image unavailable' 
                });
                console.log('Engine JPG not found at:', imagePath);
            }

        } catch (error) {
            console.error('SYSINFO ERROR:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Command failed:\n${error.message}`
            });
        }
    }
};

// ─── SAFE CPU DETECTION ─────────────────────────────
function getCpuInfo() {
    try {
        if (os.cpus()?.length > 0) {
            const cpu = os.cpus()[0];
            return `${cpu.model.split('@')[0].trim()} [${os.cpus().length} cores]`;
        }
        return readCpuInfo() || `${os.arch()} Processor`;
    } catch {
        return 'Unknown CPU';
    }
}

// ─── ANDROID CPU FALLBACK ──────────────────────────
function readCpuInfo() {
    try {
        if (fs.existsSync('/proc/cpuinfo')) {
            const info = fs.readFileSync('/proc/cpuinfo', 'utf8');
            return info.match(/Hardware\s*:\s*(.+)/)?.[1] || 
                   info.match(/model name\s*:\s*(.+)/)?.[1];
        }
    } catch {}
    return null;
}

// ─── FORMATTING HELPERS ────────────────────────────
function formatUptime(seconds) {
    try {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${mins}m`;
    } catch {
        return 'N/A';
    }
}

function formatMemory(bytes) {
    try {
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        return `${(bytes / 1024**i).toFixed(1)}${units[i]}`;
    } catch {
        return 'N/A';
    }
}

function getIP() {
    try {
        for (const iface of Object.values(os.networkInterfaces())) {
            for (const config of iface) {
                if (config.family === 'IPv4' && !config.internal) {
                    return config.address;
                }
            }
        }
    } catch {}
    return 'N/A';
}
