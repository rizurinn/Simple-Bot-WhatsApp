const {
    fetch
} = require("undici");
const cheerio = require("cheerio");
const {
    lookup
} = require("mime-types");

let handler = async (m, { sock, text }) => {
    if (!/www.mediafire.com/.test(text)) m.reply('⚠️ Mana Link Mediafire Nya !')
   const {
        key
    } = await sock.sendMessage(m.chat, {
        text: `⏳Bentar Ya..... Lagi Di Proses`,
    }, {
        quoted: m
    });
    try {
        await MediaFire(text).then(async (a) => {
            let capt = `✮ Downloader MediaFire\n`;
            capt += `📁Filename: ${a.filename || ''}\n`;
            capt += `💾Size: ${a.size || ''}\n`;
            capt += `🧩Mimetype: ${a.mimetype || ''}\n`;
            capt += `🔗Link: ${a.alternativeUrl || ''}`;
            const reply = await sock.sendMessage(m.chat, {
                text: `${capt}\n> File Akan Di Kirim Tunggu Aja Proses Nya Selesai`,
                edit: key
            }, {
                quoted: m
            });
            await sock.sendMessage(m.chat, {
                document: {
                    url: a.link
                },
                mimetype: a.mimetype,
                fileName: a.filename,
                caption: capt
            }, {
                quoted: reply
            })
        });
    } catch (e) {
        await sock.sendMessage(m.chat, {
            text: `❌ Maaf Fitur, Nya Error Kebanyakan Request Mungkin`,
            edit: key
        }, {
            quoted: m
        });
        console.log('msg ' + e);
    }
};

handler.tags = ['download'];
handler.command = ['mediafire', 'mfdl'];

module.exports = handler;

async function MediaFire(url, retries = 5, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await fetch(allOriginsUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.178 Safari/537.36"
                }
            });

            if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

            const data = await response.text();
            const $ = cheerio.load(data);

            const filename = $(".dl-btn-label").attr("title");
            const ext = filename.split(".").pop();
            const mimetype = lookup(ext.toLowerCase()) || "application/" + ext.toLowerCase();
            const size = $(".input.popsok").text().trim().match(/\(([^)]+)\)/)[1];
            const downloadUrl = ($("#downloadButton").attr("href") || "").trim();
            const alternativeUrl = ($("#download_link > a.retry").attr("href") || "").trim();

            return {
                filename,
                size,
                mimetype,
                link: downloadUrl || alternativeUrl,
                alternativeUrl: alternativeUrl,
            };
        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error.message}`);

            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw new Error("Failed to fetch data after multiple attempts");
            }
        }
    }
}