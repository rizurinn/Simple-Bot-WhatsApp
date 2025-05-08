const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');
const pluginController = require('../handler');

const jam = moment.tz('Asia/Jakarta').locale('id').format('HH:mm:ss');
const ucapanWaktu = jam < '05:00:00' ? 'Selamat Pagi' : jam < '11:00:00' ? 'Selamat Pagi' : jam < '15:00:00' ? 'Selamat Siang' : jam < '18:00:00' ? 'Selamat Sore' : jam < '19:00:00' ? 'Selamat Sore' : jam < '23:59:00' ? 'Selamat Malam' : 'Selamat Malam';

let menu = async (m, pluginContext) => {
    try {
        const { sock, prefix, Func, scraper } = pluginContext;
        
        const context = {
            sender: m.sender,
            isGroup: m.isGroup,
            isAdmins: m.isAdmin,
            isBotAdmins: m.isBotAdmin,
            isCreator: pluginContext.isCreator
        };
        
        let quotes
        try {
        const siput = await Func.fetchJson('https://api.siputzx.my.id/api/r/quotesanime')
        quotes = siput.data[0]
        } catch (e) {
        const fastrest = await Func.fetchJson('https://fastrestapis.fasturl.cloud/anime/animequote')
        quotes = fastrest.result[0]
        }
        
        let prompt = `${ucapanWaktu} ${m.pushName} San bagaimana kabarmu? Semoga harimu menyenangkan`
        const toJp = await scraper.translate(prompt, "ja")
        const data = await axios.get(`https://ytdlpyton.nvlgroup.my.id/tts/japan?text=${encodeURIComponent(toJp)}&index=33`)
        
        const commandsByCategory = pluginController.getCommands(context);
        
        const caseCommands = await extractCaseCommands();

        for (const category in caseCommands) {
            const normalizedCategory = category.endsWith(" Menu") ? 
                category : `${category} Menu`;
            
            let matchingCategory = normalizedCategory;
            for (const existingCategory in commandsByCategory) {
                if (existingCategory.toLowerCase() === normalizedCategory.toLowerCase() || 
                    existingCategory.toLowerCase().replace(" menu", "") === normalizedCategory.toLowerCase().replace(" menu", "")) {
                    matchingCategory = existingCategory;
                    break;
                }
            }
            
            if (!commandsByCategory[matchingCategory]) {
                commandsByCategory[matchingCategory] = [];
            }
            
            caseCommands[category].forEach(cmdName => {
                if (!commandsByCategory[matchingCategory].some(cmd => cmd.name === cmdName)) {
                    commandsByCategory[matchingCategory].push({
                        name: cmdName,
                        menuHide: false
                    });
                }
            });
        }
        
        let totalFitur = 0;
        const formattedCategories = Object.keys(commandsByCategory)
            .map(category => {
                const commands = commandsByCategory[category]
                    .filter(cmd => !cmd.menuHide);
                
                if (commands.length === 0) return null;
                
                const formattedCommands = commands.map(cmd => {
                    totalFitur++;
                    let commandText = `> ${prefix + cmd.name}`;
                    
                    if (cmd.aliases && cmd.aliases.length > 0) {
                        totalFitur++;
                        commandText += ` \n> ${cmd.aliases.map(alias => prefix + alias).join('\n> ')}`;
                    }
                    
                    return commandText;
                }).join('\n');
                
                return `◎ *${category.toUpperCase()}*\n${formattedCommands}`;
            })
            .filter(Boolean)
            .join('\n\n');
        
        const caption = `Halo ${m.pushName || 'Kak'}!
${quotes.quotes || quotes.quote} ~${quotes.karakter || quotes.character}


「 *COMMANDS LIST* 」

${formattedCategories}


_Fitur tersedia: ${totalFitur}_`;

        await sock.sendMessage(m.chat, {
            text: caption
        }, {
            quoted: m
        });

    const response = await axios.get(data.data.audio_url, {
            responseType: 'arraybuffer'
        });
    await sock.sendMessage(m.chat, { 
      audio: Buffer.from(response.data),
      mimetype: "audio/mp4",
      ptt: true
    }, { quoted: m });

    } catch (error) {
        console.error("Error in menu command:", error);
        await m.reply("Terjadi kesalahan saat menampilkan menu.");
    }
};


async function extractCaseCommands() {
    try {
        const caseFilePath = path.join(__dirname, '../..', 'case.js');
        const caseContent = fs.readFileSync(caseFilePath, 'utf8');
        
        const categories = {};
        
        const categoryPattern = /\/\/\s*(\w+(?:\s+\w+)*)\s*Menu/g;
        const casePattern = /case\s+'([^']+)':|case\s+"([^"]+)":/g;
        
        const lines = caseContent.split('\n');
        let currentCategory = "Uncategorized";
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            const categoryMatch = /\/\/\s*(\w+(?:\s+\w+)*)\s*Menu/.exec(line);
            if (categoryMatch) {
                currentCategory = categoryMatch[1] + " Menu";
                if (!categories[currentCategory]) {
                    categories[currentCategory] = [];
                }
                continue;
            }
            
            let caseMatch;
            const caseRegex = /case\s+'([^']+)':|case\s+"([^"]+)":/g;
            
            while ((caseMatch = caseRegex.exec(line)) !== null) {
                const commandName = caseMatch[1] || caseMatch[2];
                
                if (!categories[currentCategory]) {
                    categories[currentCategory] = [];
                }
                
                if (!categories[currentCategory].includes(commandName)) {
                    categories[currentCategory].push(commandName);
                }
            }
        }
        
        return categories;
    } catch (error) {
        console.error("Error extracting case commands:", error);
        return {};
    }
}

menu.command = ['menu', 'help'];
menu.tags = ['main'];
menu.description = 'Menampilkan daftar semua perintah yang tersedia';
menu.menuHide = true;

module.exports = menu;