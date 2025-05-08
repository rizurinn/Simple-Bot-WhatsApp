const axios = require('axios');

let yukio = async (m, { sock, text, scraper, Uploader, command }) => {
    switch (command) {
        case 'play': {
            if (!text) return await m.reply('⚠️Masukan Nama Lagu Yg Pengen Anda Cari !')
            const { all } = await require('yt-search')({
                search: text,
                hl: 'id',
                gl: 'ID'
            });
            if (!all && all.length > 0) m.reply('⚠️Maaf Lagu Yang Anda Search Tidak Di Temukan !')
            const result = all[0];
            let caption = `🔍 Search Play
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

            let ytdl;
            let format;
            try {
                const {
                    result: savetube
                } = await scraper.savetube.download(result.url, "mp3");
                format = 'mp3';
                ytdl = savetube.download;
            } catch (e) {
                try {
                    const ddownr = await scraper.ddownr.download(result.url, 'mp3');
                    format = 'mp3';
                    ytdl = ddownr.downloadUrl;
                } catch (e) {}
            }
            const buff = await axios.get(ytdl, {
                responseType: 'arraybuffer'
            });
            const array = Buffer.from(buff.data)
            sock.sendMessage(m.chat, {
                audio: Buffer.from(array),
                mimetype: 'audio/mpeg',
                contextInfo: {
                    isForwarded: true,
                    externalAdReply: {
                        title: result.title,
                        body: result.timestamp + ' / ' + format,
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
        break;
        case 'spotifyplay': {
            let api = 'https://spotifyapi.caliphdev.com'
            if (!text) return await m.reply('⚠️Masukan Nama Lagu Yg Pengen Anda Cari !')
            const {
                data: search
            } = await axios(api + '/api/search/tracks', {
                post: 'GET',
                params: {
                    q: text
                }
            });
            if (!search && !search.length > 0) m.reply('⚠️ Maaf Lagu Yg Anda Search Tidak Di Temukan')
            const {
                data: detail
            } = await axios(api + '/api/info/track', {
                post: 'GET',
                params: {
                    url: search[0].url
                }
            });

            let linkurl;
            try {
                const {
                    result: spdl
                } = await scraper.spotiDown(detail.url)
                linkurl = spdl.download
            } catch (e) {
                try {
                    linkurl = `${api + '/api/download/track?url=' + detail.url}`
                } catch (e) {}
            }
            const caption = `📁 Spotify Downloader
> • *Title:* ${detail.title || ''}
> • *Artist:* ${detail.artist || ''}
> • *Album:* ${detail.album || ''}
> • *Url:* ${detail.url || ''}
> • *Link-Download:* ${linkurl || ''}`;
            m.reply(caption);
            let audio;
            try {
                const {
                    result: spdl
                } = await scraper.spotiDown(detail.url)
                audio = {
                    url: spdl.download
                }
            } catch (e) {
                try {
                    const {
                        data
                    } = await axios(api + '/api/download/track', {
                        post: 'GET',
                        params: {
                            url: detail.url
                        },
                        responseType: 'arraybuffer'
                    });
                    audio = await Buffer.from(data)
                } catch (e) {}
            }

            sock.sendMessage(m.chat, {
                audio,
                mimetype: 'audio/mpeg'
            }, {
                quoted: m
            });
        }
        break;
    };
};

yukio.tags = ["download"];
yukio.command = ["play", "spotifyplay"];

module.exports = yukio;