const axios = require('axios');

const downloadPinterest = async (url) => {
    try {
        const response = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`);
        return response.data;
    } catch (error) {
        console.error('Error downloading Pinterest content:', error);
        return null;
    }
};

module.exports = downloadPinterest