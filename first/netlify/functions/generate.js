const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { keywords } = JSON.parse(event.body);
    const apiKey = process.env.SILICON_API_KEY;
    const baseUrl = "https://api.siliconflow.cn/v1";

    // 1. 调用 DeepSeek 优化提示词并生成诗句 [cite: 134, 135]
    // 换成文档中提到的基础模型 ID，确保稳定性
    const dsResponse = await axios.post(`${baseUrl}/chat/completions`, {
      model: "deepseek-ai/DeepSeek-V3", 
      messages: [
        { role: "system", content: "你是一个专业的角色设计师和诗人。请根据关键词生成：1.一段详细的英文提示词，用于生成cyber风格数字人全身照；2.一首关于该角色的中文律诗；3.诗的英文翻译。请严格以JSON格式返回：{\"prompt\":\"...\", \"poem\":\"...\", \"translation\":\"...\"}" },
        { role: "user", content: `关键词：${keywords.join(', ')}` }
      ],
      response_format: { type: "json_object" } // 强制要求 JSON 返回
    }, { headers: { "Authorization": `Bearer ${apiKey}` } }); // 必须包含 Bearer [cite: 147]

    const { prompt, poem, translation } = JSON.parse(dsResponse.data.choices[0].message.content);

    // 2. 调用图片生成 API [cite: 2, 9]
    const imgResponse = await axios.post(`${baseUrl}/images/generations`, {
      model: "Kwai-Kolors/Kolors", // 文档明确支持的模型 [cite: 61]
      prompt: `(full body shot), cyberpunk style, ${prompt}`, // 增加全身照权重
      image_size: "720x1440", // 文档中 Kolor 模型支持的 1:2 比例 [cite: 47]
      num_inference_steps: 25, // 文档推荐范围 1-100 [cite: 72]
      guidance_scale: 7.5 // 文档默认值 [cite: 76, 81]
    }, { headers: { "Authorization": `Bearer ${apiKey}` } }); // 必须包含 Bearer [cite: 16]

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        imageUrl: imgResponse.data.images[0].url, // 返回生成的图片 URL [cite: 3]
        poem, 
        translation 
      })
    };
  } catch (error) {
    // 打印详细错误到 Netlify 日志，方便你调试
    console.error("API Error:", error.response ? error.response.data : error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "服务器内部错误", details: error.message }) 
    };
  }
};
