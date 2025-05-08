/**
 * Plugin Scraper Manager
 * Plugin untuk mengelola scraper - lihat, eksekusi, reload, dll.
 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk');

async function scraperManager(m, bill) {
  const { args, command, prefix, scraper } = bill;

  // Periksa apakah scraper tersedia di bill
  if (!scraper) {
    return await m.reply(`❌ Scraper tidak tersedia. Pastikan instance scraper telah diinisialisasi dengan benar.`);
  }

  if (args.length < 1) {
    return await m.reply(`
🔎 *Scraper Manager*

Perintah yang tersedia:
${prefix}${command} list - Melihat daftar scraper yang tersedia
${prefix}${command} get [nama_scraper] - Mengambil kode scraper
${prefix}${command} exec [nama_scraper] [kode] - Mengeksekusi scraper dengan kode yang diberikan
${prefix}${command} reload - Me-reload semua scraper
${prefix}${command} info [nama_scraper] - Melihat informasi tentang scraper
    `);
  }

  const action = args[0].toLowerCase();
  
  switch (action) {
    case 'list':
      return await listScrapers(m, bill);
    
    case 'get':
      if (args.length < 2) {
        return await m.reply(`Gunakan: ${prefix}${command} get [nama_scraper]`);
      }
      return await getScraper(args[1], m, bill);
    
    case 'exec':
      if (args.length < 2) {
        return await m.reply(`Gunakan: ${prefix}${command} exec [nama_scraper] [kode]`);
      }
      // Perbaikan: Parsing yang lebih fleksibel untuk argumen
      return await execScraper(args[1], args.slice(2).join(' '), m, bill);
    
    case 'reload':
      return await reloadScrapers(m, bill);
    
    case 'info':
      if (args.length < 2) {
        return await m.reply(`Gunakan: ${prefix}${command} info [nama_scraper]`);
      }
      return await getScraperInfo(args[1], m, bill);
    
    default:
      return await m.reply(`Aksi tidak dikenal: ${action}`);
  }
}

/**
 * List all available scrapers
 */
async function listScrapers(m, bill) {
  const { scraper } = bill;
  
  try {
    const scrapersList = scraper.list();
    const scrapersCount = Object.keys(scrapersList).length;
    
    if (scrapersCount === 0) {
      return await m.reply(`❌ Tidak ada scraper yang tersedia.`);
    }
    
    let message = `📋 *Daftar Scraper*\n\n`;
    message += `╭──────────── •お\n`;
    
    for (const [name, scraperObj] of Object.entries(scrapersList)) {
      // Ambil deskripsi jika ada
      const description = scraperObj.description || scraperObj.desc || 'Tidak ada deskripsi';
      message += `┃▢ ${name} - ${description}\n`;
      
      // Tampilkan method yang tersedia jika ada
      const methods = Object.keys(scraperObj).filter(key => typeof scraperObj[key] === 'function' && !key.startsWith('_'));
      if (methods.length > 0) {
        message += `┃   └ Methods: ${methods.join(', ')}\n`;
      }
    }
    
    message += `╰──────────── •\n\n`;
    message += `Total: ${scrapersCount} scraper tersedia\n`;
    message += `Gunakan .${bill.command} exec [nama_scraper] [kode] untuk menjalankan scraper`;
    
    await m.reply(message);
  } catch (error) {
    await m.reply(`❌ Error saat mengambil daftar scraper: ${error.message}`);
  }
}

/**
 * Get scraper source code
 */
async function getScraper(scraperName, m, bill) {
  const { scraper } = bill;
  
  try {
    if (!scraper[scraperName]) {
      return await m.reply(`❌ Scraper '${scraperName}' tidak ditemukan`);
    }
    
    // Coba temukan path file dari scraper
    const scraperList = scraper.list();
    const scraperObj = scraperList[scraperName];
    
    if (!scraperObj.__filename && !scraperObj._filename) {
      return await m.reply(`❌ Tidak dapat menemukan file source code untuk scraper '${scraperName}'`);
    }
    
    const scraperPath = scraperObj.__filename || scraperObj._filename;
    const scraperCode = fs.readFileSync(scraperPath, 'utf8');
    
    await m.reply(`${scraperCode}`);
  } catch (error) {
    await m.reply(`❌ Error saat mengambil source code scraper: ${error.message}`);
  }
}

