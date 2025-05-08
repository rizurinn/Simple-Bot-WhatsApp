const fetch =require('node-fetch')

let handler = async (m, { sock, prefix, command, Uploader }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''
  if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(`Kirim atau balas gambar dengan caption *${prefix + command}*`)
  }

  m.reply("⏳ Memproses gambar...")

  try {
    let media = await q.download()
    let imageUrl = await Uploader.tmpfiles(media)

    if (!imageUrl) throw '❌ Gagal mengunggah gambar.'

    console.log('✅ URL Gambar:', imageUrl)

    let api = `https://fgsi1-restapi.hf.space/api/ai/toGhibli?url=${encodeURIComponent(imageUrl)}`
    let res = await fetch(api)

    // Kalau balik langsung gambar
    if (res.headers.get("content-type").startsWith("image")) {
      let buffer = await res.buffer()
      return await sock.sendFile(m.chat, buffer, 'ghibli.jpg', '✨ Berikut hasil style Ghibli!', m)
    }

    // Kalau balik JSON error
    let err = await res.json()
    console.log('❌ API Error:', err)
    throw err.message || 'Gagal memproses gambar.'
    
  } catch (e) {
    console.error('❌ Error:', e)
    m.reply("❌ Gagal mengubah gambar.")
  }
}

handler.help = ['ghibli']
handler.tags = ['ai']
handler.command = ['ghibli']

module.exports = handler