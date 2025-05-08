/*
Jangan Hapus Wm Bang 

*Random Meme Plugins Esm*

Tak Tawu Lah Inggris Semua 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

Di Kasih Tw ZErvida 
*/

let handler = async (m, { sock }) => {

  await sock.sendMessage(m.chat, {
    image: { url: 'https://img.randme.me/' },
    caption: '*Random Meme*'
  }, { quoted: m });
};

handler.command = ['meme'];
handler.tags = ['random'];

module.exports = handler;