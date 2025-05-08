let handler = async (m, { sock, Func, text, prefix, command }) => {
  if (!text) return m.reply(`Masukkan URL Lahelu yang ingin diunduh\nContoh: ${prefix + command} https://lahelu.com/post/PU0rWrlnK`)
  
  let postId = text.match(/post\/([A-Za-z0-9]+)/)?.[1]
  if (!postId) return m.reply('URL tidak valid. Pastikan format URL: https://lahelu.com/post/POSTID')
  
  m.reply('Sedang memproses, mohon tunggu...')
  
  try {
    const apiUrl = `https://api.siputzx.my.id/api/d/lahelu?url=https://lahelu.com/post/${postId}`
    const res = await Func.fetchJson(apiUrl)
    
    if (!res || !res.status) return m.reply('Gagal mengunduh konten. Pastikan URL valid dan server merespons.')
    
    const caption = `*${res.title || 'Lahelu Download'}*\n\n` +
                   `> User: @${res.result.userUsername}\n` +
                   `> Hashtags: ${res.hashtags.join(', ')}\n\n` +
                   `> Total Upvotes: ${res.result.totalUpvotes}\n` +
                   `> Total Comments: ${res.result.totalComments}`
    
    const mediaUrl = res.media
    
    if (mediaUrl) {
      await sock.sendFileUrl(m.chat, mediaUrl, caption, m)
    } else {
      m.reply(caption + '\n\n[Media tidak ditemukan]')
    }
  } catch (e) {
    console.log(e)
    m.reply('Terjadi kesalahan saat mengunduh. Server tidak menanggapi, coba lagi.')
  }
}

handler.tags = ['download']
handler.command =  ['laheludl', 'laheludownload']

module.exports = handler