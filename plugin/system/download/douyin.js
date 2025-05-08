const fetch = require('node-fetch')
const cheerio = require('cheerio')

const douyin = async (url) => {
  const apiUrl = "https://lovetik.app/api/ajaxSearch"
  const formBody = new URLSearchParams()
  formBody.append("q", url)
  formBody.append("lang", "id")

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "*/*",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: formBody.toString()
  })

  const data = await res.json()
  if (data.status !== "ok") throw "Gagal mengambil data Douyin."

  const $ = cheerio.load(data.data)
  const title = $("h3").text()
  const thumbnail = $(".image-tik img").attr("src")
  const duration = $(".content p").text()
  const dl = []

  $(".dl-action a").each((i, el) => {
    dl.push({
      text: $(el).text().trim(),
      url: $(el).attr("href")
    })
  })

  return { title, thumbnail, duration, dl }
}

const handler = async (m, { sock, args, prefix, command }) => {
  const url = args[0]
  if (!url) return await m.reply(`Contoh: ${prefix + command} https://v.douyin.com/iPHW24DE/`)

  await sock.sendMessage(m.chat, { react: { text: "🎀", key: m.key } })

  try {
    const result = await douyin(url)
    const caption = `*Judul:* ${result.title}\n*Durasi:* ${result.duration}`

    const video = result.dl.find(v => /mp4/i.test(v.text))
    const audio = result.dl.find(v => /mp3/i.test(v.text))

    if (video) {
      await sock.sendMessage(m.chat, {
        video: { url: video.url },
        caption
      }, { quoted: m })
    }

    if (audio) {
      await sock.sendMessage(m.chat, {
        audio: { url: audio.url },
        mimetype: 'audio/mp4'
      }, { quoted: m })
    }

    if (!video && !audio) {
      m.reply('Tidak ditemukan link video atau audio.')
    }
  } catch (e) {
    console.error(e)
    m.reply('Gagal mengunduh video Douyin. Pastikan link valid.')
  }
}

handler.command = ['douyin']
handler.tags = ['download']

module.exports = handler