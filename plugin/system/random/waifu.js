const { pickRandom, fetchJson } = require('../../../lib/function')

let handler = async (m, { sock }) => {

  const res = await fetchJson('https://api.waifu.pics/sfw/waifu')
  const url = ['https://api.siputzx.my.id/api/r/waifu', 'https://api.siputzx.my.id/api/r/neko', 'https://api.nekorinn.my.id/waifuim/waifu', 'https://api.nekorinn.my.id/waifuim/uniform', res.url]
  
  const link = pickRandom(url)
  try {
  await sock.sendMessage(m.chat, {
    image: { url: link }
  }, { quoted: m });
} catch (e) {
  console.log(e)
  m.reply('Server tidak menanggapi, coba lagi')
}
};

handler.command = ['waifu'];
handler.tags = ['random'];

module.exports = handler;