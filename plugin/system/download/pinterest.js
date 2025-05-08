/* 
• Plugins Pinterest DL Support Image & Video
• Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• Source Scrape: https://whatsapp.com/channel/0029VagEmD96hENqH9AdS72V
*/

const axios = require('axios')
const cheerio = require('cheerio')

let handler = async (m, { sock, args, prefix, command }) => {
  const url = args[0]
  if (!url) return m.reply(`Contoh:\n${prefix + command} https://id.pinterest.com/pin/575757133623547811/`)

  if (!/^https:\/\/([a-z]+\.)?pinterest\.com\/pin\/\d+/.test(url)) {
    return m.reply('URL Pinterest tidak valid!')
  }

  await sock.sendMessage(m.chat, { react: { text: '🎀', key: m.key } })

  try {
    const res = await pinterestDownloader(url)
    if (!res.status) throw res.message

    const item = res.result[0]
    if (!item || !item.media) return m.reply('Media tidak ditemukan.')

    const isVideo = item.media.match(/\.(mp4|mov|webm)(\?|$)/i)
    const isImage = item.media.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)

    if (isVideo) {
      await sock.sendMessage(m.chat, {
        video: { url: item.media },
        caption: `Quality: ${item.quality}\nFormat: ${item.format}`
      }, { quoted: m })
    } else if (isImage) {
      await sock.sendMessage(m.chat, {
        image: { url: item.media },
        caption: `Format: ${item.format}`
      }, { quoted: m })
    } else {
      return m.reply('Jenis media tidak didukung.')
    }

    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    await sock.sendMessage(m.chat, { text: `Terjadi kesalahan:\n${err}` }, { quoted: m })
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.tags = ['download']
handler.command = ['pindl']

module.exports = handler

async function pinterestDownloader(url) {
  try {
    const { data } = await axios.get(
      `https://www.savepin.app/download.php?url=${encodeURIComponent(url)}&lang=en&type=redirect`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://www.savepin.app/'
        }
      }
    )

    const $ = cheerio.load(data)
    const results = []

    const table = $('table').has('tr:contains("Quality"), tr:contains("480p")').first()

    table.find('tr').each((_, el) => {
      const quality = $(el).find('.video-quality').text().trim()
      const format = $(el).find('td:nth-child(2)').text().trim()
      const link = $(el).find('a').attr('href')
      if (quality && link) {
        results.push({
          quality,
          format,
          media: link.startsWith('http') ? link : 'https://www.savepin.app' + (link.startsWith('/') ? link : '/' + link)
        })
      }
    })

    return results.length
      ? { status: true, result: results }
      : { status: false, message: 'Tidak ada media yang bisa diunduh.' }

  } catch (error) {
    return { status: false, message: error.message }
  }
}