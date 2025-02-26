const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const { getMovieRecommendations } = require("./services/movieService");
const { extractMovieQuery } = require('./services/openaiService');
const { sendWhatsAppMessage } = require('./services/whatsappService');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// 🤖 Function to handle user message
async function handleUserMessage(userMessage, phoneNumber) {
    const queryData = await extractMovieQuery(userMessage);
    
    if (!queryData) {
        return sendWhatsAppMessage(phoneNumber, "Sorry, I couldn't understand your request.");
    }

    const recommendations = await getMovieRecommendations(queryData);
    
    if (recommendations.length === 0) {
        return sendWhatsAppMessage(phoneNumber, "Sorry, I couldn't find any movies matching your request.");
    }

    const { genre, actors, actor, year } = queryData;
    console.log(queryData);

    // Construct dynamic response message
    let responseText = "Here are a few recommendations";
    
    if (genre) {
        responseText = `${responseText} for a ${Array.isArray(genre) ? genre.join(" / ") : genre} movie`;
    }

    if (actors || actor) {
        responseText = `${responseText} featuring ${Array.isArray(actors) ? actors.join(", ") : Array.isArray(actor) ? actor.join(", ") : actor}`;
    }
    
    if (year) {
        responseText = `${responseText} released in ${year}`;
    } 
    
    // Append movie list
    responseText += ':\n';
    responseText += recommendations.map(movie => `- ${movie.title} (${movie.release_date.split("-")[0]})`).join("\n");

    // Send the response to the user
    sendWhatsAppMessage(phoneNumber, responseText);
}

// 🌐 Webhook verification for WhatsApp API
app.get("/webhook", (req, res) => {
    if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
        res.send(req.query["hub.challenge"]);
    } else {
        res.sendStatus(403);
    }
});

// 📩 Webhook to handle incoming messages
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (message) {
            const userMessage = message.text.body;
            const phoneNumber = message.from;
            console.log(`Received message: ${userMessage} from ${phoneNumber}`);
            await handleUserMessage(userMessage, phoneNumber);
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// 🚀 Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
