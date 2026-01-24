const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { 
            statusCode: 200, 
            headers: { 
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Headers": "Content-Type" 
            } 
        };
    }

    try {
        const { keywords } = JSON.parse(event.body);
        const apiKey = process.env.QWEN_API_KEY; 
        const baseUrl = process.env.QWEN_BASE_URL;
        const modelId = process.env.QWEN_MODEL_ID;

        const response = await axios.post(`${baseUrl}/chat/completions`, {
            model: modelId,
            messages: [
                { 
                    role: "system", 
                    content: "你是一个赛博设计师。根据关键词生成JSON：{\"imgP\":\"英文提示词\", \"poem\":\"中文律诗\", \"trans\":\"英文翻译\"}。不要返回多余文字。" 
                },
                { role: "user", content: `关键词：${keywords.join(', ')}` }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(JSON.parse(response.data.choices[0].message.content))
        };
    } catch (error) {
        console.error("Error Detail:", error.message);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "调用失败", details: error.message }) 
        };
    }
};
