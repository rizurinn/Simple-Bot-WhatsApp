const axios =require('axios')

const handler = async (m, { sock, args, scraper }) => {
  const text = args[0];

  if (!text) {
    return m.reply('Contoh: .spotifydl https://open.spotify.com/track/xxxx atau langsung paste track ID-nya');
  }


  const result = await scraper.spotiDown(text);

  if (!result.status) {
    return m.reply(result.result.error);
  }

  const { title, artist, album, duration, image, download, trackId } = result.result;
  const caption =
    `\`S P O T I F Y - A U D I O\`\n\n` +
    `🎵 *Title:* ${title}\n` +
    `🧑‍🎤 *Artist:* ${artist}\n` +
    `💿 *Album:* ${album}\n` +
    `⏱️ *Duration:* ${duration}`;

  try {
    const audioRes = await axios.get(download, { responseType: 'arraybuffer' });

    await sock.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Spotify 🧸',
          thumbnailUrl: image,
          sourceUrl: `https://open.spotify.com/track/${trackId}`,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    await sock.sendMessage(m.chat, {
      audio: Buffer.from(audioRes.data),
      mimetype: 'audio/mp4',
      fileName: `${artist} - ${title}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply('Gagal ngirim audio. Coba lagi nanti.');
  }
};

handler.command = ['spotifydl'];
handler.tags = ['download'];

module.exports = handler;