const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } };
    }

    try {
        const { keywords } = JSON.parse(event.body);
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
                    content: "你是一个专业的赛博设计师。请根据关键词完成任务：1. 编写一段详细的英文绘图提示词(imgP)；2. 创作一首关于该角色的【中文七言律诗】(poem)；3. 诗句的英文翻译(trans)。请确保poem字段必须是中文。严格以JSON格式返回，不要有任何多余文字：{\"imgP\":\"...\", \"poem\":\"...\", \"trans\":\"...\"}" 
                },
                { role: "user", content: `关键词：${keywords.join(', ')}` }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: { "Authorization": `Bearer ${config.apiKey}` }
        });

        // 这里的逻辑：先解析模型返回的内容
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
