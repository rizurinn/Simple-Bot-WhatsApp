const fetch = require('node-fetch')

async function writecream(logic, question) {
  const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat";
  const query = [
    { role: "system", content: logic },
    { role: "user", content: question }
  ];
  const params = new URLSearchParams({
    query: JSON.stringify(query),
    link: "writecream.com"
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    let raw = data.response_content || data.reply || data.result || data.text || '';
    let cleaned = raw
      .replace(/\\n/g, '\n')
      .replace(/\n{2,}/g, '\n\n')
      .replace(/\*\*(.*?)\*\*/g, '*$1*');

    return cleaned.trim();
  } catch (error) {
    return `Gagal mengambil respons: ${error.message}`;
  }
}

const handler = async (m, { text, sock, prefix, command }) => {
  if (!text) return m.reply(`Masukkan pertanyaan. Contoh:\n${prefix + command} kamu psikolog|aku sering gelisah malam hari, kenapa ya?`);

  const [logic, question] = text.split('|').map(v => v.trim());
  if (!logic || !question) return m.reply(`Format salah. Gunakan:\n${prefix + command} persona|pertanyaan`);

  await sock.sendMessage(m.chat, { react: { text: '🎀', key: m.key } });

  const response = await writecream(logic, question);
  m.reply(response || 'Tidak ada respons.');
};

handler.tags = ['ai'];
handler.command = ['writecream'];

module.exports = handler;