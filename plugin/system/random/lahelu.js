let handler = async (m, { sock, Func, text, command, prefix }) => {
  if (!global.laheluRandom) global.laheluRandom = {}
  
  if (command.toLowerCase() === 'rnext') {
    const userId = m.sender
    if (!global.laheluRandom[userId] || global.laheluRandom[userId].results.length === 0) {
      return m.reply(`Gunakan ${prefix}rlahelu terlebih dahulu.`)
    }
    
    const session = global.laheluRandom[userId]
    session.currentIndex++
    
    if (session.currentIndex >= session.results.length) {
      session.currentIndex = 0
      m.reply(`Anda telah mencapai akhir hasil pencarian (${session.results.length} hasil). Kembali ke hasil pertama.`)
    }
    
    return showRandomResult(m, sock, prefix, session.results[session.currentIndex], session.currentIndex + 1, session.results.length)
  }
  
  try {
    const apiUrl = `https://api.siputzx.my.id/api/r/lahelu`
    const res = await Func.fetchJson(apiUrl)
    
    if (!res || !res.status || !res.data || res.data.length === 0) {
      return m.reply(`Tidak ditemukan hasil untuk pencarian "${text}". Coba kata kunci lain.`)
    }
    
    const userId = m.sender
    global.laheluRandom[userId] = {
      results: res.data,
      currentIndex: 0,
      query: text
    }
    
    const session = global.laheluRandom[userId]

    
    return showRandomResult(m, sock, prefix, session.results[0], 1, session.results.length)
  } catch (e) {
    console.log('Error dalam pencarian:', e)
    m.reply('Terjadi kesalahan saat mencari. Server tidak menanggapi, coba lagi.')
  }
}

async function showRandomResult(m, sock, prefix, post, currentIndex, totalResults) {
  try {
    let formattedDate = "Tidak diketahui"
    if (post.createTime) {
      try {
        const createDate = new Date(post.createTime)
        formattedDate = `${createDate.getDate()}/${createDate.getMonth() + 1}/${createDate.getFullYear()}`
      } catch (e) {
        console.log('Error format tanggal:', e)
      }
    }
    
    // Clean up username - remove URL if present
    let username = post.userUsername || post.userId || "Tidak diketahui"
    if (username.startsWith('https://lahelu.com/user/')) {
      username = username.replace('https://lahelu.com/user/', '')
    }
    
    let postId = post.postId || post.postID || ""
    if (typeof postId === 'string' && postId.includes('https://lahelu.com/post/')) {
      postId = postId.replace('https://lahelu.com/post/', '')
    }
    
    const caption = `*${post.title || 'Lahelu Random'}*\n\n` +
                   `> User: ${username}\n` +
                   `> Hashtags: ${post.hashtags?.join(', ') || 'None'}\n` +
                   `> Upvotes: ${post.totalUpvotes || 0}\n` +
                   `> Comments: ${post.totalComments || 0}\n` +
                   `> Tanggal: ${formattedDate}\n\n` +
                   `> Link: https://lahelu.com/post/${postId}\n\n` +
                   `Menampilkan ${currentIndex}/${totalResults}\n_Ketik *${prefix}rnext* untuk meme berikutnya_`
    
    const mediaUrl = post.media || 
                    (post.content && post.content[0] && post.content[0].value) ||
                    (post.mediaUrl) || 
                    null
    
    
    if (mediaUrl) {
      await sock.sendFileUrl(m.chat, mediaUrl, caption, m)
    } else {
      m.reply(caption + '\n\n[Media tidak ditemukan]')
    }
  } catch (e) {
    console.log('Error dalam menampilkan hasil:', e)
    m.reply(`Terjadi kesalahan saat menampilkan hasil ke-${currentIndex}. Coba ketik ${prefix}rnext lagi.`)
  }
}

handler.tags = ['random']
handler.command = ['lahelu', 'rnext']
handler.hideCmd = ['rnext']

module.exports = handler