require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
    VERIFY_TOKEN: process.env.VERIFY_TOKEN,
};
