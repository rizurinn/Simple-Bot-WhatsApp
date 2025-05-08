const fetch = require ('node-fetch');

const handler = async (m, { sock, args, prefix, command, Func }) => {
    let text;
    if (args.length >= 1) {
      text = args.join(" ");
    } else if (m.quoted && m.quoted.text) {
      text = m.quoted.text;
    } else {
    return m.reply(`Gunakan: *${prefix + command} <teks>*`);
    }

    try {
        const result = await Func.fetchJson(`https://api.nekorinn.my.id/ai/aimath?text=${encodeURIComponent(text)}`);
        if (!result) return m.reply('Tidak ada respon!');
        
        const jawaban = Func.jsonMathBeautifull(result)
        await m.reply(jawaban);
    } catch (err) {
        console.error(err);
        return m.reply('Gagal memproses pertanyaan!');
    }
};

handler.tags = ['ai'];
handler.command = ['math'];

module.exports = handler;