let handler = async (m, { sock }) => {

  await sock.sendMessage(m.chat, {
    image: { url: 'https://api.siputzx.my.id/api/r/blue-archive' }
  }, { quoted: m });
};

handler.command = ['bluearchive', 'ba'];
handler.tags = ['random'];

module.exports = handler;