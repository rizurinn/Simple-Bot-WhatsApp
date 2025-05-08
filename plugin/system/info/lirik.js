let handler = async (m, {
    sock,
    text,
    prefix,
    command,
    Func
}) => {
    switch (command) {
        case 'lirik': {
            if (!text) return await m.reply(`*Penggunaan:* ${prefix + command} kingslayer|2`)
            let judul = text.split`|`[0]
			let list = text.split`|`[1]
            
            try {
                const data = await Func.fetchJson(`https://api.ryzumi.vip/api/search/lyrics?query=${encodeURIComponent(judul)}`)

                if (!data[0]) {
                    return await m.reply('Gagal mendapatkan data');
                }

                let lirik = `*${data[list].name}*\n\n${data[list].plainLyrics}`
                    await sock.sendMessage(m.chat, { text: lirik }, { quoted: m })

                if (data[list].syncedLyrics !== null) {
                     let sycLirik = data[list].syncedLyrics
                    await sock.sendMessage(m.chat, {
                        document: Buffer.from(json(sycLirik)),
                        fileName: `syncedLyrics-${data[list].name}.txt`,
                        mimetype: 'application/txt',
                        }, {
                            quoted: m
                        });
                }
            } catch (e) {
             console.error(e)
             m.reply('Lirik tidak ditemukan')
            }
        }
        break;
    }
};

handler.tags = ["info"];
handler.command = ["lirik"];

module.exports = handler;