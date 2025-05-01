module.exports = {
    name: 'whois',
    aliases: ['info', 'user'],
    description: 'Get user phone number and JID with verified information',
    execute: async ({ sock, msg }) => {
        try {
            // 1. Check if message is a reply
            const context = msg.message?.extendedTextMessage?.contextInfo;
            if (!context) {
                return await sock.sendMessage(
                    msg.key.remoteJid,
                    { text: '🔍 Reply to a message to use this command' },
                    { quoted: msg }
                );
            }

            // 2. Get target JID (from either participant or remoteJid)
            const targetJid = context.participant || context.remoteJid;
            if (!targetJid) throw new Error('Could not identify user');

            // 3. Extract phone number from JID
            const phoneNumber = targetJid.split('@')[0];

            // 4. Get additional verification info from contacts.update
            let verifiedName = null;
            try {
                const contact = await sock.onWhatsApp(targetJid);
                verifiedName = contact?.[0]?.verifiedName || null;
            } catch (e) {
                console.log('Could not fetch verified name:', e.message);
            }

            // 5. Get profile picture
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            } catch (error) {
                console.log('Profile picture not available:', error.message);
            }

            // 6. Format response with verification badge if available
            const verificationBadge = verifiedName ? ' ✅' : '';
            const caption = `📱 *User Identification*${verificationBadge}\n\n` +
                          `• Phone: ${phoneNumber}\n` +
                          `• JID: ${targetJid}\n` +
                          (verifiedName ? `• Verified: ${verifiedName}\n` : '') +
                          `\n🌩️ Powered by @skystorm`;

            // 7. Send response
            if (ppUrl) {
                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        image: { url: ppUrl },
                        caption: caption,
                        mentions: [targetJid]
                    },
                    { quoted: msg }
                );
            } else {
                await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: caption,
                        mentions: [targetJid]
                    },
                    { quoted: msg }
                );
            }

        } catch (error) {
            console.error('Whois Error:', error);
            await sock.sendMessage(
                msg.key.remoteJid,
                { text: `❌ Error: ${error.message}` },
                { quoted: msg }
            );
        }
    }
};
