const ttsBA = require('../../../scraper/src/ttsBA');
const readmore = String.fromCharCode(8206).repeat(999)

const karakter = ['Airi', 'Akane', 'Akari', 'Ako', 'Aris', 'Arona', 'Aru', 'Asuna', 'Atsuko', 'Ayane', 'Azusa', 'Cherino', 'Chihiro', 'Chinatsu', 'Chise', 'Eimi', 'Erica', 'Fubuki', 'Fuuka', 'Hanae', 'Hanako', 'Hare', 'Haruka', 'Hasumi', 'Hibiki', 'Hihumi', 'Himari', 'Hina', 'Hinata', 'Hiyori', 'Hoshino', 'Iori', 'Iroha', 'Izumi', 'Izuna', 'Juri', 'Kaede', 'Karin', 'Kayoko', 'Kazusa', 'Kirino', 'Koharu', 'Kokona', 'Kotama', 'Kotori', 'Main', 'Maki', 'Mari', 'Marina', 'Mashiro', 'Michiru', 'Midori', 'Miku', 'Mimori', 'Misaki', 'Miyako', 'Miyu', 'Moe', 'Momoi', 'Momoka', 'Mutsuki', 'NP0013', 'Natsu', 'Neru', 'Noa', 'Nodoka', 'Nonomi', 'Pina', 'Rin', 'Saki', 'Saori', 'Saya', 'Sena', 'Serika', 'Serina', 'Shigure', 'Shimiko', 'Shiroko', 'Shizuko', 'Shun', 'ShunBaby', 'Sora', 'Sumire', 'Suzumi', 'Tomoe', 'Tsubaki', 'Tsurugi', 'Ui', 'Utaha', 'Wakamo', 'Yoshimi', 'Yuuka', 'Yuzu', 'Zunko'];
const speed = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0'];

const handler = async (m, { sock, text, prefix, command, args, scraper }) => {
  if (!text) {
    return m.reply(`Contoh penggunaan:\n${prefix + command} Shiroko|1.2|こんにちは、先生！今日も頑張りましょう！`);
  }

  const parts = text.split('|').map(part => part.trim());
  if (parts.length < 3) {
    return m.reply('Format salah. Gunakan: karakter|speed|teks\nContoh: Shiroko|1.2|こんにちは、先生！今日も頑張りましょう！');
  }

  let [char, speeds, ...promptParts] = parts;
  let prompt = promptParts.join('|').trim();

  if (!karakter.includes(char)) {
    return m.reply(`Model tidak valid. Pilih salah satu:${readmore}\n${karakter.join('\n')}`);
  }
  
  if (!speed.includes(speeds)) {
    return m.reply(`Speed tidak valid. Pilih dari ${speed.join(', ')}`);
  }

  if (!prompt || prompt.length < 4) {
    return m.reply('Prompt terlalu pendek atau kosong');
  }

  try {
    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    
    const [translatedText, detectedLang] = await scraper.translate(prompt, "ja");
    
    const finalPrompt = detectedLang === "ja" ? prompt : translatedText;
    
    if (detectedLang !== "ja") {
      await sock.sendMessage(m.chat, { 
        text: `💬 Teks diterjemahkan dari ${detectedLang} ke Jepang:\n${finalPrompt}`
      }, { quoted: m });
    }
    
    const characterFormat = 'JP_' + char;
    
    const speedNum = parseFloat(speeds);
    
    const response = await ttsBA.sendRequest(finalPrompt, characterFormat, speedNum);
    
    const audioUrl = response.audioUrlsWavNya;
    
    await sock.sendMessage(m.chat, { 
      audio: { url: audioUrl },
      mimetype: "audio/mp4",
      ptt: true
    }, { quoted: m });
    
    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    await sock.sendMessage(m.chat, { 
      text: `❌ Gagal memuat: ${error.message || String(error)}\nPastikan format perintah sudah benar.`
    }, { quoted: m });
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.tags = ['ai'];
handler.command = ['ttsba'];

module.exports = handler;