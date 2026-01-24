const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { keywords } = JSON.parse(event.body);
        // 从您的截图中提取的信息
        const apiKey = "sk-qiXqtAil5QEGrK0bD90e79Af68724a75824dFd286b5b91F5"; 
        const baseUrl = "https://maas-api.cn-huabei-1.xf-yun.com/v1";
        const modelId = "xop3qwen1b7";

        // 1. 调用您的 Qwen 模型生成提示词和诗歌
        const response = await axios.post(`${baseUrl}/chat/completions`, {
            model: modelId,
            messages: [
                { 
                    role: "system", 
                    content: "你是一个赛博设计师。根据3个关键词，生成：1.一段详细的赛博朋克风格数字人全身照英文描述；2.一首关于该角色的中文律诗；3.诗的英文翻译。请务必只返回JSON格式：{\"imgP\":\"...\", \"poem\":\"...\", \"trans\":\"...\"}" 
                },
                { role: "user", content: `关键词：${keywords.join(', ')}` }
            ],
            temperature: 0.7, // 保持一定的随机性 [cite: 773, 822]
            response_format: { type: "json_object" } // 强制输出 JSON [cite: 838]
        }, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });

        // 解析模型返回的内容 [cite: 924]
        const content = JSON.parse(response.data.choices[0].message.content);

        return {
            statusCode: 200,
            body: JSON.stringify(content)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
