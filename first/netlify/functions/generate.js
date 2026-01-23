const axios = require('axios');

exports.handler = async (event) => {
  // 预检请求处理
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } };
  }

  try {
    const { keywords } = JSON.parse(event.body);
    const apiKey = process.env.SILICON_API_KEY;
    const baseUrl = "https://api.siliconflow.cn/v1";

    // 1. 调用 DeepSeek 模型优化提示词并生成诗句 [cite: 134, 153]
    const dsResponse = await axios.post(`${baseUrl}/chat/completions`, {
      model: "deepseek-ai/DeepSeek-V3", 
      messages: [
        { role: "system", content: "你是一个专业的AI指令专家和诗人。请根据3个关键词生成：1. 适合Kolors模型的英文全身人像描述(100字内)；2. 一首中文律诗；3. 诗的英文翻译。请严格以JSON格式返回：{\"prompt\":\"...\", \"poem\":\"...\", \"translation\":\"...\"}" },
        { role: "user", content: `关键词：${keywords.join(', ')}` }
      ],
      response_format: { type: "json_object" }
    }, { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } });

    const content = JSON.parse(dsResponse.data.choices[0].message.content);

    // 2. 调用图片生成 API [cite: 5, 9, 20]
    const imgResponse = await axios.post(`${baseUrl}/images/generations`, {
      model: "Kwai-Kolors/Kolors", // 指定模型 [cite: 61]
      prompt: `(full body shot), cyberpunk style, digital character, ${content.prompt}`, // 拼接关键词 [cite: 29]
      image_size: "720x1440", // 文档支持的 1:2 比例 [cite: 47]
      num_inference_steps: 25, // 推理步数 [cite: 68]
      guidance_scale: 7.5 // 引导规模 [cite: 74, 76]
    }, { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: imgResponse.data.images[0].url, // 返回图片链接 [cite: 3]
        poem: content.poem,
        translation: content.translation
      })
    };
  } catch (error) {
    console.error("Error details:", error.response ? error.response.data : error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "生成失败，请检查 API Key 或网络", details: error.message }) 
    };
  }
};
