const axios = require('axios')

const handler = async (m, { sock, text, args, prefix, command }) => {
                    if (!args.length) {
                        rinn.sendMessage(m.sender, {
                            text: `Masukan judul/link!\ncontoh:\n\n${prefix + command} 1番輝く星`
                        }, {
                            quoted: m
                        });
                        return;
                    }

                    try {
                        const query = args.join(' ');
                        const spotifyRegex = /^https?:\/\/open\.spotify\.com\/(track|album|playlist)\/[\w\-]+/;

                        if (spotifyRegex.test(query)) {} else {
                            try {
                                console.log('Mencari dengan keyword:', query);
                                const searchRes = await axios.get(`https://vapis.my.id/api/spotifys?q=${encodeURIComponent(query)}`);

                                if (!searchRes.data || !searchRes.data.data || !searchRes.data.data.length) {
                                    throw new Error('Lagu tidak ditemukan');
                                }

                                const tracks = searchRes.data.data.slice(0, 10);

                                let caption = `*Hasil Pencarian Spotify*\n\n`;
                tracks.forEach((track, index) => {
                    caption += `*${index + 1}.* ${track.nama}\n└ Artis: ${track.artis}\n└ Durasi: ${track.durasi}\n└ Url: ${track.link}\n\n`;
                });
                caption += `\n_Download menggunakan command ${prefix}spotifydl_`;

                                const thumbnailUrl = tracks[0].image || "https://i.ibb.co/vxLRS6J/spotify-logo.png";

                                await sock.sendMessage(m.chat, {
                                    text: caption,
                                    contextInfo: {
                                        isForwarded: true,
                                        mentionedJid: [m.sender],
                                        externalAdReply: {
                                            title: 'Spotify',
                                            body: `${tracks[0].nama} - ${tracks[0].artis}`,
                                            thumbnailUrl: thumbnailUrl,
                                            sourceUrl: 'https://open.spotify.com',
                                            mediaType: 1,
                                            renderLargerThumbnail: true
                                        },
                                    }
                                }, {
                                    quoted: m
                                });
                            } catch (error) {
                                console.error('Error pencarian:', error);
                                throw error;
                            }
                        }
                    } catch (e) {
                        console.error("Error pada fitur spotify:", e);
                        await m.reply(`Error: ${e.message}`);
                    }
};

handler.tags = ["search"];
handler.command = ["spotify"];

module.exports = handler;