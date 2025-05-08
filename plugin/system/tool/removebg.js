/* *Remove Image Background*
 * Type: Case & plugin
 * Mampir vchatsz.web.app
 * Sumber skrep: https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/204
 */

const fs = require('fs').promises
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')

const api = {
  base: 'https://removal.ai',
  remove: 'https://api.removal.ai',
  endpoint: {
    webtoken: '/wp-admin/admin-ajax.php',
    remove: '/3.0/remove',
    slug: '/upload/'
  }
}

const headers = { 'user-agent': 'Postify/1.0.0' }


let handler = async (m, { sock, prefix, command }) => {
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''

    if (!/image/.test(mime)) return m.reply(`Kirim/kutip gambar dengan caption ${prefix + command}`)
    await sock.sendMessage(m.chat, { react: { text: "🔎", key: m.key} })

    try {
        const media = await quoted.download()
        const result = await NoBG(media)

        sock.sendMessage(m.chat, { image: { url: result }, caption: '' }, { quoted: m })
    } catch (err) {
        console.error('Terjadi kesalahan:', err)
        m.reply('Terjadi kesalahan')
    }
}

handler.command = ["removebg", "rmbg"]
handler.tags = ["tool"]

module.exports = handler

// Fungsi na

async function NoBG(input) {

  const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase()
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg'
      case '.png':
        return 'image/png'
      case '.webp':
        return 'image/webp'
      default:
        return 'image/jpeg'
    }
  }

  let imgBuffer
  let imgFileName
  let imgType

  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      try {
        const response = await axios.get(input, { responseType: 'arraybuffer' })
        const contentType = response.headers['content-type']
        imgBuffer = Buffer.from(response.data)

        imgFileName = input.split('/').pop().split('#')[0].split('?')[0]
        imgType = contentType

      } catch (err) {
        throw Error(err.message)
      }
    } else {
      try {
        imgBuffer = await fs.readFile(input)
        imgFileName = path.basename(input)
        imgType = getMimeType(input)
      } catch (err) {
        throw Error(err.message)
      }
    }
  } else if (Buffer.isBuffer(input)) {
    imgBuffer = input
    imgFileName = 'buffer_image.png'
    imgType = 'image/png'
  } else {
    throw Error('Harus berupa URL, image path atau buffer')
  }

  let security
  try {
    const response = await axios.get(`${api.base}${api.endpoint.slug}`)
    const sc = response.data.match(/ajax_upload_object = (.*?);/)

    security = JSON.parse(sc[1]).security
  } catch (err) {
    throw Error(err.message)
  }

  let webtoken
  try {
    const response = await axios.get(`${api.base}${api.endpoint.webtoken}`, {
      params: { action: 'ajax_get_webtoken', security },
      headers: {
        ...headers,
        'Referer': `${api.base}${api.endpoint.slug}`,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    webtoken = response.data.data.webtoken
  } catch (err) {
    throw Error(err.message)
  }

  try {
    const formData = new FormData()
    formData.append('image_file', imgBuffer, {
      filename: imgFileName,
      contentType: imgType
    })

    const response = await axios.post(`${api.remove}${api.endpoint.remove}`, formData, {
      headers: {
        ...headers,
        'authority': 'api.removal.ai',
        'origin': api.base,
        'web-token': webtoken,
        ...formData.getHeaders()
      }
    })

    const { status, ...resx } = response.data
    return resx.url

  } catch (err) {
    throw Error(err.message)
  }
}