process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

require('./config');
const fs = require('fs');
const os = require('os');
const qs = require('qs');
const util = require('util');
const jimp = require('jimp');
const path = require('path');
const https = require('https');
const axios = require('axios');
const chalk = require('chalk');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const nou = require('node-os-utils');
const FileType = require('file-type');
const ffmpeg = require('fluent-ffmpeg');
const moment = require('moment-timezone');
const speed = require('performance-now');
const { exec, spawn, execSync } = require('child_process');
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, getBinaryNodeChildren, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, downloadMediaMessage } = require('@whiskeysockets/baileys');

const Func = require('./lib/function');
const { JadiBot, StopJadiBot, ListJadiBot } = require('./lib/jadibot');
const Uploader = require('./lib/uploader');
const Scraper = require('./scraper/index');
const scraper = new Scraper('./scraper/src');
const pluginController = require('./plugin/handler');


module.exports = sock = async (sock, m, store) => {
	try {
		const botNumber = await sock.decodeJid(sock.user.id)
		const body = (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtom.replyMessage') ? m.message.templateButtom.replyMessage.selectedId : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : ''
		const budy = (typeof m.text == 'string' ? m.text : '')
		const isCreator = isOwner = [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
		const prefix = body.startsWith("q") ? "q" : body.startsWith("!") ? "!" : body.startsWith("$") ? "$" : body.startsWith(">") ? ">" : body.startsWith("=>") ? "=>" : body.startsWith("?") ? "?" : "," 
		const isCmd = body.startsWith(prefix)
		const args = body.trim().split(/ +/).slice(1)
		const quoted = m.quoted ? m.quoted : m
		const command = isCreator ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : isCmd ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : ''
		const text = q = args.join(' ')
		const mime = (quoted.msg || quoted).mimetype || ''
		const qmsg = (quoted.msg || quoted)
		const hari = moment.tz('Asia/Jakarta').locale('id').format('dddd');
		const tanggal = moment.tz('Asia/Jakarta').locale('id').format('DD/MM/YYYY');
		const jam = moment.tz('Asia/Jakarta').locale('id').format('HH:mm:ss');
		const ucapanWaktu = jam < '05:00:00' ? 'Selamat Pagi 🌉' : jam < '11:00:00' ? 'Selamat Pagi 🌄' : jam < '15:00:00' ? 'Selamat Siang 🏙' : jam < '18:00:00' ? 'Selamat Sore 🌅' : jam < '19:00:00' ? 'Selamat Sore 🌃' : jam < '23:59:00' ? 'Selamat Malam 🌌' : 'Selamat Malam 🌌';
		const almost = 0.72
		const time = Date.now()
		const time_now = new Date()
		const time_end = 60000 - (time_now.getSeconds() * 1000 + time_now.getMilliseconds());
		const readmore = String.fromCharCode(8206).repeat(999)
		
		if (m.message && m.key.remoteJid !== 'status@broadcast') {
			console.log(chalk.black(chalk.bgWhite('[ PESAN ]:'), chalk.bgGreen(new Date), chalk.bgHex('#00EAD3')(budy || m.type) + '\n' + chalk.bgCyanBright('[ DARI ] :'), chalk.bgYellow(m.pushName || (isCreator ? 'Bot' : 'Anonim')), chalk.bgHex('#FF449F')(m.sender), chalk.bgHex('#FF5700')(m.isGroup ? m.metadata.subject : m.chat.endsWith('@newsletter') ? 'Newsletter' : 'Private Chat'), chalk.bgBlue('(' + m.chat + ')')));
	       }

        //Scraper
        await scraper.load();

		//Plugin handler
		const pluginContext = {
            sock,
            m,
            scraper,
            command,
            prefix,
            quoted,
            args,
            text,
            isCreator,
            Func,
            Uploader
        };
        const context = pluginContext;
        const handled = await pluginController.execBefore(m, context);
        if (handled) return

        let pluginHandled = false;
        if (isCmd) {
            pluginHandled = await pluginController.handleCommand(m, pluginContext, command);
        }
        
        if (!pluginHandled && isCmd) {
		switch(command) {


			//Download Menu
			case 'tiktok': case 'ttdl': case 'tt': {
				if (!text) return m.reply(`Example: ${prefix + command} url_tiktok`)
				if (!text.includes('tiktok.com')) return m.reply('Url Tidak Mengandung Result Dari Tiktok!')
				try {
					const hasil = await scraper.tiktokDl(text);
					m.reply(mess.wait)
					if (hasil && hasil.size_nowm) {
						await sock.sendFileUrl(m.chat, hasil.data[1].url, `*📍Title:* ${hasil.title}\n*⏳Duration:* ${hasil.duration}\n*🎃Author:* ${hasil.author.nickname} (@${hasil.author.fullname})`, m)
					} else {
						for (let i = 0; i < hasil.data.length; i++) {
							await sock.sendFileUrl(m.chat, hasil.data[i].url, `*🚀Image:* ${i+1}`, m)
						}
					}
				} catch (e) {
					m.reply('Gagal/Url tidak valid!')
				}
			}
			break
			case 'ttmp3': case 'tiktokmp3': case 'ttaudio': {
				if (!text) return m.reply(`Example: ${prefix + command} url_tiktok`)
				if (!text.includes('tiktok.com')) return m.reply('Url Tidak Mengandung Result Dari Tiktok!')
				try {
					const hasil = await scraper.tiktokDl(text);
					m.reply(mess.wait)
					await sock.sendMessage(m.chat, {
						audio: { url: hasil.music_info.url },
						mimetype: 'audio/mpeg',
						contextInfo: {
							externalAdReply: {
								title: 'TikTok • ' + hasil.author.nickname,
								body: hasil.stats.likes + ' suka, ' + hasil.stats.comment + ' komentar. ' + hasil.title,
								previewType: 'PHOTO',
								thumbnailUrl: hasil.cover,
								mediaType: 1,
								renderLargerThumbnail: true,
								sourceUrl: text
							}
						}
					}, { quoted: m });
				} catch (e) {
					m.reply('Gagal/Url tidak valid!')
				}
			}
			break
			case 'fb': case 'fbdl': case 'facebook': {
				if (!text) return m.reply(`Example: ${prefix + command} url_facebook`)
				if (!text.includes('facebook.com')) return m.reply('Url Tidak Mengandung Result Dari Facebook!')
				try {
					const hasil = await scraper.facebookDl(text);
					if (hasil.results.length < 1) {
						m.reply('Video Tidak ditemukan!')
					} else {
						m.reply(mess.wait)
						await sock.sendFileUrl(m.chat, hasil.results[0].url, `*🎐Title:* ${hasil.caption}`, m);
					}
				} catch (e) {
				    console.log(e)
					m.reply('Server downloader facebook sedang offline!')
				}
			}
			break
			case 'gitclone': {
				if (!args[0]) return m.reply(`Example: ${prefix + command} https://github.com/`)
				if (!Func.isUrl(args[0]) && !args[0].includes('github.com')) return m.reply('Gunakan Url Github!')
				let [, user, repo] = args[0].match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || []
				try {
					sock.sendMessage(m.chat, { document: { url: `https://api.github.com/repos/${user}/${repo}/zipball` }, fileName: repo + '.zip', mimetype: 'application/zip' }, { quoted: m }).catch((e) => m.reply(mess.error))
				} catch (e) {
					m.reply('Gagal!')
				}
			}
			break
			
			// Group Menu
			case 'add': {
				if (!m.isGroup) return m.reply(mess.group)
				if (!m.isAdmin) return m.reply(mess.admin)
				if (!m.isBotAdmin) return m.reply(mess.botAdmin)
				if (!text && !m.quoted) {
					m.reply(`Contoh: ${prefix + command} 62xxx`)
				} else {
					const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
					try {
						await sock.groupParticipantsUpdate(m.chat, [numbersOnly], 'add').then(async (res) => {
							for (let i of res) {
								let invv = await sock.groupInviteCode(m.chat)
								if (i.status == 401) return m.reply('Dia Memblokir Bot!')
								if (i.status == 409) return m.reply('Dia Sudah Join!')
								if (i.status == 500) return m.reply('Grub Penuh!')
								if (i.status == 408) {
									await sock.sendMessage(m.chat, { text: `@${numbersOnly.split('@')[0]} Baru-Baru Saja Keluar Dari Grub Ini!\n\nKarena Target Private\n\nUndangan Akan Dikirimkan Ke\n-> wa.me/${numbersOnly.replace(/\D/g, '')}\nMelalui Jalur Pribadi`, mentions: [numbersOnly] }, { quoted : m })
									await sock.sendMessage(`${numbersOnly ? numbersOnly : '6285167249152@s.whatsapp.net'}`, { text: `${'https://chat.whatsapp.com/' + invv}\n------------------------------------------------------\n\nAdmin: @${m.sender.split('@')[0]}\nMengundang anda ke group ini\nSilahkan masuk jika berkehendak🙇`, detectLink: true, mentions: [numbersOnly, m.sender] }, { quoted : fkontak }).catch((err) => m.reply('Gagal Mengirim Undangan!'))
								} else if (i.status == 403) {
									let a = i.content.content[0].attrs
									await sock.sendGroupInvite(m.chat, numbersOnly, a.code, a.expiration, m.metadata.subject, `Admin: @${m.sender.split('@')[0]}\nMengundang anda ke group ini\nSilahkan masuk jika berkehendak🙇`, null, { mentions: [m.sender] })
									await sock.sendMessage(m.chat, { text: `@${numbersOnly.split('@')[0]} Tidak Dapat Ditambahkan\n\nKarena Target Private\n\nUndangan Akan Dikirimkan Ke\n-> wa.me/${numbersOnly.replace(/\D/g, '')}\nMelalui Jalur Pribadi`, mentions: [numbersOnly] }, { quoted : m })
								} else if (![200, 401, 409, 500].includes(i.status)) {
									m.reply('Gagal Add User\nStatus : ' + i.status)
								}
							}
						})
					} catch (e) {
						m.reply('Terjadi Kesalahan! Gagal Add User')
					}
				}
			}
			break
			
			// Owner Menu
			case 'setbio': {
				if (!isCreator) return
				if (!text) return m.reply('Mana text nya?')
				sock.setStatus(q)
				m.reply(`*Bio telah di ganti menjadi ${q}*`)
			}
			break
			case 'setppbot': {
				if (!isCreator) return
				if (!/image/.test(mime)) return m.reply(`Reply Image Dengan Caption ${prefix + command}`)
				let media = await sock.downloadAndSaveMediaMessage(quoted, 'ppbot.jpeg')
				if (text.length > 0) {
					let { img } = await Func.generateProfilePicture(media)
					await sock.query({
						tag: 'iq',
						attrs: {
							to: '@s.whatsapp.net',
							type: 'set',
							xmlns: 'w:profile:picture'
						},
						content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
					})
					await fs.unlinkSync(media)
					m.reply('Sukses')
				} else {
					await sock.updateProfilePicture(botNumber, { url: media })
					await fs.unlinkSync(media)
					m.reply('Sukses')
				}
			}
			break
			case 'delppbot': {
				if (!isCreator) return
				await sock.removeProfilePicture(sock.user.id)
				m.reply('Sukses')
			}
			break
			case 'join': {
				if (!isCreator) return
				if (!text) return m.reply('Masukkan Link Group!')
				if (!Func.isUrl(args[0]) && !args[0].includes('whatsapp.com')) return m.reply('Link Invalid!')
				const result = args[0].split('https://chat.whatsapp.com/')[1]
				m.reply(mess.wait)
				await sock.groupAcceptInvite(result).catch((res) => {
					if (res.data == 400) return m.reply('Grup Tidak Di Temukan❗');
					if (res.data == 401) return m.reply('Bot Di Kick Dari Grup Tersebut❗');
					if (res.data == 409) return m.reply('Bot Sudah Join Di Grup Tersebut❗');
					if (res.data == 410) return m.reply('Url Grup Telah Di Setel Ulang❗');
					if (res.data == 500) return m.reply('Grup Penuh❗');
				})
			}
			break
			case 'leave': {
				if (!isCreator) return
				await sock.groupLeave(m.chat).then(() => sock.sendFromOwner(owner, 'Sukses Keluar Dari Grup', m, { contextInfo: { isForwarded: true }}))
			}
			break
			case 'clearchat': {
				if (!isCreator) return
				await sock.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.timestamp }] }, m.chat)
				m.reply('Sukses Membersihkan Pesan')
			}
			break
			case 'blokir': case 'block': {
				if (!isCreator) return
				if (!text && !m.quoted) {
					m.reply(`Contoh: ${prefix + command} 62xxx`)
				} else {
					const numbersOnly = m.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender) : m.chat
					await sock.updateBlockStatus(numbersOnly, 'block').then((a) => m.reply(mess.done)).catch((err) => m.reply('Gagal!'))
				}
			}
			break
			case 'listblock': {
				let anu = await sock.fetchBlocklist()
				m.reply(`Total Block : ${anu.length}\n` + anu.map(v => '• ' + v.replace(/@.+/, '')).join`\n`)
			}
			break
			 case 'unblokir': case 'unblock': {
				if (!isCreator) return m.reply(mess.owner)
				if (!text && !m.quoted) {
					m.reply(`Contoh: ${prefix + command} 62xxx`)
				} else {
					const numbersOnly = m.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender) : m.chat
					await sock.updateBlockStatus(numbersOnly, 'unblock').then((a) => m.reply(mess.done)).catch((err) => m.reply('Gagal!'))
				}
			}
			break
			case 'addcase': {
				if (!isCreator) return m.reply(mess.owner)
				if (!text && !text.startsWith('case')) return m.reply('Masukkan Casenya!')
				fs.readFile('case.js', 'utf8', (err, data) => {
					if (err) {
						console.error('Terjadi kesalahan saat membaca file:', err);
						return;
					}
					const posisi = data.indexOf("switch(command) {");
					if (posisi !== -1) {
						const codeBaru = data.slice(0, posisi) + '\n' + `${text}` + '\n' + data.slice(posisi);
						fs.writeFile('case.js', codeBaru, 'utf8', (err) => {
							if (err) {
								m.reply('Terjadi kesalahan saat menulis file: ', err);
							} else {
								m.reply('Case berhasil ditambahkan');
							}
						});
					} else {
						m.reply('Gagal Menambahkan case!');
					}
				});
			}
			break
			case 'getcase': {
				if (!isCreator) return m.reply(mess.owner)
				if (!text) return m.reply('Masukkan Nama Casenya!')
				try {
					const getCase = (cases) => {
						return "case"+`'${cases}'`+fs.readFileSync("case.js").toString().split('case \''+cases+'\'')[1].split("break")[0]+"break"
					}
					m.reply(`${getCase(text)}`)
				} catch (e) {
					m.reply(`case ${text} tidak ditemukan!`)
				}
			}
			break
			case 'delcase': {
				if (!isCreator) return m.reply(mess.owner)
				if (!text) return m.reply('Masukkan Nama Casenya!')
				fs.readFile('case.js', 'utf8', (err, data) => {
					if (err) {
						console.error('Terjadi kesalahan saat membaca file:', err);
						return;
					}
					const regex = new RegExp(`case\\s+'${text.toLowerCase()}':[\\s\\S]*?break`, 'g');
					const modifiedData = data.replace(regex, '');
					fs.writeFile('case.js', modifiedData, 'utf8', (err) => {
						if (err) {
							m.reply('Terjadi kesalahan saat menulis file: ', err);
						} else {
							m.reply('Case berhasil dihapus dari file');
						}
					});
				});
			}
			break
			case 'getsession': {
				if (!isCreator) return m.reply(mess.owner)
				await sock.sendMessage(m.chat, {
					document: fs.readFileSync('./session/creds.json'),
					mimetype: 'application/json',
					fileName: 'creds.json'
				}, { quoted: m });
			}
			break
			case 'delsession': {
				if (!isCreator) return m.reply(mess.owner)
				fs.readdir('./session', async function (err, files) {
					if (err) {
						console.error('Unable to scan directory: ' + err);
						return m.reply('Unable to scan directory: ' + err);
					}
					let filteredArray = await files.filter(item => ['session-', 'pre-key', 'sender-key', 'app-state'].some(ext => item.startsWith(ext)));					
					let teks = `Terdeteksi ${filteredArray.length} Session file\n\n`
					if(filteredArray.length == 0) return m.reply(teks);
					filteredArray.map(function(e, i) {
						teks += (i+1)+`. ${e}\n`
					})
					if (text && text == 'true') {
						let { key } = await m.reply('Menghapus Session File..')
						await filteredArray.forEach(function (file) {
							fs.unlinkSync('./session/' + file)
						});
						sleep(2000)
						m.reply('Berhasil Menghapus Semua Sampah Session', { edit: key })
					} else m.reply(teks + `\nKetik _${prefix + command} true_\nUntuk Menghapus`)
				});
			}
			break
			case 'delsampah': {
				if (!isCreator) return m.reply(mess.owner)
				fs.readdir('./tmp/sampah', async function (err, files) {
					if (err) {
						console.error('Unable to scan directory: ' + err);
						return m.reply('Unable to scan directory: ' + err);
					}
					let filteredArray = await files.filter(item => ['gif', 'png', 'bin','mp3', 'mp4', 'jpg', 'webp', 'webm', 'opus', 'jpeg'].some(ext => item.endsWith(ext)));
					let teks = `Terdeteksi ${filteredArray.length} Sampah file\n\n`
					if(filteredArray.length == 0) return m.reply(teks);
					filteredArray.map(function(e, i) {
						teks += (i+1)+`. ${e}\n`
					})
					if (text && text == 'true') {
						let { key } = await m.reply('Menghapus Sampah File..')
						await filteredArray.forEach(function (file) {
							fs.unlinkSync('./tmp/sampah/' + file)
						});
						sleep(2000)
						m.reply('Berhasil Menghapus Semua Sampah', { edit: key })
					} else m.reply(teks + `\nKetik _${prefix + command} true_\nUntuk Menghapus`)
				});
			}
			break
			case 'jadibot': {
				const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
				const onWa = await sock.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply('Nomer Tersebut Tidak Terdaftar Di Whatsapp!')
				await JadiBot(sock, nmrnya, m)
				m.reply(`Gunakan ${prefix}stopjadibot\nUntuk Berhenti`)
			}
			break
			case 'stopjadibot': case 'deljadibot': {
				const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
				const onWa = await sock.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply('Nomer Tersebut Tidak Terdaftar Di Whatsapp!')
				await StopJadiBot(sock, nmrnya, m)
			}
			break
			case 'listjadibot': {
				ListJadiBot(sock, m)
			}
			break
			case 'backup': {
				if (!isCreator) return m.reply(mess.owner);
				let sender = m.mentionedJid[0] || m.sender || slimecode.parseMention(args[0]) || (args[0].replace(/[@.+-]/g, '').replace(' ', '') + '@s.whatsapp.net') || '';
				let date = new Date();
				let filename = await Func.randomText(32);
				const { execSync } = require('child_process');
				const ls = (await execSync('ls')).toString().split('\n').filter((cek) => cek !== 'node_modules' && cek !== 'package-lock.json' && cek !== '');
				await m.reply('Hasil backup akan dikirim lewat chat pribadi ya!');
				await execSync(`zip -r ${filename}.zip ${ls.join(' ')}`);
				const sentMessage = await sock.sendMessage(sender, {
					document: await fs.readFileSync(`./${filename}.zip`),
					mimetype: 'application/zip',
					fileName: `${filename}.zip`,
					caption: 'Berhasil! Silakan download dan simpan file backup-nya ya.'
				});
				await execSync(`rm -rf ${filename}.zip`);
				console.log(`${filename}.zip telah dihapus dari file lokal.`);
			}
			break
			
			//Sticker Menu
			case 'sticker': case 'stiker': case 's': case 'stickergif': case 'stikergif': case 'sgif': case 'swm': case 'take': {
				if (!/image|video|sticker/.test(quoted.type)) return m.reply(`Kirim/reply gambar/video/gif dengan caption ${prefix + command}\nDurasi Image/Video/Gif 1-9 Detik`)
				let media = await quoted.download()
				let teks1 = text.split`|`[0] ? text.split`|`[0] : ''
				let teks2 = text.split`|`[1] ? text.split`|`[1] : ''
					let packname = teks1 || packnames;
                    let author = teks2 || authors;

                        if (/image|webp/.test(mime)) {
            await sock.sendImageAsSticker(m.chat, media, m, { 
                pack: packname, 
                author: author, 
                quality: 100,
                type: 'full',
                resolution: 512,
                removebg: true,
                cropPosition: 'center'
            });
				} else if (/video/.test(mime)) {
					if ((qmsg).seconds > 11) return m.reply('Maksimal 10 detik!')
					await sock.sendAsSticker(m.chat, media, m, { packname: packname, author: author })
				} else {
					m.reply(`Kirim/reply gambar/video/gif dengan caption ${prefix + command}\nDurasi Video/Gif 1-9 Detik`)
				}
			}
			break
			case 'stickersearch':
            case 'stikersearch': {
                    if (!args.length) {
                        await m.reply(`Masukan kata kunci!\ncontoh:\n\n${prefix + command} Genshin impact`);
                        return;
                    }

                    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

                    try {
                        const query = args.join(' ');
                        const result = await scraper.stickerSearch(query);

                        if (!result || !result.result || !result.result.sticker || result.result.sticker.length === 0) {
                            await m.reply('Tidak ada stiker ditemukan. Silakan coba kata kunci lain.');
                            return;
                        }

                        const stickers = result.result.sticker;
                        const stickerSetTitle = result.result.title || 'Sticker Set';
                        const sAuthor = result.result.author;

                        const caption = `*Hasil pencarian stiker:* "${query}"\n*Set Stiker:* ${stickerSetTitle}\n*Total Stiker:* ${stickers.length}`;

                        if (stickers.length > 0) {
                            await sock.sendImageAsSticker(m.chat, stickers[0], m, {
                                pack: stickerSetTitle,
                                author: sAuthor
                            });
                        }

                        if (stickers.length > 1) {
                            const remainingStickers = stickers.slice(1);

                            for (const stickerUrl of remainingStickers) {
                                await sock.sendImageAsSticker(m.sender, stickerUrl, m, {
                                    pack: stickerSetTitle,
                                    author: sAuthor
                                });

                                await delay(5000);
                            }

                            await m.reply(`Sisa ${remainingStickers.length} stiker telah dikirim ke chat pribadi Anda.`);
                        }

                    } catch (error) {
                        console.error("Error pada fitur sticker search:", error);

                        let errorMsg = 'Terjadi kesalahan saat mencari stiker.';

                        if (error.response) {
                            if (error.response.status === 404) {
                                errorMsg = 'Stiker API tidak dapat diakses. Silakan coba lagi nanti.';
                            } else {
                                errorMsg = 'Gagal mengambil data stiker. Silakan coba lagi.';
                            }
                        } else if (error.code === 'ENOTFOUND') {
                            errorMsg = 'Gagal mengakses server. Periksa koneksi internet Anda.';
                        }

                        await m.reply(errorMsg);
                    }
                }
                break
			    case 'smeme': case 'stickmeme':  case 'stickermeme': {
				try {
					if (!/image|webp/.test(mime)) return m.reply(`Kirim/reply image/sticker\nDengan caption ${prefix + command} atas|bawah`)
					if (!text) return m.reply(`Kirim/reply image/sticker dengan caption ${prefix + command} atas|bawah`)
					let atas = text.split`|`[0] ? text.split`|`[0] : '-'
					let bawah = text.split`|`[1] ? text.split`|`[1] : '-'
					let media = await quoted.download()
					let mem = await Uploader.tmpfiles(media)
					let smeme = await axios.get(`https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${mem}`, { responseType: 'arraybuffer' });
					await sock.sendImageAsSticker(m.chat, Buffer.from(smeme.data), m, { pack: packnames, author: authors });
				} catch (e) {
					console.log(e)
					m.reply('Server Meme Sedang Offline!')
				}
			}
			break
			case 'emojimix': {
				if (!text) return m.reply(`Example: ${prefix + command} 😅+🤔`)
				let [emoji1, emoji2] = text.split`+`
				if (!emoji1 && !emoji2) return m.reply(`Example: ${prefix + command} 😅+🤔`)
				try {
					let anu = await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`)
					if (anu.data.results.length < 1) return m.reply(`Mix Emoji ${text} Tidak Ditemukan!`)
					for (let res of anu.data.results) {
						await sock.sendImageAsSticker(m.chat, res.url, m, { pack: packnames, author: authors });
					}
				} catch (e) {
					console.log(e)
					m.reply('Gagal Mix Emoji!')
				}
			}
			break
			case 'qc': case 'quote': {
				if (!text && !m.quoted) return m.reply(`Kirim/reply pesan *${prefix + command}* Teksnya`)
				try {
					let ppnya = await sock.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');
					let res = await scraper.quotedLyo(text, m.pushName, ppnya);
					await sock.sendImageAsSticker(m.chat, Buffer.from(res.result.image, 'base64'), m, { pack: packnames, author: authors })
				} catch (e) {
					console.log(e)
					m.reply('Server Create Sedang Offline!')
				}
			}
			break
			case 'brat': {
				if (!text && (!m.quoted || !m.quoted.text)) return m.reply(`Kirim/reply pesan *${prefix + command}* Teksnya`)
				try {
					await sock.sendImageAsSticker(m.chat, `https://fgsi1-brat.hf.space/?text=${encodeURIComponent(text || m.quoted.text)}&modeBlur=true`, m, { pack: packnames, author: authors })
				} catch (e) {
					try {
						await sock.sendMessage(m.chat, { image: { url: 'https://mannoffc-x.hf.space/brat?q=' + (text || m.quoted.text) }}, { quoted: m })
					} catch (e) {
						console.log(e)
						m.reply('Server Brat Sedang Offline!')
					}
				}
			}
			break
			case 'bratvid': {
				if (!text && (!m.quoted || !m.quoted.text)) return m.reply(`Kirim/reply pesan *${prefix + command}* Teksnya`)
				try {
						const res = await axios.get(`https://fgsi1-brat.hf.space/?text=${encodeURIComponent(text || m.quoted.text)}&modeBlur=true&isVideo=true`, { responseType: 'arraybuffer' });

					sock.sendAsSticker(m.chat, Buffer.from(res.data), m, { packname: packnames, author: authors })
					
				} catch (e) {
					console.log(e)
					m.reply('Terjadi Kesalahan Saat Memproses Permintaan!')
				}
			}
			break
			
			//Tool Menu
			case 'ping': {
              function formatp(bytes) {
                if (bytes < 1024) return `${bytes} B`
                const kb = bytes / 1024
                if (kb < 1024) return `${kb.toFixed(2)} KB`
                const mb = kb / 1024
                if (mb < 1024) return `${mb.toFixed(2)} MB`
                const gb = mb / 1024
                return `${gb.toFixed(2)} GB`
              }
            
              async function getServerInfo() {
                try {
                  const osType = nou.os.type()
                  const release = os.release()
                  const arch = os.arch()
                  const nodeVersion = process.version
                  const ip = await nou.os.ip()
            
                  const cpus = os.cpus()
                  const cpuModel = cpus[0].model
                  const coreCount = cpus.length
                  const cpu = cpus.reduce((acc, cpu) => {
                    acc.total += Object.values(cpu.times).reduce((a, b) => a + b, 0)
                    acc.speed += cpu.speed
                    acc.times.user += cpu.times.user
                    acc.times.nice += cpu.times.nice
                    acc.times.sys += cpu.times.sys
                    acc.times.idle += cpu.times.idle
                    acc.times.irq += cpu.times.irq
                    return acc
                  }, { speed: 0, total: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } })
                  const cpuUsage = ((cpu.times.user + cpu.times.sys) / cpu.total * 100).toFixed(2) + '%'
                  const loadAverage = os.loadavg()
                  const totalMem = os.totalmem()
                  const freeMem = os.freemem()
                  const usedMem = totalMem - freeMem
                  const storageInfo = await nou.drive.info()
                  const speed = require('performance-now')
                  const timestamp = speed()
                  const latensi = speed() - timestamp
                  const responseText = `*PING*
     • Latensi: ${latensi.toFixed(4)} detik

*INFO SERVER*
     • OS: ${osType} (${release})
     • Arsitektur: ${arch}
     • Versi Node.js: ${nodeVersion}
            
*CPU SISTEM*
     • Model: ${cpuModel}
     • Kecepatan: ${cpu.speed} MHz
     • Beban CPU: ${cpuUsage} (${coreCount} Core)
     • Load Average: ${loadAverage.join(', ')}
            
*MEMORI (RAM)*
     • Total: ${formatp(totalMem)}
     • Digunakan: ${formatp(usedMem)}
     • Tersedia: ${formatp(freeMem)}
            
*PENYIMPANAN*
     • Total: ${storageInfo.totalGb} GB
     • Digunakan: ${storageInfo.usedGb} GB (${storageInfo.usedPercentage}%)
     • Tersedia: ${storageInfo.freeGb} GB (${storageInfo.freePercentage}%)`
                  return responseText.trim()
                } catch (error) {
                  console.error('Error mendapatkan informasi server:', error)
                  return 'Terjadi kesalahan dalam mendapatkan informasi server.'
                }
              }
            
              getServerInfo().then(responseText => {
                sock.sendMessage(m.chat, { text: responseText }, { quoted: m })
              })
            }
            break
			case 'speedtest': {
				m.reply('Testing Speed...')
				let cp = require('child_process')
				let { promisify } = require('util')
				let exec = promisify(cp.exec).bind(cp)
				let o
				try {
					o = await exec('python3 speed.py --share')
				} catch (e) {
					o = e
				} finally {
					let { stdout, stderr } = o
					if (stdout.trim()) m.reply(stdout)
					if (stderr.trim()) m.reply(stderr)
				}
			}
			break
			
			default:
			if (budy.startsWith('>')) {
				if (!isCreator) return;
                let kode = budy.trim().split(/ +/)[0];
                let teks;
                  try {
                     teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${q}})()`)
                  } catch (e) {
                  teks = e;
                  } finally {
                  await sock.sendMessage(m.chat, {
                     text: require('util').format(teks)
                  }, {
                     quoted: m
                  });
                }
			}
			if (budy.startsWith('=>')) {
                if (!isCreator) return;

                function Return(sul) {
                  sat = JSON.stringify(sul, null, 2);
                  bang = util.format(sat);
                     if (sat == undefined) {
                         bang = util.format(sul);
                     }
                  return sock.sendMessage(m.chat, {
                     text: bang
                  }, {
                     quoted: m
                  });
                }
                try {
                  m.reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)));
                  } catch (e) {
                    sock.sendMessage(sender, {
                    text: String(e)
                    }, {
                    quoted: m
                    });
                }
            }

			if (budy.startsWith('$')) {
				if (!isCreator) return
				if (!text) return
				exec(budy.slice(2), (err, stdout) => {
					if (err) return m.reply(`${err}`)
					if (stdout) return m.reply(stdout)
				})
			}
		}
	}
	} catch (err) {
		console.log(util.format(err));
		//m.reply('*❗ Internal server error️*');
		sock.sendFromOwner(owner, 'Halo sayang, sepertinya ada yang error nih, jangan lupa diperbaiki ya\n\n*Log error:*\n\n' + util.format(err), m, { contextInfo: { isForwarded: true }})
	}
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
});
