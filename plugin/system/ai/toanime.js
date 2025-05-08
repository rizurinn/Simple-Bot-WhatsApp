const fetch = require('node-fetch')

const handler = async (m, { sock, prefix, command, Uploader }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`Kirim atau balas gambar dengan caption *${prefix + command}*`)
  }

  try {
    const buffer = await q.download()
    if (!buffer) throw 'Gagal mengunduh gambar'

    const imageUrl = await Uploader.tmpfiles(buffer)
    const apiUrl = `https://api.nekorinn.my.id/tools/img2anime?imageUrl=${encodeURIComponent(imageUrl)}`

    const res = await fetch(apiUrl)
    const contentType = res.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      const json = await res.json()
      if (!json.status || !json.result) throw 'Gagal memproses gambar dari API'

      await sock.sendMessage(m.chat, {
        image: { url: json.result },
        caption: 'Nih kamu jadi animek, Sensei!'
      }, { quoted: m })
    } else {
      const resultImage = await res.buffer()
      await sock.sendMessage(m.chat, {
        image: resultImage,
        caption: 'Nih kamu jadi animek, Sensei!'
      }, { quoted: m })
    }

  } catch (e) {
    console.error('Rest api tidak merespon sensei:(', e)
    await sock.sendMessage(m.chat, {
      text: 'Terjadi kesalahan saat memproses gambar.'
    }, { quoted: m })
  }
}

handler.tags = ['ai']
handler.command = ['toanime']

module.exports = handler