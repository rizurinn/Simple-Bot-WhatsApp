let handler = async (m, { sock, Func, text, command, prefix }) => {
  // Store search results in a session object
  if (!global.laheluSearch) global.laheluSearch = {}
  
  if (command.toLowerCase() === 'elanjut') {
    // Handle next command
    const userId = m.sender
    if (!global.laheluSearch[userId] || global.laheluSearch[userId].results.length === 0) {
      return m.reply(`Tidak ada hasil pencarian aktif. Gunakan ${prefix}slahelu [kata kunci] terlebih dahulu.`)
    }
    
    const session = global.laheluSearch[userId]
    session.currentIndex++
    
    // Reset to beginning if reached the end
    if (session.currentIndex >= session.results.length) {
      session.currentIndex = 0
      m.reply(`Anda telah mencapai akhir hasil pencarian (${session.results.length} hasil). Kembali ke hasil pertama.`)
    }
    
    return showSearchResult(m, sock, prefix, session.results[session.currentIndex], session.currentIndex + 1, session.results.length)
  }
  
  // Handle search command
  if (!text) return m.reply(`Masukkan kata kunci pencarian\nContoh: ${prefix}slahelu waifu`)
  
  m.reply('Sedang mencari, mohon tunggu...')
  
  try {
    // Fetch data from API
    const apiUrl = `https://api.siputzx.my.id/api/s/lahelu?query=${encodeURIComponent(text)}`
    const res = await Func.fetchJson(apiUrl)
    
    if (!res || !res.status || !res.data || res.data.length === 0) {
      return m.reply(`Tidak ditemukan hasil untuk pencarian "${text}". Coba kata kunci lain.`)
    }
    
    // Save results to session
    const userId = m.sender
    global.laheluSearch[userId] = {
      results: res.data,
      currentIndex: 0,
      query: text
    }
    
    // Show first result
    const session = global.laheluSearch[userId]
    m.reply(`Ditemukan ${session.results.length} hasil untuk "${text}". Menampilkan hasil ke-1.\nKetik ${prefix}elanjut untuk melihat hasil berikutnya.`)
    
    return showSearchResult(m, sock, prefix, session.results[0], 1, session.results.length)
  } catch (e) {
    console.log('Error dalam pencarian:', e)
    m.reply('Terjadi kesalahan saat mencari. Server tidak menanggapi, coba lagi.')
  }
}

// Function to show search result
async function showSearchResult(m, sock, prefix, post, currentIndex, totalResults) {
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
    
    // Clean up post ID - ensure it's just the ID
    let postId = post.postId || post.postID || ""
    if (typeof postId === 'string' && postId.includes('https://lahelu.com/post/')) {
      postId = postId.replace('https://lahelu.com/post/', '')
    }
    
    // Prepare caption
    const caption = `*${post.title || 'Lahelu Post'}*\n\n` +
                   `> User: ${username}\n` +
                   `> Topic: ${post.topicTitle || 'No Topic'}\n` +
                   `> Hashtags: ${post.hashtags?.join(', ') || 'None'}\n` +
                   `> Upvotes: ${post.totalUpvotes || 0}\n` +
                   `> Comments: ${post.totalComments || 0}\n` +
                   `> Tanggal: ${formattedDate}\n\n` +
                   `> Link: https://lahelu.com/post/${postId}\n\n` +
                   `Menampilkan ${currentIndex}/${totalResults}\n_Ketik *${prefix}elanjut* untuk meme berikutnya_`
    
    // Get media URL - check multiple possible fields
    const mediaUrl = post.media || 
                    (post.content && post.content[0] && post.content[0].value) ||
                    (post.mediaUrl) || 
                    null
    
    
    if (mediaUrl) {
      // Send media with caption
      await sock.sendFileUrl(m.chat, mediaUrl, caption, m)
    } else {
      // If no media found, just send the caption
      m.reply(caption + '\n\n[Media tidak ditemukan]')
    }
  } catch (e) {
    console.log('Error dalam menampilkan hasil:', e)
    m.reply(`Terjadi kesalahan saat menampilkan hasil ke-${currentIndex}. Coba ketik ${prefix}elanjut lagi.`)
  }
}

handler.tags = ['search']
handler.command = ['slahelu', 'elanjut']

module.exports = handler