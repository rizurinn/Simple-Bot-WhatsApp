let handler = async (m, { sock, Func }) => {

  const res = await Func.fetchJson('https://api.ureshii.my.id/api/internet/animeamv?source=1')
  try {
  await sock.sendFileUrl(m.chat, res.source, ``, m)
} catch (e) {
  console.log(e)
  m.reply('Server tidak menanggapi, coba lagi')
}
};

handler.command = ['amv'];
handler.tags = ['random'];

module.exports = handler;