const fetch = require('node-fetch')

const resolution = ['Square', 'Wide', 'Portrait']
const model = ['(none)', 'Cinematic', 'Photographic', 'Anime', 'Manga', 'Digital Art', 'Pixel art', 'Fantasy art', 'Neonpunk', '3D Model']
const apiKey = 'mg-tysiMxAZ08v80mrC8x5mB3yxYKnRlScQ'

const handler = async (m, { sock, text, prefix, command, args, Func }) => {
  if (!text) {
    return m.reply(`Contoh penggunaan:\n${prefix + command} Anime|Square|Beautiful girl with silver long hair and blue eyes\n\nDaftar model: ${model.join(', ')}`);
  }

  // Memisahkan argumen dengan lebih robust
  const parts = text.split('|').map(part => part.trim());
  if (parts.length < 3) {
    return m.reply('Format salah. Gunakan: model|resolusi|prompt\nContoh: Anime|Square|Beautiful girl');
  }

  let [models, res, ...promptParts] = parts;
  let prompt = promptParts.join('|').trim();

  // Validasi model
  if (!model.includes(models)) {
    return m.reply(`Model tidak valid. Pilih salah satu:\n${model.join('\n')}`);
  }
  
  // Validasi resolusi
  if (!resolution.includes(res)) {
    return m.reply(`Resolusi tidak valid. Pilih salah satu:\n${resolution.join('\n')}`);
  }

  // Validasi prompt
  if (!prompt || prompt.length < 5) {
    return m.reply('Prompt terlalu pendek atau kosong');
  }

  try {
    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    
    const baseUrl = 'https://api.maelyn.tech/api/txt2img/animeart';
    const params = new URLSearchParams();
    params.append('prompt', prompt);
    params.append('resolution', res);
    params.append('model', models);
    
    const url = `${baseUrl}?${params.toString()}`;
    
    const requestOptions = {
      method: "GET",
      headers: {
        "mg-apikey": apiKey,
        "Content-Type": "application/json"
      }
    };
    
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    
    if (!json.status || json.status !== "Success" || !json.result?.image?.url) {
      throw new Error('Respons API tidak valid: ' + JSON.stringify(json));
    }
    
    const link = Func.ensureHttps(json.result.image.url);
    
    await sock.sendMessage(m.chat, { 
      image: { url: link },
      caption: `✅ Berhasil dibuat!\nModel: ${models}\nResolusi: ${res}\nPrompt: ${prompt}`
    }, { quoted: m });
    
    await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    await sock.sendMessage(m.chat, { 
      text: `❌ Gagal membuat gambar: ${error.message}\nPastikan format perintah sudah benar.`
    }, { quoted: m });
    await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.tags = ['ai'];
handler.command = ['animagine'];

module.exports = handler;