let handler = async (m, { sock, prefix, command, Uploader }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = (quoted.msg || quoted).mimetype || ''
  if (!/image/.test(mime)) return m.reply(`Kirim/kutip gambar dengan caption ${prefix + command}`)
  await sock.sendMessage(m.chat, { react: { text: "🔎", key: m.key} })

  try {
    const media = await quoted.download();
    const url = await Uploader.tmpfiles(media)

    await sock.sendFileUrl(m.chat, `https://api.siputzx.my.id/api/tools/dewatermark?url=${url}`, 'Done', m)
  } catch (err) {
    console.error('Terjadi kesalahan:', err)
    m.reply('Terjadi kesalahan')
  }
}

handler.tags = ["tool"]
handler.command = ["deletewm", "delwm"]

module.exports = handler;