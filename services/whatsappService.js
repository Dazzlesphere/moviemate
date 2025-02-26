const axios = require('axios');
const { WHATSAPP_ACCESS_TOKEN, PHONE_NUMBER_ID } = require('../config');

async function sendWhatsAppMessage(phoneNumber, message) {
    try {
        const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
        const response = await axios.post(url, {
            messaging_product: "whatsapp",
            to: phoneNumber,
            text: { body: message }
        }, { headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` } });

        console.log(`Message sent to ${phoneNumber}`);
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
    }
}

module.exports = { sendWhatsAppMessage }
