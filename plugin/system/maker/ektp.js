let handler = async (m, { sock, text, prefix, command }) => {
    const EXAMPLE = `${prefix + command} provinsi | kota | nik | nama | ttl | jenis_kelamin | golongan_darah | alamat | rt/rw | kel/desa | kecamatan | agama | status | pekerjaan | kewarganegaraan | masa_berlaku | terbuat | pas_photo`
    if (!text) return m.reply(`*Contoh:* ${EXAMPLE}\n\n*Misalnya:* ${prefix + command} Jawa Barat | Cikarang | 1234567890123456 | Erickson | New York, 03-03-1990 | Laki-laki | O | Jl. Perjuangan No. 110 | 001/002 | Tangerang | Cikarang Barat | Islam | Belum Kawin | Konten Kreator | WNI | Seumur Hidup | 04-06-2006 | https://files.image/example.jpg`)

    const parts = text.split('|').map(part => part.trim())

    if (parts.length < 18) return m.reply(`*Contoh:* ${EXAMPLE}\n\n*Misalnya:* ${prefix + command} Jawa Barat | Cikarang | 1234567890123456 | Erickson | New York, 03-03-1990 | Laki-laki | O | Jl. Perjuangan No. 110 | 001/002 | Tangerang | Cikarang Barat | Islam | Belum Kawin | Konten Kreator | WNI | Seumur Hidup | 04-06-2006 | https://files.image/example.jpg`)

    const provinsi = parts[0]
    const kota = parts[1]
    const nik = parts[2]
    const nama = parts[3]
    const ttl = parts[4]
    const jenis_kelamin = parts[5]
    const golongan_darah = parts[6]
    const alamat = parts[7]
    const rtrw = parts[8]
    const keldesa = parts[9]
    const kecamatan = parts[10]
    const agama = parts[11]
    const status = parts[12]
    const pekerjaan = parts[13]
    const kewarganegaraan = parts[14]
    const masa_berlaku = parts[15]
    const terbuat = parts[16]
    const pas_photo = parts[17]

    const PARAMS = new URLSearchParams({
        provinsi: provinsi,
        kota: kota,
        nik: nik,
        nama: nama,
        ttl: ttl,
        jenis_kelamin: jenis_kelamin,
        golongan_darah: golongan_darah,
        alamat: alamat,
        'rt/rw': rtrw,
        'kel/desa': keldesa,
        kecamatan: kecamatan,
        agama: agama,
        status: status,
        pekerjaan: pekerjaan,
        kewarganegaraan: kewarganegaraan,
        masa_berlaku: masa_berlaku,
        terbuat: terbuat,
        pas_photo: pas_photo
    })

    try {
        await sock.sendMessage(m.chat, { react: { text: "🔎", key: m.key} })

        sock.sendMessage(m.chat, { image: { url: `https://api.siputzx.my.id/api/m/ektp?${PARAMS.toString()}` }, caption: '' }, { quoted: m })
    } catch (err) {
        console.error('Terjadi kesalahan:', err)
        m.reply('Terjadi kesalahan')
    }
}

handler.command = ["ektp"]
handler.tags = ["maker"]

module.exports = handler