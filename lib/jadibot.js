require('../config');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const { exec, spawn, execSync } = require('child_process');
const { parsePhoneNumber } = require('awesome-phonenumber');
const { default: WAsockection, useMultiFileAuthState, Browsers, DissockectReason, makeInMemoryStore, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, proto, getAggregateVotesInPollMessage } = require('@whiskeysockets/baileys');

const { GroupUpdate, GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./message');

const sock = {};

const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

async function JadiBot(sock, from, m) {
	async function startJadiBot() {
		try {
			const { state, saveCreds } = await useMultiFileAuthState(`./tmp/jadibot/${from}`);
			const { version, isLatest } = await fetchLatestBaileysVersion();
			const level = pino({ level: 'silent' })
			
			const getMessage = async (key) => {
				if (store) {
					const msg = await store.loadMessage(key.remoteJid, key.id);
					return msg?.message || ''
				}
				return {
					conversation: 'Halo Saya Adalah Bot'
				}
			}
			
			sock[from] = WAsockection({
				isLatest,
				logger: level,
				getMessage,
				syncFullHistory: true,
				maxMsgRetryCount: 15,
				msgRetryCounterCache,
				retryRequestDelayMs: 10,
				defaultQueryTimeoutMs: 0,
				printQRInTerminal: false,
				browser: Browsers.ubuntu('Safari'),
				transactionOpts: {
					maxCommitRetries: 10,
					delayBetweenTriesMs: 10,
				},
				appStateMacVerification: {
					patch: true,
					snapshot: true,
				},
				auth: {
					creds: state.creds,
					keys: makeCacheableSignalKeyStore(state.keys, level),
				},
			})
			
			if (!sock[from].authState.creds.registered) {
				let phoneNumber = from.replace(/[^0-9]/g, '')
				setTimeout(async () => {
					exec('rm -rf ./tmp/jadibot/' + from + '/*')
					let code = await sock[from].requestPairingCode(phoneNumber);
					m.reply(`Your Pairing Code : ${code?.match(/.{1,4}/g)?.join('-') || code}`);
				}, 3000)
			}
			
			store.bind(sock[from].ev)
			
			await Solving(sock[from], store)
			
			sock[from].ev.on('creds.update', saveCreds)
			
			sock[from].ev.on('sockection.update', async (update) => {
				const { sockection, lastDissockect, receivedPendingNotifications } = update
				if (sockection === 'close') {
					const reason = new Boom(lastDissockect?.error)?.output.statusCode
					if ([DissockectReason.sockectionLost, DissockectReason.sockectionClosed, DissockectReason.restartRequired, DissockectReason.timedOut, DissockectReason.badSession, DissockectReason.sockectionReplaced].includes(reason)) {
						JadiBot(sock, from, m)
					} else if (reason === DissockectReason.loggedOut) {
						m.reply('Scan again and Run...');
						StopJadiBot(sock, from, m)
					} else if (reason === DissockectReason.Multidevicemismatch) {
						m.reply('Scan again...');
						StopJadiBot(sock, from, m)
					} else {
						m.reply('Anda Sudah Tidak Lagi Menjadi Bot!')
					}
				}
				if (sockection == 'open') {
					let botNumber = await sock[from].decodeJid(sock[from].user.id);
				}
				if (receivedPendingNotifications == 'true') {
					sock[from].ev.flush()
				}
			});
			
			sock[from].ev.on('contacts.update', (update) => {
				for (let contact of update) {
					let id = sock[from].decodeJid(contact.id)
					if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
				}
			});
			
			sock[from].ev.on('groups.update', async (update) => {
				await GroupUpdate(sock[from], update, store);
			});
			
			sock[from].ev.on('group-participants.update', async (update) => {
				await GroupParticipantsUpdate(sock[from], update, store);
			});
			
			sock[from].ev.on('messages.upsert', async (message) => {
				await MessagesUpsert(sock[from], message, store);
			});
		
			return sock[from]
		} catch (e) {
			console.log('Error di jadibot : ', e)
		}
	}
	return startJadiBot()
}

async function StopJadiBot(sock, from, m) {
	if (!Object.keys(sock).includes(from)) {
		return sock.sendMessage(m.chat, { text: 'Anda Tidak Sedang jadibot!' }, { quoted: m })
	}
	try {
		sock[from].end('Stop')
		sock[from].ev.removeAllListeners()
	} catch (e) {
		console.log('Errornya di stopjadibot : ', e)
	}
	delete sock[from]
	exec(`rm -rf ./tmp/jadibot/${from}`)
	return m.reply('Sukses Keluar Dari Sessi Jadi bot')
}

async function ListJadiBot(sock, m) {
	let teks = 'List Jadi Bot :\n\n'
	for (let jadibot of Object.values(sock)) {
		teks += `- @${sock.decodeJid(jadibot.user.id).split('@')[0]}\n`
	}
	return m.reply(teks)
}

module.exports = { JadiBot, StopJadiBot, ListJadiBot }