/**
 * Execute scraper with provided code - Versi yang lebih canggih
 * Memungkinkan eksekusi scraper dengan berbagai pola penggunaan
 */
async function execScraper(scraperName, code, m, bill) {
  const { scraper } = bill;
  
  try {
    if (!scraper[scraperName]) {
      const availableScrapers = Object.keys(scraper.list()).join(', ');
      return await m.reply(`❌ Scraper '${scraperName}' tidak ditemukan.\n\nScraper yang tersedia: ${availableScrapers}`);
    }
    
    console.log(chalk.yellow(`[ScraperManager] Executing code with scraper: ${scraperName}`));
    
    // Ambil referensi ke scraper
    const scraperInstance = scraper[scraperName];
    
    // Deteksi pola penggunaan
    let execCode = code;
    
    // Jika tidak ada "return", coba parse sebagai pemanggilan fungsi
    if (!code.includes('return')) {
      // Pola 1: scraper.method(params)
      // Contoh: scraper.search('query')
      const methodCallMatch = code.match(/scraper\.([a-zA-Z0-9_]+)(?:\((.*)\))?/);
      
      // Pola 2: method(params) tanpa awalan scraper
      // Contoh: search('query')
      const directMethodCallMatch = code.match(/^([a-zA-Z0-9_]+)(?:\((.*)\))?$/);
      
      if (methodCallMatch) {
        // Format: scraper.method(params)
        const methodName = methodCallMatch[1];
        const params = methodCallMatch[2] || '';
        execCode = `return await scraper.${methodName}(${params})`;
      } else if (directMethodCallMatch) {
        // Format: method(params) - tambahkan scraper.
        const methodName = directMethodCallMatch[1];
        const params = directMethodCallMatch[2] || '';
        
        // Cek apakah method tersedia di scraper
        if (typeof scraperInstance[methodName] === 'function') {
          execCode = `return await scraper.${methodName}(${params})`;
        } else {
          // Jika tidak ada method dengan nama tersebut, coba panggil scraper langsung
          execCode = `return await scraper(${code})`;
        }
      } else {
        // Jika tidak cocok dengan pola apapun, anggap sebagai parameter langsung
        execCode = `return await scraper(${code})`;
      }
    }
    
    console.log(chalk.blue(`[ScraperManager] Executing: ${execCode}`));
    
    // Siapkan context untuk evaluasi
    const evalContext = {
      scraper: scraperInstance,
      msg: m,
      bill
    };
    
    // Buat fungsi evaluasi yang dapat mengakses context
    const evaluator = new Function('context', `
      const { scraper, msg, bill } = context;
      return (async () => {
        try {
          ${execCode}
        } catch (error) {
          console.error("[ScraperManager] Execution Error:", error);
          throw error;
        }
      })();
    `);
    
    // Eksekusi dengan timeout 60 detik
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Eksekusi melebihi batas waktu 60 detik')), 60000);
    });
    
    // Jalankan evaluator dengan menggunakan Promise.race
    const result = await Promise.race([
      evaluator(evalContext),
      timeoutPromise
    ]);
    
    // Format hasil untuk dikirim kembali
    let formattedResult;
    
    // Deteksi tipe hasil dan format dengan tepat
    if (result === undefined || result === null) {
      formattedResult = 'Eksekusi berhasil (tidak ada hasil yang dikembalikan)';
    } else if (typeof result === 'object') {
      try {
        // Coba format sebagai JSON yang rapi
        formattedResult = JSON.stringify(result, null, 2);
        
        // Jika hasilnya terlalu panjang, potong dan beri tahu user
        if (formattedResult.length > 3500) {
          const truncatedResult = formattedResult.substring(0, 3500);
          formattedResult = truncatedResult + '...\n\n(Hasil terlalu panjang, ditampilkan hanya sebagian)';
        }
      } catch (e) {
        // Fallback ke util.inspect jika JSON.stringify gagal
        formattedResult = util.inspect(result, { depth: 3, colors: false });
      }
    } else {
      formattedResult = result.toString();
    }
    
    // Kirim hasil ke pengguna
    await m.reply(`✅ *Scraper ${scraperName} dieksekusi*\n\n*Kode:*\n\`\`\`${execCode}\`\`\`\n\n*Hasil:*\n\`\`\`json\n${formattedResult}\n\`\`\``);
  } catch (error) {
    console.error(chalk.red('[ScraperManager] Error:'), error);
    await m.reply(`❌ *Error saat mengeksekusi scraper ${scraperName}*\n\n*Error:*\n\`\`\`${error.message}\`\`\``);
  }
}

