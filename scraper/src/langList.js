const fetch = require("node-fetch")

async function langList() {
	let data = await fetch(
		"https://translate.google.com/translate_a/l?client=webapp&sl=auto&tl=en&v=1.0&hl=en&pv=1&tk=&source=bh&ssel=0&tsel=0&kc=1&tk=626515.626515&q=",
	).then((response) => response.json());
	return data.tl;
}

module.exports = langList;