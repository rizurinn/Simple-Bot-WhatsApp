const handler = async (m, { sock, prefix, command, quoted, text }) => {
  const defaultPP = await sock.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');
  const defaultSignature = '@user077';
  const name = m.pushName || 'User';

  if (!text) return m.reply(`Masukkan teks quote!\nContoh: ${prefix + command} IWAK | @Shiroko | https://example.com/pp.jpg*`);

  let [quoteText, signature, ppUrl] = text.split('|').map(a => a.trim());
  if (!quoteText) return m.reply('Teks quote tidak boleh kosong.');
  if (ppUrl && !/^https?:\/\//.test(ppUrl)) return m.reply('URL foto profil tidak valid.');

  const quoteApi = `https://fastrestapis.fasturl.cloud/maker/quote?text=${encodeURIComponent(quoteText)}&username=${encodeURIComponent(name)}&ppUrl=${encodeURIComponent(ppUrl || defaultPP)}&signature=${encodeURIComponent(signature || defaultSignature)}`;

  try {
    await sock.sendMessage(m.chat, {
      image: { url: quoteApi },
      caption: `Kata kata hari ini dari *${name}*`
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply(e);
  }
};

handler.tags = ['maker'];
handler.command = ['quote']

module.exports = handler;