/**
 * Reload all scrapers
 */
async function reloadScrapers(m, bill) {
  const { scraper } = bill;
  
  try {
    // Panggil method load untuk me-reload semua scraper
    await scraper.load();
    
    const scrapersList = scraper.list();
    const scrapersCount = Object.keys(scrapersList).length;
    
    await m.reply(`✅ Berhasil me-reload semua scraper.\nTotal: ${scrapersCount} scraper tersedia.`);
  } catch (error) {
    await m.reply(`❌ Error saat me-reload scraper: ${error.message}`);
  }
}

/**
 * Get detailed information about a specific scraper
 */
async function getScraperInfo(scraperName, m, bill) {
  const { scraper } = bill;
  
  try {
    if (!scraper[scraperName]) {
      return await m.reply(`❌ Scraper '${scraperName}' tidak ditemukan`);
    }
    
    const scraperObj = scraper[scraperName];
    
    // Ambil informasi tentang scraper
    const description = scraperObj.description || scraperObj.desc || 'Tidak ada deskripsi';
    const methods = Object.keys(scraperObj)
      .filter(key => typeof scraperObj[key] === 'function' && !key.startsWith('_'));
    
    // Tentukan tipe scraper
    let scraperType = 'Fungsi';
    let methodsInfo = '';
    
    if (typeof scraperObj === 'function') {
      if (methods.length > 0) {
        scraperType = 'Fungsi dengan method';
        methodsInfo = `\n• Methods: ${methods.join(', ')}`;
      }
    } else {
      scraperType = 'Object';
      methodsInfo = methods.length > 0 ? `\n• Methods: ${methods.join(', ')}` : '';
    }
    
    // Ambil informasi file jika tersedia
    const filePath = scraperObj.__filename || scraperObj._filename;
    const fileInfo = filePath ? {
      path: filePath,
      size: fs.statSync(filePath).size,
      lastModified: fs.statSync(filePath).mtime
    } : null;
    
    let message = `🔍 *Informasi Scraper: ${scraperName}*\n\n`;
    message += `• Jenis: ${scraperType}${methodsInfo}\n`;
    message += `• Deskripsi: ${description}\n`;
    
    if (fileInfo) {
      message += `• File: ${path.basename(fileInfo.path)}\n`;
      message += `• Ukuran: ${(fileInfo.size / 1024).toFixed(2)} KB\n`;
      message += `• Terakhir diubah: ${fileInfo.lastModified}\n`;
    }
    
    // Tambahkan contoh penggunaan berdasarkan tipe scraper
    message += `\n*Contoh Penggunaan:*\n`;
    
    if (methods.length > 0) {
      message += `.scraper exec ${scraperName} scraper.${methods[0]}('contoh')\n`;
    } else {
      message += `.scraper exec ${scraperName} scraper('contoh')\n`;
    }
    
    await m.reply(message);
  } catch (error) {
    await m.reply(`❌ Error saat mengambil informasi scraper: ${error.message}`);
  }
}

/**
 * Helper function: Analisis struktur scraper
 * Berguna untuk memeriksa apakah scraper adalah fungsi yang dapat dipanggil langsung
 * atau objek dengan method yang perlu dipanggil secara eksplisit
 */
function analyzeScraperStructure(scraperObj) {
  const result = {
    type: typeof scraperObj === 'function' ? 'function' : 'object',
    hasDirectCall: typeof scraperObj === 'function',
    methods: []
  };
  
  // Daftar method yang tersedia
  for (const key in scraperObj) {
    if (typeof scraperObj[key] === 'function' && !key.startsWith('_')) {
      result.methods.push(key);
    }
  }
  
  return result;
}

scraperManager.command = ["scraper"];
scraperManager.tags = "owner";
scraperManager.description = "Plugin untuk mengelola dan mengeksekusi scraper";
scraperManager.restrict = {
  ownerOnly: true
};

module.exports = scraperManager;