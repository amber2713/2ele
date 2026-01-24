const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } };
    }

    try {
        const { keywords } = JSON.parse(event.body);
        
        // 使用环境变量，请确保在 Netlify 后台已配置
        const apiKey = process.env.QWEN_API_KEY; 
        const baseUrl = process.env.QWEN_BASE_URL;
        const modelId = process.env.QWEN_MODEL_ID;

        const response = await axios.post(`${baseUrl}/chat/completions`, {
            model: modelId,
            messages: [
                { 
                    role: "system", 
                    content: "你是一个赛博设计师。根据3个关键词生成：1.一段精妙的英文绘画提示词（全身人像）；2.一首五言或七言中文律诗；3.英文翻译。严格以JSON返回：{\"imgP\":\"...\", \"poem\":\"...\", \"trans\":\"...\"}" 
                },
                { role: "user", content: `关键词：${keywords.join(', ')}` }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });

        const content = JSON.parse(response.data.choices[0].message.content);
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(content)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
