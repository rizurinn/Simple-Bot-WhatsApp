const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

async function quotedLyo(teks, name, profile, replynya, color = '#FFFFFF') {
	return new Promise(async (resolve, reject) => {
		const { url, options, reply } = replynya || {}
		const payload = {
			type: 'quote',
			format: 'png',
			backgroundColor: color,
			width: 512,
			height: 768,
			scale: 2,
			messages: [{
				entities: [],
				...(url ? { media: { url }} : {}),
				avatar: true,
				from: {
					id: 1,
					name,
					photo: {
						url: profile
					}
				},
				...(options ? options : {}),
				text: teks,
				replyMessage: reply ? {
					name: reply.name || '',
					text: reply.text || '',
					chatId: Math.floor(Math.random() * 9999999)
				} : {},
			}]
		};
		try {
			const urls = ['https://quotly.netorare.codes/generate', 'https://btzqc.betabotz.eu.org/generate', 'https://qc.botcahx.eu.org/generate', 'https://bot.lyo.su/quote/generate'];
			for (let url of urls) {
				try {
					const { data } = await axios.post(url, JSON.stringify(payload, null, 2), {
						headers: {
							'Content-Type': 'application/json'
						}
					});
					resolve(data)
				} catch (e) {}
			}
		} catch (e) {
			reject(e)
		}
	});
}

module.exports = quotedLyo