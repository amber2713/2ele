const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization" } };
  }

  try {
    const { keywords } = JSON.parse(event.body);
    const apiKey = process.env.SILICON_API_KEY;
    const baseUrl = "https://api.siliconflow.cn/v1";

    // 1. 调用语言模型优化提示词和生成诗句 [cite: 134, 140]
    const dsResponse = await axios.post(`${baseUrl}/chat/completions`, {
      model: "deepseek-ai/DeepSeek-V3", 
      messages: [
        { role: "system", content: "You are a professional prompt engineer and poet. Based on 3 keywords, provide: 1. A detailed English prompt for a full-body cyberpunk character (under 100 words). 2. A Chinese poem. 3. English translation of the poem. Return ONLY JSON: {\"prompt\":\"...\", \"poem\":\"...\", \"translation\":\"...\"}" },
        { role: "user", content: `Keywords: ${keywords.join(', ')}` }
      ],
      response_format: { type: "json_object" }
    }, { headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" } });

    const content = JSON.parse(dsResponse.data.choices[0].message.content);

    // 2. 创建图片生成请求 [cite: 2, 9]
    const imgResponse = await axios.post(`${baseUrl}/images/generations`, {
      model: "Kwai-Kolors/Kolors", [cite: 61]
      prompt: `(full body shot), cyberpunk digital human, 3D render, ${content.prompt}`, [cite: 29]
      image_size: "720x1440", [cite: 39, 47]
      num_inference_steps: 25, [cite: 68, 70]
      guidance_scale: 7.5 [cite: 74, 76]
    }, { headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" } });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        imageUrl: imgResponse.data.images[0].url, [cite: 3, 123]
        poem: content.poem,
        translation: content.translation
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
