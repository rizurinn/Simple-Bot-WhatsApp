const fetch = require("node-fetch")

let handler = async (m, { sock, args, prefix, command, scraper }) => {
	let lang, text;
	if (args.length >= 2) {
		(lang = args[0] ? args[0] : "id"), (text = args.slice(1).join(" "));
	} else if (m.quoted && m.quoted.text) {
		(lang = args[0] ? args[0] : "id"), (text = m.quoted.text);
	} else return await m.reply(`Ex: ${prefix + command} id hello i am robot`)
	try {
		const prompt = text.trim();
		let res = await scraper.translate(prompt, lang);
		let lister = Object.keys(await scraper.langList());
		let supp = `Error : Bahasa "${lang}" Tidak Support`;
		if (!lister.includes(lang))
			return m.reply(`${supp}\n\n*Example:*\n${prefix + command} id hello\n\n*Pilih kode yg ada*\n` + lister.map((v, index) => `${index + 1}. ${v}`).join("\n"));

		let Detect = res[1].toUpperCase() ? res[1].toUpperCase() : "US";
		let ToLang = lang.toUpperCase();
		let caption = `*❲•❳ Terdeteksi ❲•❳*
- ${Detect}

*❲•❳ Ke Bahasa ❲•❳*
- ${ToLang}

*❲•❳ Terjemahan ❲•❳*
- ${res[0].trim()}
`;
		await m.reply(caption);
	} catch (e) {
	    console.log(e)
		m.reply(e);
	}
};

handler.tags = ['tool'];
handler.command = ["translate"]

module.exports = handler;