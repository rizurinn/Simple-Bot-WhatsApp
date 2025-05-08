let rin = async (m, {
    sock,
    text,
    Uploader,
    Func
}) => {
    let quoted = m.quoted ? m.quoted : m;
    if (!/image|video|audio|mpeg|jpeg|mp4|m4a|webp/.test(quoted.msg.mimetype)) m.reply('⚠️ Maaf Tapi Anda Kirim Media/Reply Pesan')
    const {
        key
    } = await sock.sendMessage(m.chat, {
        text: '⌛Media Akan... _Di Jadikan Link_ Please Wait...'
    }, {
        quoted: m
    });

    try {
        if (/image|video|audio|mpeg|jpeg|mp4|m4a|webp/.test(quoted.msg.mimetype)) {
            const catbox = await Uploader.catbox(await quoted.download());
            const {
                result
            } = await require('cloudku-uploader')(await quoted.download());

            const filename = catbox.split('/')[3];
            const type = quoted.msg.mimetype.split('/')[0];
            const size = await Func.getSizeMedia(catbox);
            let caption = `📁 Uploader File
\`[ Cloud Images ]\`
> • *Filename:* ${result.filename || ''}
> • *Type:* ${result.type || ''}
> • *Size:* ${result.size || ''}
> • *Url:* ${result.url || ''}

\`[ CatBox ]\`
> • *Filename:* ${filename || ''}
> • *Type:* ${type || ''}
> • *Size:* ${size || ''}
> • *Url:* ${catbox || ''}`;

            await sock.sendMessage(m.chat, {
                text: caption,
                edit: key
            }, {
                quoted: m
            });
        } else {
            await sock.sendMessage(m.chat, {
                text: '⚠️ Maaf Tapi Anda Kirim Media/Reply Pesan',
                edit: key
            }, {
                quoted: m
            });
        };
    } catch (e) {
        console.erroe('Error: ' + e);
        await sock.sendMessage(m.chat, {
            text: '❌Maaf Mungkin Web Nya Down Atau Ga Kebanyakan Request',
            edit: key
        }, {
            quoted: m
        });
    };
};


rin.tags = ["tool"];
rin.command = ["tourl"];

module.exports = rin;