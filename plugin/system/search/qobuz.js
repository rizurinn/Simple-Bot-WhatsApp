/* 
• Plugins Qobuz Downloader
• Info: Ini result music nya banyak. 
• Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• Source Scrape: https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L
*/


const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')

const API = 'https://eu.qobuz.squid.wtf/api';
const UA = 'Postify/1.0.0';

function getAlbumId(url) {
  const match = url.match(/\/album\/.*?\/([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

function qualities(bit, rate) {
  const q = [
    { id: '5', label: 'MP3 320kbps' },
    { id: '6', label: 'CD Quality (FLAC 16bit)' },
  ];
  if (bit >= 24) q.push({ id: '7', label: 'Hi-Res 24bit/96kHz' });
  if (rate >= 192000) q.push({ id: '27', label: 'Hi-Res+ 192kHz' });
  return q;
}

async function searchTrack(query) {
  const { data } = await axios.get(`${API}/get-music`, {
    params: { q: query, offset: 0 },
    headers: { 'user-agent': UA },
  });
  const track = data?.data?.tracks?.items?.[0];
  if (!track) throw 'Track tidak ditemukan.';
  return track;
}

async function fetchAlbum(id) {
  const { data } = await axios.get(`${API}/get-album`, {
    params: { album_id: id },
    headers: { 'user-agent': UA },
  });
  const album = data?.data;
  if (!album?.tracks?.items?.length) throw 'Album kosong.';
  return album;
}

async function fetchDownload(trackId, quality) {
  const { data } = await axios.get(`${API}/download-music`, {
    params: { track_id: trackId, quality },
    headers: { 'user-agent': UA },
  });
  const url = data?.data?.url;
  if (!url) throw 'Link download tidak tersedia.';
  return url;
}

async function downloadToTemp(url, name = 'track.flac') {
  const temp = path.join(tmpdir(), name);
  const res = await axios({ url, method: 'GET', responseType: 'stream' });
  const writer = fs.createWriteStream(temp);
  await new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  return temp;
}

const handler = async (m, { text, args, sock, prefix, command }) => {
  try {
    const input = (text || args.join(' ')).trim();
    if (!input) return m.reply(`*Penggunaan:* ${prefix + command} <judul/url album> jumlah(default: 6)\n*Contoh:* ${prefix + command} kingslayer 3`)

    let quality = '6';
    if (args[1] && /^[567]|27$/.test(args[1])) quality = args[1];

    let track, album;
    if (input.includes('qobuz.com/album/')) {
      const id = getAlbumId(input);
      if (!id) throw 'ID album tidak valid.';
      album = await fetchAlbum(id);
    } else {
      track = await searchTrack(input);
      album = await fetchAlbum(track.album.id);
    }

    const q = qualities(
      Math.max(...album.tracks.items.map(t => t.maximum_bit_depth || 0)),
      Math.max(...album.tracks.items.map(t => t.maximum_sampling_rate || 0))
    );

    if (!q.find(q => q.id === quality)) {
      return m.reply(`Invalid quality: "${quality}". Available: ${q.map(q => q.id).join(', ')}`)
    }

    await m.reply(`Mengambil lagu dari *${album.title}*...`);

    for (const tr of album.tracks.items) {
      const url = await fetchDownload(tr.id, quality);
      const file = await downloadToTemp(url, `${tr.title}.flac`);

      const caption = `🎵 *${tr.title}*\n👤 *${tr.performer?.name || 'Unknown Artist'}*\n💿 *${album.title}*\n🎧 *${q.find(q => q.id === quality)?.label || 'Unknown Quality'}*`;

      await sock.sendMessage(m.chat, { text: caption }, { quoted: m });

      await sock.sendMessage(m.chat, {
        audio: { url: file },
        mimetype: 'audio/mp4',
        ptt: false,
      }, { quoted: m });
    }

  } catch (e) {
    await m.reply(`${e.message || e}`);
  }
};

handler.tags = ['download'];
handler.command = ['qobuz'];

module.exports = handler;