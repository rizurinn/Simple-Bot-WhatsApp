const axios = require ('axios')

const handler = async (m, { sock, text, prefix, command }) => {
  if (!text) throw `*Example :* ${prefix + command} https://google.com`;
  
  try {
    const deviceType = command.includes('mobile') ? 'mobile' : 'desktop';
    const fullPage = !command.includes('mobile');
    
    const response = await axios.post(
      'https://api.magickimg.com/generate/website-screenshot',
      {
        url: text,
        device: deviceType,
        fullPage: fullPage
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        responseType: 'arraybuffer'
      }
    );

    await sock.sendMessage(m.chat, {
      image: response.data,
    }, { quoted: m });

  } catch (error) {
    throw `${error.message}`;
  }
};

handler.command = ['ssweb'];
handler.tags = ['tool'];

module.exports = handler;