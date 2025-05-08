const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

async function instagramDl(url) {
	return new Promise(async (resolve, reject) => {
		try {
			const { data } = await axios.post('https://yt1s.io/api/ajaxSearch', new URLSearchParams({ q: url, w: '', p: 'home', lang: 'en' }), {
				headers: {
					'Accept': 'application/json, text/plain, */*',
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					'Origin': 'https://yt1s.io',
					'Referer': 'https://yt1s.io/',
					'User-Agent': 'Postify/1.0.0',
				}
			});
			const $ = cheerio.load(data.data);
			let anu = $('a.abutton.is-success.is-fullwidth.btn-premium').map((_, b) => ({
				title: $(b).attr('title'),
				url: $(b).attr('href')
			})).get()
			resolve(anu)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = instagramDl