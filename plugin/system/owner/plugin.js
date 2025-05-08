const fs = require('fs');
const path = require('path');
const pluginController = require('../../handler');

async function pluginManager(m, bill) {
  const { args, command, prefix } = bill;

  if (args.length < 1) {
    return await m.reply(`
🧩 *Plugin Manager*

Perintah yang tersedia:
${prefix}${command} list - Melihat daftar plugin yang tersedia
${prefix}${command} get [nama_plugin] - Mengambil kode plugin
${prefix}${command} add [nama_file] [kategori] - Menambahkan plugin baru (reply ke kode plugin)
${prefix}${command} sf [nama_plugin] - Menyimpan perubahan pada plugin (reply ke kode baru)
${prefix}${command} del [nama_plugin] - Menghapus plugin
${prefix}${command} reload [nama_plugin] - Me-reload plugin tertentu
${prefix}${command} reloadall - Me-reload semua plugin
    `);
  }

  const action = args[0].toLowerCase();
  
  switch (action) {
    case 'list':
      return await listPlugins(m, bill);
    
    case 'get':
      if (args.length < 2) {
        return await m.reply(`Gunakan: ${prefix}${command} get [nama_plugin]`);
      }
      return await getPlugin(args[1], m, bill);
    
    case 'add':
      if (args.length < 3 || !m.quoted) {
        return await m.reply(`Gunakan: ${prefix}${command} add [nama_file] [kategori] (reply ke kode plugin)`);
      }
      return await addPlugin(args[1], args[2], m.quoted.text, m, bill);
    
    case 'sf':
      if (args.length < 2 || !m.quoted) {
        return await m.reply(`Gunakan: ${prefix}${command} save [nama_plugin] (reply ke kode plugin yang baru)`);
      }
      return await savePlugin(args[1], m.quoted.text, m, bill);
    
    case 'del':
      if (args.length < 2) {
        return await m.reply(`Gunakan: ${prefix}${command} delete [nama_plugin]`);
      }
      return await deletePlugin(args[1], m, bill);
      
    case 'reload':
      if (args.length < 2) {
        return await m.reply(`Gunakan: ${prefix}${command} reload [nama_plugin]`);
      }
      return await reloadPlugin(args[1], m, bill);
      
    case 'reloadall':
      return await reloadAllPlugins(m, bill);
    
    default:
      return await m.reply(`Aksi tidak dikenal: ${action}`);
  }
}

/**
 * List all available plugins with additional info
 */
async function listPlugins(m) {
  // Pass the context to getCommands for proper permission filtering
  const commands = pluginController.getCommands(m);
  
  let message = `📋 *Daftar Plugin*\n\n`;
  let totalPlugins = 0;
  
  for (const [category, plugins] of Object.entries(commands)) {
    message += `╭──────────── •`;
    message += `お\n*${category}*\n`;
    
    for (const plugin of plugins) {
      totalPlugins++;
      const restrictInfo = plugin.restrict ? 
        Object.entries(plugin.restrict)
          .filter(([key, value]) => value === true)
          .map(([key]) => key.replace('Only', ''))
          .join(', ') : 
        'semua';
      
      const limitInfo = plugin.limit ? `(${plugin.limit} limit)` : '';
      
      message += `┃▢ ${plugin.name}${limitInfo} - ${restrictInfo}\n`;
      if (plugin.aliases && plugin.aliases.length > 0) {
        message += `┃   └ Alias: ${plugin.aliases.join(', ')}\n`;
      }
    }
    message += `╰──────────── •\n\n`;
  }
  
  // Add before handlers to the list
  const beforeHandlers = pluginController.plugins.filter(plugin => 
    typeof plugin.before === 'function' && (!plugin.command || !plugin.command.length)
  );
  
  if (beforeHandlers.length > 0) {
    message += `╭──────────── •`;
    message += `お\n*Before Handlers*\n`;
    
    for (const handler of beforeHandlers) {
      totalPlugins++;
      const handlerName = path.basename(handler.__filename || 'unknown', '.js');
      message += `┃▢ ${handlerName} (before handler)\n`;
    }
    message += `╰──────────── •\n\n`;
  }
  
  message += `Total: ${totalPlugins} plugin tersedia`;
  
  await m.reply(message);
}

/**
 * Get plugin source code
 */
