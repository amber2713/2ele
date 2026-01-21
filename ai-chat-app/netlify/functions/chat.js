import OpenAI from "openai";

export async function handler(event) {
  try {
    const { messages } = JSON.parse(event.body);

    const client = new OpenAI({
      apiKey: process.env.API_KEY,      // 👈 对齐
      baseURL: process.env.API_BASE,    // 👈 对齐
    });

    const response = await client.chat.completions.create({
      model: process.env.MODEL_ID,      // 👈 对齐
      messages: [
        {
          role: "system",
          content: process.env.AI_IDENTITY_PROMPT,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: false,
      extra_headers: {
        lora_id: "0",                   // 👈 你截图里就是 0
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: response.choices[0].message.content,
      }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
}
