const fonts = {
  font1: {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
  },
  font2: {
    a: '🄰', b: '🄱', c: '🄲', d: '🄳', e: '🄴', f: '🄵', g: '🄶',
    h: '🄷', i: '🄸', j: '🄹', k: '🄺', l: '🄻', m: '🄼', n: '🄽',
    o: '🄾', p: '🄿', q: '🅀', r: '🅁', s: '🅂', t: '🅃', u: '🅄',
    v: '🅅', w: '🅆', x: '🅇', y: '🅈', z: '🅉'
  },
  font3: {
    a: '🅰', b: '🅱', c: '🅲', d: '🅳', e: '🅴', f: '🅵', g: '🅶',
    h: '🅷', i: '🅸', j: '🅹', k: '🅺', l: '🅻', m: '🅼', n: '🅽',
    o: '🅾', p: '🅿', q: '🆀', r: '🆁', s: '🆂', t: '🆃', u: '🆄',
    v: '🆅', w: '🆆', x: '🆇', y: '🆈', z: '🆉'
  }
}

const handler = async (m, { sock, text }) => {
  if (!text.includes('|')) {
    return m.reply(`Contoh:\n.reactch font1|https://whatsapp.com/channel/abc/123|halo dunia
 Font 1 : 🅐🅑🅒🅓
 Font 2 : 🄰🄱🄲🄳
 Font 3 : 🅰🅱🅲🅳`)
  }

  let [fontKey, link, ...messageParts] = text.split('|')
  fontKey = fontKey.trim().toLowerCase()
  link = link.trim()
  const msg = messageParts.join('|').trim().toLowerCase()

  if (!fonts[fontKey]) {
    return m.reply(`Font tidak dikenal. Gunakan salah satu dari: ${Object.keys(fonts).join(', ')}`)
  }

  if (!link.startsWith("https://whatsapp.com/channel/")) {
    return m.reply("Link tidak valid. Harus diawali dengan https://whatsapp.com/channel/")
  }

  const gaya = fonts[fontKey]
  const emoji = msg.split('').map(c => c === ' ' ? '―' : (gaya[c] || c)).join('')

  try {
    const [ , , , , channelId, messageId ] = link.split('/')
    const res = await sock.newsletterMsg(channelId, {
    type: 'INFO' });
    await sock.newsletterMsg(res.id, {
    react: emoji,
    id: messageId });
    m.reply(`✅ Reaksi *${emoji}* berhasil dikirim ke channel *${res.name}*.`)
  } catch (e) {
    console.error(e)
    m.reply("❌ Error\nGagal mengirim reaksi. Cek link atau koneksi!")
  }
}

handler.command = ['reactch', 'rch']
handler.tags = ['tool']

module.exports = handler