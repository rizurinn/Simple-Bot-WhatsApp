let handler = async (m, {
    sock,
    text,
    prefix,
    command,
    Func,
    scraper
}) => {
    switch (command) {
        case 'instagram':
        case 'ig': {
            if (!text.includes('insta')) return await m.reply(`⚠️ *Penggunaan:* ${prefix + command} https://www.instagram.com/reel/DHQlb4Guctw/?igsh=eGg3ZHdsdXprcmZz`)
            await m.reply(mess.wait)
            
            try {
                const data = await Func.fetchJson(`https://fastrestapis.fasturl.cloud/downup/igdown/advanced?url=${text}&type=detail`)

                if (!data.status === 200) {
                    return await m.reply('⚠️ Gagal mendapatkan URL download!');
                }
                const result = data.result
                
                const caption = `*Uploaded by* ${result.owner.username}\n\n${result.caption.text}`

                if (result.is_video === true) {
                    const urlVid = result.videos[0]
                    await sock.sendFileUrl(m.chat, urlVid, caption, m)
                } else {
                    if (Array.isArray(result.images) && result.images.length > 0) {
                        for (let i = 0; i < result.images.length; i++) {
                            await sock.sendFileUrl(m.chat, result.images[i], null, m)
                        }
                        await m.reply(caption)
                    } else {
                        await m.reply('⚠️ Tidak ada hasil yang ditemukan!')
                    }
                }
				} catch (e) {

            try {
				const hasil = await scraper.instagramDl(text);
				if(hasil.length < 0) return m.reply('⚠️Postingan Tidak Tersedia atau Privat!')

				if (hasil[0].title === 'Download Thumbnail') {
					await sock.sendFileUrl(m.chat, hasil[1].url, null, m)
				} else {
				for (let i = 0; i < hasil.length; i++) {
					await sock.sendFileUrl(m.chat, hasil[i].url, null, m)
				}
				}
            } catch (e) {
             console.error(e)
             m.reply('⚠️Server error')
            }
        }
    }
        break;
        case 'igstory':
        case 'igstorydl': {
            if (!text.includes('insta')) return await m.reply(`⚠️ *Penggunaan:* ${prefix + command} https://www.instagram.com/reel/DHQlb4Guctw/?igsh=eGg3ZHdsdXprcmZz`)
            await m.reply(mess.wait)
            
            try {
                const data = await Func.fetchJson(`https://fastrestapis.fasturl.cloud/downup/igdown/simple?url=${text}`)

                if (!data.status === 200) {
                    return await m.reply('⚠️ Gagal mendapatkan URL download!');
                }
                const result = data.result
console.log(result.data[0])

                        for (let i = 0; i < result.data.length; i++) {
                            await sock.sendFileUrl(m.chat, result.data[i].url, null, m)
                        }


            } catch (e) {
             console.error(e)
             m.reply('⚠️Server error')
            }
        }
        break;
    }
};

handler.tags = ["download"];
handler.command = ["instagram", "ig", "igstory", "igstorydl"];

module.exports = handler;