const handler = async (m, { sock, text, prefix, command, scraper, Func }) => {
  if (!text) {
    return m.reply(`Contoh penggunaan:\n${prefix + command} 20622101`);
  }

  try {
    const response = await Func.fetchJson(`https://api.ryzendesu.vip/api/search/mahasiswa?query=${encodeURIComponent(text)}`);
    
    if (!response) 
    { 
    throw new Error('Data tidak ditemukan');
    };
    
    const data = response.slice(0, 25);
    let caption = `*HASIL PENCARIAN DATA*\n\n\n`;
    data.forEach((data, index) => { caption += `*${index + 1}. ${data.nama}* (*${data.nim}*)\n *Perguruan Tinggi:* ${data.nama_pt}\n *Prodi:* ${data.nama_prodi}\n\n`});
    
    await m.reply(caption);
    
  } catch (error) {
    console.error('Error:', error);
    await sock.sendMessage(m.chat, { 
      text: `❌ Gagal memuat: ${error.message || String(error)}`
    }, { quoted: m });
  }
};

handler.tags = ['info'];
handler.command = ['pddikti'];

module.exports = handler;