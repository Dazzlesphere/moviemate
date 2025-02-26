const axios = require("axios");
const { OPENAI_API_KEY } = require('../config');

// 🎭 Function to extract user intent using OpenAI
async function extractMovieQuery(userMessage) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Extract movie recommendation criteria (genre, actor, year) from user query and return JSON format." },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.3
            },
            {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" }
            }
        );

        const extractedData = JSON.parse(response.data.choices[0].message.content);
        return extractedData; // { genre: "Horror", actor: "Jim Carrey", year: "2025" }
    } catch (error) {
        console.error("OpenAI API Error:", error.message);
        return null;
    }
}

module.exports = { extractMovieQuery }