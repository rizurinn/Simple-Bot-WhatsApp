const axios = require("axios");
const fetch = require("node-fetch");
const { fetchJson } = require("../../../lib/function");


let handler = async (m, { sock, args }) => {
    if (!args[0]) return m.reply("Gunakan format: *!soundcloud <judul lagu>*");

    try {
        const query = args.join(' ');
        let result = await fetchJson(`https://api.nekorinn.my.id/search/soundcloud?q=${encodeURIComponent(query)}`);
        if (!result.statusCode === 200) return await m.reply("Tidak ada hasil ditemukan.");

        let data = result.result;
        let track = data[0];
        let downloadData = await fetchJson(`https://api.siputzx.my.id/api/d/soundcloud?url=${track.link}`)

        if (!downloadData) return m.reply("Gagal mendapatkan link download.");

        let message = `*SoundCloud Download:*\n\n> *Judul:* ${downloadData.title}\n> *Deskripsi:* ${downloadData.title}\n> *Link:* ${track.link}\n\nSedang mengirim audio...`;

        await sock.sendMessage(m.chat, {
            text: message,
            contextInfo: {
               isForwarded: true,
               mentionedJid: [m.sender],
               externalAdReply: {
                   title: downloadData.title,
                   body: downloadData.user,
                  thumbnailUrl: downloadData.thumbnail,
                  mediaType: 1,
                  renderLargerThumbnail: false
                                        },
                                    }
        }, { quoted: m });

        await sock.sendMessage(m.chat, {
            audio: { url: downloadData.url },
            mimetype: "audio/mp4"
        }, { quoted: m });

    } catch (error) {
        console.log(error)
        m.reply("Terjadi kesalahan, coba lagi nanti.");
    }
};

handler.command = ["soundcloud", "scsearch"];
handler.tags = "search"

module.exports = handler;