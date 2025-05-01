module.exports = function(sock) {
    // ==================== UNIVERSAL EVENT CAPTURE ====================
    const allEvents = [
        'messages.upsert',
        'message-receipt.update',
        'presence.update',
        'group-participants.update',
        'status-update',
        'contacts.update',
        'chats.update',
        'chats.delete',
        'connection.update',
        'creds.update'
    ];

    allEvents.forEach(event => {
        sock.ev.on(event, (data) => {
            try {
                logEvent(event, data);
            } catch (err) {
                console.error(`❌ Error handling ${event}:`, err);
            }
        });
    });

    // ==================== SAFE EVENT LOGGING ====================
    function logEvent(event, data) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`\n🕒 [${timestamp}] ${(event || 'UNKNOWN_EVENT').toUpperCase()}`);

        try {
            switch (event) {
                case 'messages.upsert':
                    (data?.messages || []).forEach(msg => {
                        const fromMe = msg?.key?.fromMe ? 'YOU →' : 'THEM ←';
                        const sender = msg?.pushName || msg?.key?.remoteJid?.split('@')[0] || 'UNKNOWN';
                        console.log(`  ${fromMe} ${String(sender).padEnd(15)} | ${getMessageType(msg?.message)}`);

                        if (msg?.message?.conversation) {
                            console.log(`  💬 ${msg.message.conversation}`);
                        }
                    });
                    break;

                case 'message-receipt.update':
                    (Array.isArray(data) ? data : [data]).forEach(update => {
                        const receiptType = update?.receipt?.type || 'UNKNOWN';
                        const remoteJid = update?.key?.remoteJid?.split('@')[0] || 'UNKNOWN';
                        console.log(`  👁️ ${receiptType.toUpperCase()} receipt from ${remoteJid}`);
                    });
                    break;

                case 'presence.update':
                    (Array.isArray(data) ? data : [data]).forEach(update => {
                        Object.entries(update?.presences || {}).forEach(([jid, presence]) => {
                            const user = jid?.split('@')[0] || 'UNKNOWN';
                            const status = presence?.lastKnownPresence || 'offline';
                            console.log(`  👤 ${user} is now ${status}`);
                        });
                    });
                    break;

                case 'group-participants.update':
                    const action = data?.action || 'UNKNOWN_ACTION';
                    const groupId = data?.id?.split('@')[0] || 'UNKNOWN_GROUP';
                    const participants = (data?.participants || []).map(p => p?.split('@')[0] || 'UNKNOWN').join(', ');
                    
                    console.log(`  👥 ${action.toUpperCase()} in ${groupId}:`);
                    console.log(`  🧑‍🤝‍🧑 ${participants}`);
                    break;

                case 'connection.update':
                    console.log(`  🔌 Status: ${data?.connection || 'UNKNOWN'}`);
                    if (data?.qr) console.log('  🔳 QR Code Generated');
                    if (data?.lastDisconnect?.error) {
                        console.log(`  ⚠️ Last Disconnect: ${data.lastDisconnect.error.message}`);
                    }
                    break;

                default:
                    console.log('  📊 Data:', JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error(`⚠️ Error processing ${event}:`, error);
        }
    }

    // ==================== SAFE MESSAGE TYPE DETECTION ====================
    function getMessageType(message) {
        if (!message) return 'UNKNOWN';

        const types = [
            'conversation', 'imageMessage', 'videoMessage',
            'audioMessage', 'stickerMessage', 'contactMessage',
            'locationMessage', 'extendedTextMessage', 'buttonsMessage',
            'templateMessage', 'listMessage', 'viewOnceMessage',
            'ephemeralMessage', 'protocolMessage'
        ];

        for (const type of types) {
            if (message[type]) {
                return type.replace('Message', '').toUpperCase() +
                      (type === 'viewOnceMessage' ? ' (VIEW ONCE)' : '');
            }
        }

        return 'UNKNOWN';
    }

    console.log('🔭 Event listener ready - tracking all activities');
};
