const fetch = require('node-fetch');

const handler = async (m, { args, prefix, command }) => {
  const link = args[0]?.trim();
  if (!link) {
    return m.reply(`Masukkan URL Pastebin\nContoh: *${prefix + command}* https://pastebin.com/hUsie4as`);
  }
  if (!/^https:\/\/pastebin\.com\/[a-zA-Z0-9]+$/.test(link)) {
    return m.reply('Ups, pastikan URL Pastebin yang di masukan valid');
  }
  const pasteId = link.split('/').pop(); 
  try {
    const response = await fetch(`https://pastebin.com/raw/${pasteId}`);
    if (!response.ok) throw new Error('Gagal mengambil isi dari Pastebin.');
    const content = await response.text();
    if (!content) {
      return m.reply('Tidak ada isi yang ditemukan di Pastebin!');
    }
    m.reply(`${content}`);
  } catch (error) {
    m.reply('Error: ' + error);
  }
};

handler.command = ['pastebin'];
handler.tags = ['download'];
handler.description = 'Download dari pastebin';

module.exports = handler;
