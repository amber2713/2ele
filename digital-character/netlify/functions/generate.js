const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } };
    }

    try {
        const { keywords } = JSON.parse(event.body);
        
        // 请确保在 Netlify 后台配置了对应的三个变量
        const config = {
            apiKey: process.env.QWEN_API_KEY,
            baseUrl: process.env.QWEN_BASE_URL,
            model: process.env.QWEN_MODEL_ID
        };

        const response = await axios.post(`${config.baseUrl}/chat/completions`, {
            model: config.model,
            messages: [
                { 
                    role: "system", 
                    content: "你是一个赛博时代美学专家。根据用户关键词，生成一个赛博朋克风格的数字人形象。要求：1. 撰写一段精妙的英文绘画描述(提示词)；2. 创作一首七言中文律诗；3. 诗的英文翻译。请严格以JSON格式返回：{\"imgP\":\"...\", \"poem\":\"...\", \"trans\":\"...\"}" 
                },
                { role: "user", content: `关键词：${keywords.join(', ')}` }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: { "Authorization": `Bearer ${config.apiKey}` }
        });

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(JSON.parse(response.data.choices[0].message.content))
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
