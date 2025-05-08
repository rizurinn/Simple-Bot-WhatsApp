/*
Jangan Hapus Wm Bang 

*Check File/Url  Plugins Esm*

Ya Intinya Berfungsi Buat Cek File/Url Apakah Berbahaya Apa Tidak Ya Contoh nya Malware Atau Phishing Entahlah 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/179
*/

const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const tmpDir = './tmp'

const nordVPN = {
  api: {
    base: {
      file: "https://file-checker.nordvpn.com/v1/",
      url: "https://link-checker.nordvpn.com/v1/"
    },
    endpoints: {
      filehash: "public-filehash-checker/check",
      check: "public-url-checker/check-url"
    }
  },

  headers: {
    'accept': 'application/json',
    'origin': 'https://nordvpn.com',
    'referer': 'https://nordvpn.com/',
    'user-agent': 'Postify/1.0.0'
  },

  fst: {
    0: "Tenang aja bree, fiilenya kagak ada di Database Malware bree 👍🏻",
    1: "Filenya aman bree 😝",
    2: "ANJIRR, FILE LU KENA MALWARE BREE!!! 🤣"
  },

  cst: {
    0: "Done bree",
    1: "Anjirr, Error bree.. Coba lagi nanti yak..",
    2: "Sabar anjirr, lagi diproses ini...",
    3: "Filenya kaga kagak ada euy, upload dulu lah..."
  },

  ust: {
    0: "Linknya masih fresh bree, belum ada info lebih lanjut euy 😎",
    1: "Linknya aman bree 👍🏻",
    2: "ANJIRR, MALWARE BREE!! JANGAN DIBUKA!! 😲",
    3: "SCAM PHISING BREE!! AWAS KENA TIPU LU!! 🤣",
    4: "Linknya kedeteksi SPAM bree, skip aja dah 😝",
    5: "Ada Aplikasi mencurigakan bree, mending jangan dibuka...",
    6: "Websitenya agak sus gitu... 🙃",
    7: "Search engine abal-abal bree, pake google aja kalo itu.. 🌝"
  },

  fn: (ext) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `file_${timestamp}_${random}.${ext}`;
  },

  isValid: (url) => {
    try {
      return /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/[^?#]*)*(\?([^#]*))?(#.*)?$/i.test(url);
    } catch {
      return false;
    }
  },

  genExt: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },

  getSHA256: async (content) => {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(content);
      return {
        success: true,
        code: 200,
        result: {
          hash: hash.digest('hex')
        }
      };
    } catch (error) {
      return {
        success: false,
        code: 400,
        result: {
          error: error.message
        }
      };
    }
  },

  getFileInfo: async (file) => {
    try {
      let content, size, ext, fname, contentType;

      if (nordVPN.isValid(file)) {
        const stats = await axios.head(file);
        size = parseInt(stats.headers['content-length']);
        contentType = stats.headers['content-type'];     
        const response = await axios.get(file, {
          responseType: 'arraybuffer'
        });
        
        content = Buffer.from(response.data);
        const urlParts = file.split('/');
        fname = urlParts[urlParts.length - 1];
        ext = nordVPN.genExt(fname);

      } else {
        if (!fs.existsSync(file)) {
          return {
            success: false,
            code: 400,
            result: {
              error: "Filenya kagak ada bree 😌"
            }
          };
        }

        const stats = fs.statSync(file);
        content = fs.readFileSync(file);
        size = stats.size;
        ext = path.extname(file).substring(1).toLowerCase();
        fname = path.basename(file);
        contentType = `image/${ext}`;
      }

      return {
        success: true,
        code: 200,
        result: {
          content,
          size,
          ext,
          fname,
          contentType
        }
      };

    } catch (error) {
      return {
        success: false,
        code: 400,
        result: {
          error: error.message
        }
      };
    }
  },

  file: async (file) => {
    const x = await nordVPN.getFileInfo(file);
    if (!x.success) return x;

    const fileName = nordVPN.fn(x.result.ext);
    const sha = await nordVPN.getSHA256(x.result.content);
    if (!sha.success) return sha;

    try {
      const data = {
        sha256: sha.result.hash,
        size: x.result.size,
        name: fileName
      };

      const res = await axios.post(`${nordVPN.api.base.file}${nordVPN.api.endpoints.filehash}`, data, {
        headers: {
          ...nordVPN.headers,
          'authority': 'file-checker.nordvpn.com'
        }
      });

      const result = res.data;
      const status = result.status;
      const category = result.categories?.[0];
      const isSuccess = status === 0;
      const isSafe = isSuccess && [0,1].includes(category?.id);

      return {
        success: true,
        code: 200,
        result: {
          status: `${nordVPN.cst[status]} (${status})`,
          category: category ? `${nordVPN.fst[category.id]}` : "", 
          isSafe: isSafe,
          sha256: sha.result.hash,
          fileName: fileName,
          originalName: x.result.fname,
          fileSize: x.result.size,
          fileType: x.result.contentType,
          ext: x.result.ext,
          source: nordVPN.isValid(file) ? 'url' : 'local',
          sourcePath: file
        }
      };

    } catch (error) {
      return {
        success: false,
        code: 400,
        result: {
          error: error.message
        }
      };
    }
  },

  url: async (url) => {
    if (!url) {
      return {
        success: false,
        code: 400,
        result: {
          error: "Linknya mana bree?? Mau ngecek phising link kan? 🙃"
        }
      };
    }

    if (!nordVPN.isValid(url)) {
      return {
        success: false,
        code: 400,
        result: {
          error: "Njirr lah, basic url aja kagak tau lu 🗿"
        }
      };
    }

    try {
      const response = await axios.post(`${nordVPN.api.base.url}${nordVPN.api.endpoints.check}`,
        { url },
        {
          headers: {
            ...nordVPN.headers,
            'authority': 'link-checker.nordvpn.com'
          }
        }
      );

      const result = response.data;
      const status = result.status;
      const cid = result.category;
      
      const isSuccess = status === 0;
      const isSafe = isSuccess && cid === 1;
      const info = nordVPN.ust[cid] || "Link nya masih baru bree, belom ada infonya 🙃";

      return {
        success: true,
        code: 200,
        result: {
          status: `${nordVPN.cst[status]} (${status})`,
          info: info,
          isSafe: isSafe,
          url: url,
          id: cid
        }
      };

    } catch (error) {
      return {
        success: false,
        code: 400,
        result: {
          error: error.message
        }
      };
    }
  }
};

