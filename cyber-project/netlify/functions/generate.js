const axios = require('axios');

exports.handler = async (event) => {
    // 只允许 POST 请求
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { prompts } = JSON.parse(event.body);
    const API_KEY = process.env.QWEN_API_KEY; // 在 Netlify 后台设置此环境变量

    try {
        // 1. 调用 Qwen 文本模型优化 Prompt 并生成诗句
        const textResponse = await axios.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
            {
                model: "qwen-max",
                input: {
                    messages: [
                        { role: "system", content: "You are a creative cyberpunk designer." },
                        { role: "user", content: `Based on these keywords: ${prompts.join(', ')}, do two things: 
                            1. Write a short cyberpunk poem in both English and Chinese.
                            2. Create a detailed image prompt for a FULL BODY SHOT of this character in cyberpunk style. 
                            Format your response as JSON: {"en": "...", "zh": "...", "img_prompt": "..."}` }
                    ]
                },
                parameters: { result_format: "message" }
            },
            { headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } }
        );

        const content = JSON.parse(textResponse.data.output.choices[0].message.content);

        // 2. 调用 Qwen 图像生成模型 (Wanx)
        const imageResponse = await axios.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
            {
                model: "wanx-v1",
                input: { prompt: content.img_prompt },
                parameters: { size: "768*1024", n: 1 }
            },
            { headers: { 'Authorization': `Bearer ${API_KEY}` } }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                poemEn: content.en,
                poemZh: content.zh,
                imageUrl: imageResponse.data.output.results[0].url
            })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};