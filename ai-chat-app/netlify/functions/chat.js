const { OpenAI } = require("openai");

const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.API_BASE
});

const SYSTEM_PROMPT = process.env.AI_IDENTITY_PROMPT;

exports.handler = async (event) => {
    try {
        const { messages } = JSON.parse(event.body);

        const completion = await client.chat.completions.create({
            model: process.env.MODEL_ID,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 2048
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: completion.choices[0].message.content
            })
        };

    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
