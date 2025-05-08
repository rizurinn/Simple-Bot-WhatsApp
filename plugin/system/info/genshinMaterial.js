let handler = async (m, { client, text, reply, prefix, command }) => {
  if (!text) return m.reply(`Masukkan nama material! Contoh: ${prefix + command} silk flower`)

  try {
    const res = await fetch(`https://genshin-db-api.vercel.app/api/v5/materials?query=${encodeURIComponent(text)}&dumpResult=true&resultLanguage=Indonesian`)
    const json = await res.json()
    if (!json || !json.result) return m.reply('Material tidak ditemukan.')
    const mat = json.result
    const caption = `
*${mat.name}* ${mat.rarity ? `(${mat.rarity}★)` : ''}
Kategori: ${mat.category || '-'}
Tipe: ${mat.typeText || '-'}
Versi: ${mat.version || '-'}

*Deskripsi:*
${mat.description}

*Sumber:*
${mat.sources?.map(s => `- ${s}`).join('\n') || '-'}
`.trim()
    m.reply(caption)
  } catch (e) {
    console.error(e)
    m.reply(`Terjadi kesalahan saat mengambil data material\n\n${e}`)
  }
}
handler.command = ['genshinmaterial', 'materialgi']
handler.tags = ['info']

module.exports = handler