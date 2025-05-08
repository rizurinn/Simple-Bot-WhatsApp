const pinterestResults = {};

const handler = async (m, {
    sock,
    scraper,
    args,
    prefix,
    command
}) => {
    // Handle next command for displaying next image
    if (command === 'next') {
        // Check if this user has active Pinterest results
        if (!pinterestResults[m.sender] || !pinterestResults[m.sender].images.length) {
            await m.reply('Tidak ada hasil pencarian Pinterest aktif. Silakan lakukan pencarian terlebih dahulu.');
            return;
        }

        const userData = pinterestResults[m.sender];
        const currentIndex = userData.currentIndex;
        
        // Check if we've reached the end of the results
        if (currentIndex + 1 >= userData.images.length) {
            await m.reply('Semua gambar sudah ditampilkan. Pencarian selesai.');
            // Clear the results to free up memory
            delete pinterestResults[m.sender];
            return;
        }

        // Move to the next image
        userData.currentIndex++;
        const nextIndex = userData.currentIndex;
        const nextImage = userData.images[nextIndex];

        await sock.sendMessage(m.chat, {
            image: {
                url: nextImage.url
            },
            caption: `${nextImage.caption}\n\n*Hasil pencarian untuk:* "${userData.query}"\n*Image:* ${nextIndex + 1}/${userData.images.length}\n\nKetik *${prefix}next* untuk melihat gambar selanjutnya`,
        }, {
            quoted: m
        });
        
        return;
    }

    // Original Pinterest search functionality
    if (command === 'pinterest' || command === 'pin') {
        if (!args.length) {
            await m.reply(`Masukan kata kunci!\ncontoh:\n\n${prefix + command} Alya`);
            return;
        }
        
        try {
            const query = args.join(' ');
            const results = await scraper.pins(query);

            if (!results.length) {
                await m.reply('Tidak ada gambar ditemukan. Silakan coba kata kunci lain.');
                return;
            }

            const images = results.map(result => ({
                url: result.image_large_url || result.image_small_url,
                caption: `乂───『[ Pinterest ]』───乂`
            }));

            // Store results for this user
            pinterestResults[m.sender] = {
                query: query,
                images: images,
                currentIndex: 0
            };

            // Send the first image
            await sock.sendMessage(m.chat, {
                image: {
                    url: images[0].url
                },
                caption: `${images[0].caption}\n\n*Hasil pencarian untuk:* "${query}"\n*Image:* 1/${images.length}\n\nKetik *${prefix}next* untuk melihat gambar selanjutnya`,
            }, {
                quoted: m
            });

        } catch (error) {
            console.error("Error pada fitur pinterest:", error);

            let errorMsg = 'Terjadi kesalahan saat mencari gambar.';

            if (error.response) {
                if (error.response.status === 404) {
                    errorMsg = 'Pinterest API tidak dapat diakses. Silakan coba lagi nanti.';
                } else {
                    errorMsg = 'Gagal mengambil data dari Pinterest. Silakan coba lagi.';
                }
            } else if (error.code === 'ENOTFOUND') {
                errorMsg = 'Gagal mengakses server. Periksa koneksi internet Anda.';
            }

            await m.reply(errorMsg);
        }
    }
};

handler.command = ['pinterest', 'pin', 'next'];
handler.tags = ['search'];

module.exports = handler;