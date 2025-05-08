const axios = require("axios");

let handler = async (m, {
    sock,
    text
}) => {
    if (!text) return await m.reply('Masukin nama karakter Genshin-nya dulu dong!')
    try {
        await sock.sendMessage(m.chat, {
            react: {
                text: '🖼️',
                key: m.key
            }
        });
        const imageUrl = `https://api.ownblox.biz.id/api/genshinbuild?q=${text.toLowerCase()}`;
        const caption = `Build karakter untuk: *${text}*`;
        await sock.sendMessage(m.chat, {
            image: {
                url: imageUrl
            },
            caption: caption.trim()
        }, {
            quoted: m
        });
        await sock.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        });
    } catch (e) {
        console.error('Error:', e);
        m.reply(`Terjadi kesalahan: ${e.message || e}`);
    }
};

handler.command = ['genshinbuild'];
handler.tags = ['internet'];

module.exports = handler;