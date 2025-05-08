let handler = async (m, {
    sock,
    command,
    text,
    prefix,
    Func
}) => {
    if (!text) return m.reply(`Masukkan teks!\n\nContoh: ${prefix + command} Alya`)
      
    const logoStyles = {
        'cartoon': 'https://archive.lick.eu.org/api/ephoto/cartoon-graffiti-text',
        'underwater': 'https://archive.lick.eu.org/api/ephoto/3d-underwater-text-effect',
        'gradient': 'https://archive.lick.eu.org/api/ephoto/3d-gradient-text-effect',
        'neon': 'https://archive.lick.eu.org/api/flamingtxt/neon-logo',
        'comic': 'https://archive.lick.eu.org/api/flamingtxt/comic-logo',
        'beach': 'https://archive.lick.eu.org/api/ephoto/sand-summer-beach-text',
        'glitch': 'https://archive.lick.eu.org/api/ephoto/pixel-glitch-text-effect',
        'galaxy': 'https://archive.lick.eu.org/api/ephoto/galaxy-style-name-logo',
        'wallpaper': 'https://archive.lick.eu.org/api/ephoto/galaxy-mobile-wallpaper',
        'cloud': 'https://archive.lick.eu.org/api/ephoto/cloud-text-effect'
    }
    
    try {
        let style = command.replace('logo', '')
        
        if (command === 'logo') {
            let menu = `*🎨 LOGO MAKER STYLES 🎨*\n\nGunakan command: ${prefix}logo<style> <teks>\n\nContoh: ${prefix}logoneon Alya\n\n*Styles Available:*\n`
            
            Object.keys(logoStyles).forEach(style => {
                menu += `• ${prefix}logo${style} - ${style.charAt(0).toUpperCase() + style.slice(1)} Style\n`
            })
            
            menu += `\nGunakan ${prefix}logorand <teks> untuk style acak!`
            
            return m.reply(menu)
        }
        
        if (style === 'rand') {
            const styles = Object.keys(logoStyles)
            style = Func.pickRandom(styles)
            m.reply(`Menggunakan style acak: *${style}*`)
        }
        
        if (!logoStyles[style]) {
            return m.reply(`Style logo tidak ditemukan!\nGunakan ${prefix}logo untuk melihat semua style yang tersedia.`)
        }
        
        const url = `${logoStyles[style]}?text=${encodeURIComponent(text)}`
        
        const caption = `*🖼️ Logo ${style.charAt(0).toUpperCase() + style.slice(1)} Style*\n\n*Teks:* ${text}`
        await sock.sendMessage(m.chat, { image: { url }, caption }, { quoted: m })
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan saat membuat logo!')
    }
}

handler.command = [
    'logo',
    'logocartoon',
    'logounderwater',
    'logogradient',
    'logoneon',
    'logocomic',
    'logobeach',
    'logoglitch',
    'logogalaxy',
    'logowallpaper',
    'logocloud',
    'logorand'
]
handler.tags = ['maker']
handler.hideCmd = [
    'logocartoon',
    'logounderwater',
    'logogradient',
    'logoneon',
    'logocomic',
    'logobeach',
    'logoglitch',
    'logogalaxy',
    'logowallpaper',
    'logocloud',
    'logorand'
]

module.exports = handler