const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  const { keywords } = JSON.parse(event.body);
  const apiKey = process.env.SILICON_API_KEY; // 在 Netlify 后台设置此环境变量
  const baseUrl = "https://api.siliconflow.cn/v1";

  try {
    // --- 步骤 1: 调用 DeepSeek 生成绘图提示词和诗句 ---
    const dsResponse = await axios.post(`${baseUrl}/chat/completions`, {
      model: "deepseek-ai/DeepSeek-V3", // 文档中推荐的最新模型
      messages: [
        { role: "system", content: "你是一个专业的角色设计师和诗人。请根据用户提供的3个关键词，完成：1. 生成一段详细的英文提示词，用于生成cyber风格的数字人全身照，包含精细的服饰和背景。2. 创作一首关于该角色的中文律诗及其英文翻译。请以JSON格式返回：{ 'prompt': '...', 'poem': '...', 'translation': '...' }" },
        { role: "user", content: `关键词：${keywords.join(', ')}` }
      ],
      response_format: { type: "json_object" }
    }, { headers: { Authorization: `Bearer ${apiKey}` } });

    const { prompt, poem, translation } = JSON.parse(dsResponse.data.choices[0].message.content);

    // --- 步骤 2: 调用 Kolors 生成图片 ---
    const imgResponse = await axios.post(`${baseUrl}/images/generations`, {
      model: "Kwai-Kolors/Kolors", [cite: 61]
      prompt: `cyberpunk digital human, full body shot, ${prompt}`, [cite: 29]
      image_size: "720x1440", [cite: 47] // 针对全身照优化 1:2 比例
      num_inference_steps: 30, [cite: 68]
      guidance_scale: 8.5 [cite: 74]
    }, { headers: { Authorization: `Bearer ${apiKey}` } });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        imageUrl: imgResponse.data.images[0].url, [cite: 123]
        poem, 
        translation 
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