async function getPlugin(pluginName, m) {
  const plugin = findPlugin(pluginName);
  
  if (!plugin) {
    return await m.reply(`❌ Plugin '${pluginName}' tidak ditemukan`);
  }
  
  try {
    const pluginPath = plugin.__filename;
    const pluginCode = fs.readFileSync(pluginPath, 'utf8');
    
    await m.reply(`${pluginCode}`);
  } catch (error) {
    await m.reply(`❌ Error saat mengambil source code plugin: ${error.message}`);
  }
}

/**
 * Add new plugin with support for before handlers
 */
async function addPlugin(fileName, category, pluginCode, m, bill) {
  const { prefix, command } = bill;
  if (!fileName.endsWith('.js')) {
    fileName += '.js';
  }
  
  try {
    const pluginsBaseDir = path.resolve(__dirname, '../../system');
    if (!fs.existsSync(pluginsBaseDir)) {
      fs.mkdirSync(pluginsBaseDir, { recursive: true });
    }
    
    const categoryDir = path.join(pluginsBaseDir, category.toLowerCase());
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    const pluginName = fileName.replace('.js', '');
    
    const pluginPath = path.join(categoryDir, fileName);
    if (fs.existsSync(pluginPath)) {
      return await m.reply(`❌ Plugin dengan nama file '${fileName}' sudah ada di kategori '${category}'`);
    }
    
    // Check for either command property or before function
    const hasCommand = pluginCode.includes('.command');
    const hasBefore = pluginCode.includes('.before = ') || pluginCode.includes('.before=');
    
    if (!hasCommand && !hasBefore) {
      return await m.reply(`❌ Kode plugin tidak valid. Plugin harus memiliki properti command atau fungsi before.`);
    }
    
    fs.writeFileSync(pluginPath, pluginCode);
    
    try {
      const resolvedPath = require.resolve(pluginPath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
      
      const loadedPlugin = require(pluginPath);
      
      // Validate for either command array or before function
      const isValid = loadedPlugin && typeof loadedPlugin === 'function' && 
                      (Array.isArray(loadedPlugin.command) || typeof loadedPlugin.before === 'function');
      
      if (!isValid) {
        fs.unlinkSync(pluginPath);
        return await m.reply(`❌ Plugin tidak valid. Pastikan format sesuai dan memiliki properti command atau fungsi before.`);
      }
    } catch (loadError) {
      fs.unlinkSync(pluginPath);
      return await m.reply(`❌ Error saat memuat plugin: ${loadError.message}`);
    }
    
    // Reset plugin cache and reload plugins
    await pluginController.reloadPlugins();
    
    const pluginType = hasBefore ? "before handler" : "command plugin";
    await m.reply(`✅ Plugin '${pluginName}' (${pluginType}) berhasil dibuat di \`plugin/system/${category.toLowerCase()}/${fileName}\``);
  } catch (error) {
    await m.reply(`❌ Error saat membuat plugin: ${error.message}`);
  }
}

/**
 * Save plugin with support for before handlers
 */
async function savePlugin(pluginName, newCode, m){
  const plugin = findPlugin(pluginName);
  
  if (!plugin) {
    return await m.reply(`❌ Plugin '${pluginName}' tidak ditemukan`);
  }
  
  try {
    const pluginPath = plugin.__filename;
    
    // Check for either command property or before function
    const hasCommand = newCode.includes('.command');
    const hasBefore = newCode.includes('.before = ') || newCode.includes('.before=');
    
    if (!hasCommand && !hasBefore) {
      return await m.reply(`❌ Kode plugin tidak valid. Plugin harus memiliki properti command atau fungsi before.`);
    }
    
    const backupPath = `${pluginPath}.bak`;
    const existingCode = fs.readFileSync(pluginPath, 'utf8');
    fs.writeFileSync(backupPath, existingCode);
    
    fs.writeFileSync(pluginPath, newCode);
    
    try {
      const resolvedPath = require.resolve(pluginPath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
      
      const loadedPlugin = require(pluginPath);
      
      // Validate for either command array or before function
      const isValid = loadedPlugin && typeof loadedPlugin === 'function' && 
                      (Array.isArray(loadedPlugin.command) || typeof loadedPlugin.before === 'function');
      
      if (!isValid) {
        fs.copyFileSync(backupPath, pluginPath);
        fs.unlinkSync(backupPath);
        return await m.reply(`❌ Plugin baru tidak valid. Plugin asli telah dikembalikan.`);
      }
      
      fs.unlinkSync(backupPath);
    } catch (loadError) {
      fs.copyFileSync(backupPath, pluginPath);
      fs.unlinkSync(backupPath);
      return await m.reply(`❌ Error saat memuat plugin baru: ${loadError.message}. Plugin asli telah dikembalikan.`);
    }
    
    // Use the specific plugin reload function
    await pluginController.reloadPlugins(pluginName);
    
    const pluginType = hasBefore ? "before handler" : "command plugin";
    const relativePath = path.relative(path.resolve(__dirname, '../../..'), pluginPath);
    await m.reply(`✅ Plugin '${pluginName}' (${pluginType}) berhasil disimpan di \`${relativePath}\``);
    
  } catch (error) {
    await m.reply(`❌ Error saat menyimpan plugin: ${error.message}`);
  }
}

/**
 * Delete plugin with improved cleanup
 */
async function deletePlugin(pluginName, m) {
  const plugin = findPlugin(pluginName);
  
  if (!plugin) {
    return await m.reply(`❌ Plugin '${pluginName}' tidak ditemukan`);
  }
  
  try {
    const pluginPath = plugin.__filename;
    const relativePath = path.relative(path.resolve(__dirname, '../../..'), pluginPath);
    
    fs.unlinkSync(pluginPath);
    
    // Clear plugin from cache
    const resolvedPath = require.resolve(pluginPath);
    if (require.cache[resolvedPath]) {
      delete require.cache[resolvedPath];
    }
    
    // Reload all plugins to update the plugin list
    await pluginController.reloadPlugins();
    
    const pluginType = typeof plugin.before === 'function' ? "before handler" : "command plugin";
    await m.reply(`✅ Plugin '${pluginName}' (${pluginType}) berhasil dihapus dari ${relativePath}`);
  } catch (error) {
    await m.reply(`❌ Error saat menghapus plugin: ${error.message}`);
  }
}

/**
 * Reload specific plugin
 */
async function reloadPlugin(pluginName, m) {
  try {
    // Using optimized reloadPlugins method from the controller
    const result = await pluginController.reloadPlugins(pluginName);
    
    if (result) {
      await m.reply(`✅ Plugin '${pluginName}' berhasil di-reload`);
    } else {
      await m.reply(`❌ Plugin '${pluginName}' tidak ditemukan atau gagal di-reload`);
    }
  } catch (error) {
    await m.reply(`❌ Error saat me-reload plugin: ${error.message}`);
  }
}

/**
 * Reload all plugins
 */
async function reloadAllPlugins(m){
  try {
    // Reset pluginsLoaded flag and reload all
    await pluginController.reloadPlugins();
    
    const beforeHandlers = pluginController.plugins.filter(p => typeof p.before === 'function');
    const commandPlugins = pluginController.plugins.filter(p => Array.isArray(p.command));
    
    await m.reply(`✅ Semua plugin berhasil di-reload.\n• Command plugins: ${commandPlugins.length}\n• Before handlers: ${beforeHandlers.length}\n• Total: ${pluginController.plugins.length} plugin`);
  } catch (error) {
    await m.reply(`❌ Error saat me-reload plugin: ${error.message}`);
  }
}

/**
 * Find plugin by name - supports both command plugins and before handlers
 */
function findPlugin(pluginName, bill) {
  const pluginNameLower = pluginName.toLowerCase();
  
  // First check __commandMap for O(1) lookup
  for (const plugin of pluginController.plugins) {
    if (plugin.__commandMap && plugin.__commandMap[pluginNameLower]) {
      return plugin;
    }
  }
  
  // Check for command match
  const commandPlugin = pluginController.plugins.find(plugin => 
    plugin.command && plugin.command.includes(pluginNameLower)
  );
  
  if (commandPlugin) return commandPlugin;
  
  // Check for before handler by filename match
  const beforeHandler = pluginController.plugins.find(plugin => {
    if (!plugin.__filename) return false;
    const basename = path.basename(plugin.__filename, '.js').toLowerCase();
    return basename === pluginNameLower && typeof plugin.before === 'function';
  });
  
  return beforeHandler;
}

pluginManager.command = ["plugin"];
pluginManager.tags = "owner";
pluginManager.description = "Plugin untuk mengelola plugin lainnya (add, delete, save, reload)";
pluginManager.restrict = {
  ownerOnly: true
};

module.exports = pluginManager;
