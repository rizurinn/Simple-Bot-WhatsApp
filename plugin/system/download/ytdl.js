const axios = require('axios');

let handler = async (m, {
    sock,
    text,
    command,
    Func
}) => {
    switch (command) {
        case 'ytmp4':
        case 'ytv': {
            if (!text.includes('youtu')) return await m.reply('⚠️ Masukan Link YouTube!')
            await m.reply('⏳ Sedang memproses video...')
            
            try {
                const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^\?&]+)(?:\?is=[^&]*)?(?:\?si=[^&]*)?(?:&.*)?/;
                const videoId = text.match(regex);
                if (!videoId) return await m.reply('⚠️ URL YouTube tidak valid!')
                
                const result = await require('yt-search')({
                    videoId: videoId[1],
                    hl: 'id',
                    gl: 'ID'
                });
                if (!result) return await m.reply('⚠️ Maaf Link Video Tidak Dapat Di Download')

                let caption = `📁 Download YouTube
> • *Title:* ${result.title || ''}
> • *Id:* ${result.videoId || ''}
> • *Ago:* ${result.ago || ''}
> • *Author:* ${result.author.name || ''}
> • *Url:* ${result.url || ''}`;
            
                sock.sendMessage(m.chat, {
                    text: caption,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 99999,
                        externalAdReply: {
                            title: result.title,
                            body: result.timestamp + ' / ' + result.author.name + ' / ' + result.type,
                            mediaType: 1,
                            thumbnailUrl: result.thumbnail,
                            renderLargerThumbnail: true,
                            sourceUrl: result.url
                        }
                    }
                }, {
                    quoted: m
                });
                
                const apiUrl = `https://ytdlpyton.nvlgroup.my.id/download/?url=${text}&resolution=720&mode=url`;
                const { data } = await axios.get(apiUrl);
                
                if (!data || !data.download_url) {
                    return await m.reply('⚠️ Gagal mendapatkan URL download!');
                }
                
                const buff = await axios.get(data.download_url, {
                    responseType: 'arraybuffer'
                });
                
                const sizeBytes = buff.data.length;
                if (sizeBytes > 100 * 1024 * 1024) {
                    await sock.sendMessage(m.chat, {
                        document: Buffer.from(buff.data),
                        mimetype: "video/mp4",
                        fileName: `${data.title || result.title}.mp4`,
                    }, {
                        quoted: m
                    });
                } else {
                    sock.sendMessage(m.chat, {
                        video: Buffer.from(buff.data),
                        caption: 'Title: ' + (data.title || result.title),
                        mimetype: 'video/mp4'
                    }, {
                        quoted: m
                    });
                }
            } catch (e) {
                console.error(e);
                await m.reply('⚠️ Terjadi kesalahan saat memproses video!');
            }
        }
        break;
        
        case 'ytmp3':
        case 'yta': {
            if (!text.includes('youtu')) return await m.reply('⚠️ Masukan Link YouTube!')
            await m.reply('⏳ Sedang memproses audio...')
            
            try {
                const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^\?&]+)(?:\?is=[^&]*)?(?:\?si=[^&]*)?(?:&.*)?/;
                const videoId = text.match(regex);
                if (!videoId) return await m.reply('⚠️ URL YouTube tidak valid!')
                
                const result = await require('yt-search')({
                    videoId: videoId[1],
                    hl: 'id',
                    gl: 'ID'
                });
                if (!result) return await m.reply('⚠️ Maaf Link Audio Tidak Dapat Di Download')

                let caption = `📁 Download YouTube
> • *Title:* ${result.title || ''}
> • *Id:* ${result.videoId || ''}
> • *Ago:* ${result.ago || ''}
> • *Author:* ${result.author.name || ''}
> • *Url:* ${result.url || ''}`;
            
                sock.sendMessage(m.chat, {
                    text: caption,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 99999,
                        externalAdReply: {
                            title: result.title,
                            body: result.timestamp + ' / ' + result.author.name + ' / ' + result.type,
                            mediaType: 1,
                            thumbnailUrl: result.thumbnail,
                            renderLargerThumbnail: true,
                            sourceUrl: result.url
                        }
                    }
                }, {
                    quoted: m
                });
                
                // Get audio using new API
                const apiUrl = `https://ytdlpyton.nvlgroup.my.id/download/audio/?url=${text}&mode=url`;
                const { data } = await axios.get(apiUrl);
                
                if (!data || !data.download_url) {
                    return await m.reply('⚠️ Gagal mendapatkan URL download!');
                }
                
                const buff = await axios.get(data.download_url, {
                    responseType: 'arraybuffer'
                });
                
                const sizeBytes = buff.data.length;
                const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
                
                if (sizeBytes > 100 * 1024 * 1024) {
                    await sock.sendMessage(m.chat, {
                        document: Buffer.from(buff.data),
                        mimetype: "audio/mpeg",
                        fileName: `${data.title || result.title}.mp3`,
                    }, {
                        quoted: m
                    });
                } else {
                    await sock.sendMessage(m.chat, {
                        audio: Buffer.from(buff.data),
                        mimetype: 'audio/mpeg',
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 99999,
                            externalAdReply: {
                                title: data.title || result.title,
                                body: result.timestamp + ' / ' + sizeMB + ' / mp3',
                                mediaType: 1,
                                thumbnailUrl: result.thumbnail,
                                renderLargerThumbnail: false,
                                sourceUrl: result.url
                            }
                        }
                    }, {
                        quoted: m
                    });
                }
            } catch (e) {
                console.error(e);
                await m.reply('⚠️ Terjadi kesalahan saat memproses audio!');
            }
        }
        break;
    }
};

handler.tags = ["download"];
handler.command = ["ytmp3", "ytmp4", "yta", "ytv"];

module.exports = handler;