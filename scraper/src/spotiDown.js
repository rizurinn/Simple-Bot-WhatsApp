/**
 *@Scraper: Daffa,
 *@Recode-Ulang: Dxyz,
 *@Note: No Hapus Wm
**/

const axios = require('axios');

const api = {
    base: 'https://parsevideoapi.videosolo.com',
    endpoints: {
        info: '/spotify-api/'
    }
};

const headers = {
    'authority': 'parsevideoapi.videosolo.com',
    'user-agent': 'Postify/1.0.0',
    'referer': 'https://spotidown.online/',
    'origin': 'https://spotidown.online'
};

async function spotiDown(url) {
    try {
        const regex = /^https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)(?:\?.*)?$/
        if (!url.match(regex)) throw '⚠️ Maaf Link Spotify Nya Mana !'
        const trackId = url.match(regex)[1];
        const response = await axios.post(`${api.base}${api.endpoints.info}`, {
            format: 'web',
            url: 'https://open.spotify.com/track/' + trackId
        }, {
            headers: headers
        });
        if (response.data.status === "-4") {
            return {
                status: false,
                code: 400,
                result: {
                    error: "Linknya kagak valid bree, cuman bisa download track doang euy 😂"
                }
            };
        }

        const {
            metadata
        } = response.data.data;
        if (!metadata || Object.keys(metadata).length === 0) {
            return {
                status: false,
                code: 404,
                result: {
                    error: "Metadata tracknya kosong bree, ganti link yang lain aja yak.."
                }
            };
        }

        return {
            status: true,
            code: 200,
            result: {
                title: metadata.name,
                artist: metadata.artist,
                album: metadata.album,
                duration: metadata.duration,
                image: metadata.image,
                download: metadata.download,
                trackId: trackId
            }
        };
    } catch (error) {
        return {
            status: false,
            code: error.response?.status || 500,
            result: {
                error: "Kagak bisa ambil data metadatanya bree 🙈"
            }
        };
    }
};

module.exports = spotiDown;