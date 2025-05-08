const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(apikey.gemini);

const systemPrompt = "Kamu adalah ai yang serba tahu lalu memiliki sifat yang imut, asik, dan peduli dengan orang lain. Lalu pastikan semua informasi benar agar orang lain tidak mendapatkan informasi yang salah";

const chatSessions = new Map();

const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: systemPrompt
});

async function saveTempFile(buffer, mimeType, fileType = 'audio') {
  const tempDir = path.join(__dirname, '../../../tmp/sampah');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  let extension = 'bin';
  
  if (fileType === 'audio') {
    switch(mimeType) {
      case 'audio/wav': extension = 'wav'; break;
      case 'audio/mp3': extension = 'mp3'; break;
      case 'audio/aiff': extension = 'aiff'; break;
      case 'audio/aac': extension = 'aac'; break;
      case 'audio/ogg': extension = 'ogg'; break;
      case 'audio/flac': extension = 'flac'; break;
      default: extension = 'mp3';
    }
  } else if (fileType === 'document') {
    switch(mimeType) {
      case 'application/pdf': extension = 'pdf'; break;
      case 'application/msword': extension = 'doc'; break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extension = 'docx'; break;
      case 'application/vnd.ms-excel': extension = 'xls'; break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': extension = 'xlsx'; break;
      case 'application/vnd.ms-powerpoint': extension = 'ppt'; break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': extension = 'pptx'; break;
      case 'text/plain': extension = 'txt'; break;
      case 'text/csv': extension = 'csv'; break;
      case 'application/rtf': extension = 'rtf'; break;
      default: extension = 'pdf';
    }
  }
  
  const filename = `${fileType}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${extension}`;
  const filepath = path.join(tempDir, filename);
  
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  
  await pipeline(readable, fs.createWriteStream(filepath));
  
  return { filepath, filename };
}

function cleanupTempFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error("Error cleaning up temp file:", error);
  }
}

async function processAudioOrDocument(filepath, mimeType, text) {
  // Pake base64 aelah
  const fileContent = fs.readFileSync(filepath);
  const fileBase64 = Buffer.from(fileContent).toString("base64");
  
  const filePart = {
    inlineData: {
      data: fileBase64,
      mimeType: mimeType
    }
  };
  
  const prompt = text || (mimeType.startsWith('audio/') ? 
    "Analisis audio ini dan berikan semua informasi yang kamu ketahui tentang apa yang ada di audio" : 
    "Analisis dokumen ini dan berikan semua informasi menarik tentang apa yang ada di dokumen");
  
  const parts = [filePart, prompt];
  const result = await geminiModel.generateContent(parts);
  return result.response.text();
}

