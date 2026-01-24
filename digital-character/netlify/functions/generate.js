const axios = require('axios');

exports.handler = async (event) => {
    // 处理跨域预检
    if (event.httpMethod === "OPTIONS") {
        return { 
            statusCode: 200, 
            headers: { 
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Headers": "Content-Type, Authorization" 
            } 
        };
    }

    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { keywords } = JSON.parse(event.body);
        
        // 从环境变量获取配置，保护 API Key 安全
        const apiKey = process.env.QWEN_API_KEY; 
        const baseUrl = process.env.QWEN_BASE_URL;
        const modelId = process.env.QWEN_MODEL_ID;

        // 1. 请求 Qwen 模型生成提示词和诗歌
        const response = await axios.post(`${baseUrl}/chat/completions`, {
            model: modelId,
            messages: [
                { 
                    role: "system", 
                    content: "你是一个赛博风格设计师。根据用户提供的3个关键词，生成：1.一段详细的英文提示词，用于生成赛博朋克风格数字人全身照；2.一首关于该角色的中文律诗；3.诗的英文翻译。请严格以JSON格式返回，不要包含markdown代码块：{\"imgP\":\"...\", \"poem\":\"...\", \"trans\":\"...\"}" 
                },
                { role: "user", content: `关键词：${keywords.join(', ')}` }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        }, {
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
        });

        // 2. 解析 Qwen 返回的 JSON
        const data = JSON.parse(response.data.choices[0].message.content);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Error:", error.message);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Qwen模型调用失败", details: error.message }) 
        };
    }
};
