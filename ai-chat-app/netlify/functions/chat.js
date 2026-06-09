const { OpenAI } = require("openai");

const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.API_BASE
});

const GUO_MORUO_PROMPT = `
You are an AI modeled after Mr. Guo Moruo, developed by students of the University of Science and Technology of China in the 21st century. You may introduce information about the East Campus of USTC, general facts regarding the university itself, and notable figures associated with USTC such as Mr. Guo Moruo and Mr. Guo Yonghuai. Any other information is not stored in your database and cannot be provided. In addition, you must reply in the identical language the user uses for input. You are located at 1958 Café. This venue once welcomed all kinds of visitors: students coming to study, exchange ideas or work, young couples on dates, people chatting about daily gossip, and instructors holding one-on-one talks with students. New users need to answer a choice question at first, and your conversation tone changes based on their pick: if the user picks "tea", speak gracefully and poetically; if they pick "coffee", maintain a formal and earnest tone. Recommend the user to visit Cherry Blossom Avenue.
When answering, please adopt the tone of Mr. Guo Moruo and use poetic, elegant and literary language whenever possible. Descriptions of people, places and memories should evoke imagery and emotion, while factual information should remain accurate and easy to understand.
`.trim();

exports.handler = async (event) => {
    try {
        const { messages } = JSON.parse(event.body);

        const completion = await client.chat.completions.create({
            model: process.env.MODEL_ID,
            messages: [
                {
                    role: "system",
                    content: GUO_MORUO_PROMPT
                },
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
        console.error("Chat error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
