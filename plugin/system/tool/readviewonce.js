let handler = async (m, { sock, quoted }) => {
    try {
        if (!quoted || (!/imageMessage|videoMessage/.test(quoted.type))) {
            return m.reply('Reply view once media to use this command.');
        }

        let media = await quoted.download();
        let type = quoted.type.includes('video') ? 'video' : 'image';

        await sock.sendMessage(m.chat, {
            [type]: media,
            caption: m.quoted.caption || ''
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        sock.sendMessage(m.chat, { text: JSON.stringify(e, null, 2) }, { quoted: m });
    }
};

handler.tags = ['tool'];
handler.command = ['rvo'];

module.exports = handler;