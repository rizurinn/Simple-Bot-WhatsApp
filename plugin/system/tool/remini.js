const { getSizeMedia } = require('../../../lib/function')

let handler = async (m, { sock, quoted, Uploader, scraper, text }) => {

        /**
         * Contoh penggunaaan
         */
        if (!/image/.test(quoted.msg.mimetype) || !quoted.isMedia)
            m.reply(`> Reply/Kirim photo yang mau di jernihkan`)
        try {
            const media = await quoted.download()
            const IMAGE = await Uploader.tmpfiles(media);
            const SETTINGS = {
                face_enhance: {
                    model: "remini"
                },
                background_enhance: {
                    model: "rhino-tensorrt"
                },
                bokeh: {
                    aperture_radius: "0",
                    highlights: "0.20",
                    vivid: "0.75",
                    group_picture: "true",
                    rescale_kernel_for_small_images: "true",
                    apply_front_bokeh: "false"
                },
                jpeg_quality: 90
            }
            const result = await scraper.remini(IMAGE, SETTINGS); // Buffer atau Foto
            const Ukuran = await getSizeMedia(result.no_wm)
            sock.sendMessage(m.chat, {
                image: {
                    url: result.no_wm
                },
                caption: `📷 Photo Remini\n> • 📁 *Size: ${Ukuran}*`
            }, {
                quoted: m
            })
        } catch (e) {
            console.log(e)
            m.reply('maaf terjadi error: ' + e)
        }
    }

handler.tags = "tool"
handler.command = ["remini", "hd"]

module.exports = handler