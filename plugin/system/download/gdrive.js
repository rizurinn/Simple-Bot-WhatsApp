const axios = require('axios')
const { writeFileSync } = require('fs')
const { tmpdir } = require('os')
const path = require('path')

let handler = async (m, { args, prefix, command, sock }) => {
  const url = args[0]
  if (!url) m.reply(`Contoh: ${prefix + command} https://drive.google.com/file/d/xxxxxxxxx/view`)

  const fileId = await extractGDrive(url)
  if (!fileId) m.reply('URL Google Drive tidak valid!')

  try {
    const apiKey = 'AIzaSyAA9ERw-9LZVEohRYtCWka_TQc6oXmvcVU'
    const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,size,mimeType&key=${apiKey}`
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`

    const metadata = await axios.get(metaUrl)
    const { name, size, mimeType } = metadata.data

    m.reply(`Mendownload file...\n\n• Nama: ${name}\n• Ukuran: ${await formatSize(size)}\n• Tipe: ${mimeType}`)

    const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' })

    if (res.status !== 200) {
      m.reply(`Gagal mengunduh file: ${res.status} ${res.statusText}`)
    }

    const buffer = Buffer.from(res.data, 'binary')
    const tmpPath = path.join(tmpdir(), name)
    writeFileSync(tmpPath, buffer)

    await sock.sendMessage(m.chat, {
      document: { url: tmpPath },
      fileName: name,
      mimetype: mimeType || 'application/octet-stream',
      caption: `File berhasil diunduh!\n\n• Nama: ${name}\n• Ukuran: ${await formatSize(size)}`
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    throw typeof err === 'string' ? err : `Terjadi kesalahan: ${err.response?.status} ${err.response?.statusText}`
  }
}

handler.tags = ['download']
handler.command = ['gdrive']

module.exports = handler

async function extractGDrive(url) {
  const match = url.match(/\/d\/([^/]+)|open\?id=([^&]+)/)
  return match ? (match[1] || match[2]) : null
}

async function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
}