let handler = async (m, { sock, args, prefix, command, Uploader }) => {
  if (command.toLowerCase() === "resetgemini") {
    const userId = m.sender;
    if (chatSessions.has(userId)) {
      chatSessions.delete(userId);
      return m.reply("Chat history kamu sudah direset.");
    }
    return m.reply("Kamu belum memiliki chat history.");
  }

  let text;
  if (args.length >= 1) {
    text = args.join(" ");
  } else if (m.quoted && m.quoted.text) {
    text = m.quoted.text;
  } else {
    text = "Analisa apa saja yang ada di dalam file yang diberikan dan berikan penjelasan yang informatif, ekspresif dan mudah dimengerti serta gunakan bahasa sehari-hari. Jangan lupa berikan saran yang berkaitan dengan nada lembut. Jika tidak ada file yang diberikan, maka tanyakan apa yang user butuhkan dengan gaya imut tanpa menyinggung kalimat sebelumnya"
  }

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  
  try {
    const userId = m.sender;
    let chatSession;
    
    if (!chatSessions.has(userId)) {
      chatSession = geminiModel.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
      chatSessions.set(userId, chatSession);
    } else {
      chatSession = chatSessions.get(userId);
    }
    
    if (!mime) {
      // Ini function buat teks doang
      const result = await chatSession.sendMessage(text);
      const response = result.response.text();
      
      if (!response) throw new Error("Response tidak valid dari API");

      await sock.sendMessage(m.chat, {
        text: response
      }, { quoted: m });
    } 
    else if (/audio/.test(q.mime)) {
      // Ini function audio
      let media = await q.download();
      const { filepath, filename } = await saveTempFile(media, mime, 'audio');
      
      try {
        const response = await processAudioOrDocument(filepath, mime, text);
        
        if (!response) throw new Error("Response tidak valid dari API");
        
        await sock.sendMessage(m.chat, {
          text: response
        }, { quoted: m });
      } finally {
        cleanupTempFile(filepath);
      }
    }
    else if (/image/.test(mime) || /video/.test(mime)) {
      // Ini function gambar atau video
      let media = await q.download();
      let isImage = mime.startsWith('image/');
      let isVideo = mime.startsWith('video/');
      let isTele = isImage && /image\/(png|jpe?g)/.test(mime);
      
      let link;
      if (isImage) {
        link = await Uploader.tmpfiles(media);
      } else {
        // Ini function video, samain kaya doc
        const { filepath, filename } = await saveTempFile(media, mime, 'video');
        try {
          const fileContent = fs.readFileSync(filepath);
          const fileBase64 = Buffer.from(fileContent).toString("base64");
          
          const videoPart = {
            inlineData: {
              data: fileBase64,
              mimeType: mime
            }
          };
          
          const parts = [videoPart, text || "Analisis video ini, lalu berikan semua informasi yang ada dalam video dengan lengkap"];
          const result = await geminiModel.generateContent(parts);
          const response = result.response.text();
          
          if (!response) throw new Error("Response tidak valid dari API");
          
          await sock.sendMessage(m.chat, {
            text: response
          }, { quoted: m });
          
          cleanupTempFile(filepath);
          return;
        } catch (error) {
          cleanupTempFile(filepath);
          throw error;
        }
      }
      
      // Proses untuk image
      if (isImage) {
        const imageResp = await fetch(link).then(response => response.arrayBuffer());
        
        const imageBase64 = Buffer.from(imageResp).toString("base64");
        
        const mimeType = mime || "image/jpeg";
        
        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        };
        
        const parts = [imagePart, text];
        const result = await chatSession.sendMessage(parts);
        const response = result.response.text();
        
        if (!response) throw new Error("Response tidak valid dari API");

        await sock.sendMessage(m.chat, {
          text: response
        }, { quoted: m });
      }
    }
    else if (
      mime.startsWith('application/') || 
      mime.startsWith('text/') ||
      mime === 'application/pdf' ||
      mime === 'application/msword' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/vnd.ms-excel' ||
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mime === 'application/vnd.ms-powerpoint' ||
      mime === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      mime === 'text/plain' ||
      mime === 'text/csv'
    ) {
      // Ini function dokumen
      let media = await q.download();
      const { filepath, filename } = await saveTempFile(media, mime, 'document');
      
      try {
        const response = await processAudioOrDocument(filepath, mime, text);
        
        if (!response) throw new Error("Response tidak valid dari API");
        
        await sock.sendMessage(m.chat, {
          text: response
        }, { quoted: m });
      } finally {
        cleanupTempFile(filepath);
      }
    } else {
      return m.reply("Format file tidak didukung. Gunakan text, gambar, audio, atau dokumen.");
    }
    
    // Reset sesi abis 30 menit
    setTimeout(() => {
      if (chatSessions.has(userId)) {
        chatSessions.delete(userId);
      }
    }, 30 * 60 * 1000);
    
  } catch (e) {
    console.error(e);
    m.reply(`Terjadi kesalahan saat memproses permintaan: ${e.message}`);
  }
};

handler.tags = ["ai"];
handler.command = ["gemini", "resetgemini"]

module.exports = handler;