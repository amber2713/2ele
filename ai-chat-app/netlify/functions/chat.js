import OpenAI from "openai";

export async function handler(event) {
  try {
    const { messages } = JSON.parse(event.body);

    const client = new OpenAI({
      apiKey: process.env.MAAS_API_KEY,
      baseURL: process.env.MAAS_API_BASE,
    });

    const response = await client.chat.completions.create({
      model: process.env.MAAS_MODEL_ID,
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
        lora_id: process.env.MAAS_LORA_ID,
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: response.choices[0].message.content,
      }),
    };
  } catch (err) {
    console.error("调用失败：", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
}