const handler = async (m, { sock, args, prefix, command, Func }) => {
    const subcommand = args[0]?.toLowerCase();
    
    if (command === 'scan') {
        if (!subcommand) return sock.sendMessage(m.chat, { text: `Usage : *${prefix + command} File <file>/<url File*\n\n *${prefix + command} url* <url web>` }, { quoted: m });
        
        if (subcommand === 'file') {
            try {
                let q = m.quoted ? m.quoted : m;
                let mime = (q.msg || q).mimetype || '';
                if (!mime) m.reply('Kirim atau balas file dengan command')

                let media = await q.download();
                if (!media) m.reply('Gagal mengambil file')

                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

                const fileName = `file_${Date.now()}.zip`;
                const tmpFilePath = path.join(tmpDir, fileName);
                fs.writeFileSync(tmpFilePath, media);

                const result = await nordVPN.file(tmpFilePath);
                fs.unlinkSync(tmpFilePath);

                if (!result.success) throw result.result.error;

                const response = `*Original Name :* ${result.result.originalName}
*File Name :* ${fileName}
*File Size :* ${Func.formatSize(result.result.fileSize)}\n
*SHA256 :* ${result.result.sha256}\n
*Status :* ${result.result.status}
*Category :* ${result.result.category}
*Is Safe :* ${result.result.isSafe ? 'Safe' : 'Dangerous'}`;

                return m.reply(response);
            } catch (error) {
                return m.reply(`${error.message || error}`);
            }
        }

        if (subcommand === 'url') {
            try {
                const url = args[1];
                if (!url) m.reply(`*Example :*${prefix + command} url https://googel.com`)

                const result = await nordVPN.url(url);
                if (!result.success) throw result.result.error;

                const response = `*Link :* ${result.result.url}
*Status :* ${result.result.status}
*Info :* ${result.result.info}
*Is Safe :* ${result.result.isSafe ? 'Safe' : 'Dangerous'}`;

                return m.reply(response);
            } catch (error) {
                return m.reply(`${error.message || error}`);
            }
        }

        return m.reply(`Hanya Tersedia ${prefix + command} <file|url>`);
    }
};


handler.tags = ['tool'];
handler.command = ['scan'];

module.exports = handler;