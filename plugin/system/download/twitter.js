const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('qs')

async function twitterDl(link) {
  try {
    const token = await axios.post('https://x2twitter.com/api/userverify', 'url=' + link)
    const data = qs.stringify({
      q: link,
      lang: 'en',
      cftoken: token.data.token
    })

    const html = await axios.post('https://x2twitter.com/api/ajaxSearch', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const $ = cheerio.load(html.data.data)
    let result = {}

    if ($('.tw-video').length > 0) {
      result.type = 'video'
      result.title = $('.clearfix h3').text().trim()
      result.duration = $('.clearfix p').text().trim()
      result.thumbnail = $('.image-tw img').attr('src')
      result.download = []

      $('.dl-action a').each((_, el) => {
        const quality = $(el).text().trim()
        if (quality.includes('Download MP4')) {
          result.download.push({
            link: $(el).attr('href'),
            quality
          })
        }
      })
    } else if ($('.video-data').length > 0 || $('.download-items__thumb img').length > 0) {
      result.type = 'photo'
      result.thumb = $('.download-items__thumb img').attr('src')
      result.download = $('.download-items__btn a').attr('href')
    }

    return result
  } catch (err) {
    throw 'Gagal mengunduh media dari Twitter/X. Coba lagi nanti.'
  }
}

const handler = async (m, { text, sock, prefix, command }) => {
  if (!text || (!text.includes('twitter.com') && !text.includes('x.com'))) {
    return m.reply(`Example: ${prefix + command} https://x.com/memeunivrse/status/1908344782289854746?s=09`)
  }

  try {
    await sock.sendMessage(m.chat, {
      react: { text: '🎀', key: m.key }
    })

    const res = await twitterDl(text)

    if (res.type === 'video' && res.download.length > 0) {
      const videoRes = await axios.get(res.download[0].link, {
        responseType: 'arraybuffer'
      })

      await sock.sendMessage(m.chat, {
        video: videoRes.data,
        caption: `*Judul:* ${res.title || 'Tidak diketahui'}\n*Durasi:* ${res.duration || '-'}`
      }, { quoted: m })
    } else if (res.type === 'photo' && res.download) {
      const imgRes = await axios.get(res.download, { responseType: 'arraybuffer' })

      await sock.sendMessage(m.chat, {
        image: imgRes.data,
        caption: 'Foto dari X/Twitter'
      }, { quoted: m })
    } else {
      m.reply('Media tidak ditemukan atau tidak didukung.')
    }
  } catch (err) {
    m.reply(typeof err === 'string' ? err : 'Terjadi kesalahan saat mengambil media.')
  }
}

handler.command = ['twitter']
handler.tags = ['download']

module.exports = handler