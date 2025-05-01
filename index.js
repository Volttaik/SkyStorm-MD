const fs = require('fs');
const path = require('path');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

// Configure paths
const PATHS = {
    auth: path.join(__dirname, 'auth_info'),
    lib: path.join(__dirname, 'lib'),
    plugins: path.join(__dirname, 'plugins')
};

// Create directories if missing
Object.values(PATHS).forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Logger configuration
const logger = {
    level: 'warn',
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
    fatal: console.error,
    child: () => logger
};

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(PATHS.auth);

        const sock = makeWASocket({
            auth: state,
            logger: logger,
            printQRInTerminal: true,
            browser: ['skystorm', 'linux', '1.0.0']
        });

        // Load handlers
        require(path.join(PATHS.lib, 'eventListener.js'))(sock);
        require(path.join(PATHS.lib, 'commandHandler.js'))(sock, '.'); // '.' is prefix

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) console.log('🔍 Scan the QR code above');

            if (connection === 'open') {
                console.log('✅ Connected to WhatsApp');
                await sock.sendMessage(sock.user.id, {
                    text: `╔════◇
║ *『 WELCOME TO SKY STORM 』*
║ _You complete first step at skystorm._
╚════════════════════════╝
╔═════◇
║  『••• VISIT FOR HELP •••』
║ *Ytube:* _https://www.youtube.com/@user-SkyStormTech_
║ *Owner:* _https://wa.me/2348061938576_
║ *Note :*_type .help to get started_
║ _
╚════════════════════════╝`
                });
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(shouldReconnect ? '🔁 Reconnecting...' : '❌ Connection closed');
                if (shouldReconnect) setTimeout(startBot, 5000);
            }
        });

    } catch (error) {
        console.error('🚨 Startup error:', error);
        if (error.message.includes('missing auth')) {
            console.log('🔑 Starting QR scanner...');
        }
    }
}

startBot();
