const axios = require('axios');

const stickerSearch = async (query) => {
    try {
        const response = await axios.get(`https://www.archive-ui.biz.id/api/search/stickerpack?query=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error('Error searching stickers:', error);
        return null;
    }
};

module.exports = stickerSearch