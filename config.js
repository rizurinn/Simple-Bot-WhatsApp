const fs = require('fs')
const chalk = require('chalk')
const moment = require('moment-timezone')
const hariini = moment.tz('Asia/Jakarta').locale('id').format('dddd, DD MMMM YYYY')	
const time = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('HH:mm:ss z')

// System
global.owner = ['6281391620354']
global.botname = 'unknown'
global.listprefix = ['+','!','.']
global.listv = ['•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆']
global.pairing_code = true
global.number_bot = '6288228768785' // 𝘔𝘢𝘴𝘶𝘬𝘪𝘯 𝘕𝘰𝘮𝘰𝘳 𝘠𝘨 𝘔𝘢𝘶 𝘑𝘢𝘥𝘪 𝘉𝘰𝘵 𝘋𝘪 𝘚𝘪𝘯𝘪 𝘉𝘶𝘢𝘵 𝘋𝘢𝘱𝘦𝘵𝘪𝘯 𝘒𝘰𝘥𝘦 𝘗𝘢𝘪𝘳𝘪𝘯𝘨

// Set Sticker
global.packnames = 'Bukan pembuat stiker WhatsApp'
global.authors = `\nDibuat pada ${hariini} ${time}`

//apikey
global.apikey = {
    gemini: // 'your apikey'
}

global.mess = {
	key0: 'Apikey mu telah habis',
	owner: 'Fitur Khusus Owner!',
	admin: 'Fitur Khusus Admin!',
	botAdmin: 'Bot Bukan Admin!',
	group: 'Gunakan Di Group!',
	private: 'Gunakan Di Privat Chat!',
	wait: 'Loading...',
	error: 'Error!',
	done: 'Done'
}
