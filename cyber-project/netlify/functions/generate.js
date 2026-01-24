const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    const { prompts } = JSON.parse(event.body);
    const API_KEY = process.env.SPARK_API_KEY; 
    const APPID = process.env.SPARK_APPID;

    try {
        // --- 第一步：调用语言模型 (模型 ID: xop3qwen1b7) ---
        // 使用 OpenAI 兼容格式接口 [cite: 18, 28]
        const textRes = await axios.post('https://maas-api.cn-huabei-1.xf-yun.com/v2/chat/completions', {
            model: "xop3qwen1b7", // 截图 1 中的语言模型 ID
            messages: [
                { role: "system", content: "You are a cyberpunk AI. Always reply in JSON format." },
                { role: "user", content: `Inputs: ${prompts.join(', ')}. 
                  Generate: 1. A short English poem. 2. A Chinese translation. 3. A detailed image prompt for a FULL BODY SHOT of a cyberpunk character. 
                  JSON format: {"en":"", "zh":"", "img_p":""}` }
            ],
            response_format: { type: "json_object" } // 文档提到支持 JSON Mode [cite: 70, 97]
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
        });

        // 解析语言模型生成的 JSON 数据 [cite: 52, 121]
        const sparkResponse = JSON.parse(textRes.data.choices[0].message.content);

        // --- 第二步：调用文生图模型 (模型 ID: xopqwentti20b) ---
        // 使用 TTI 专用接口 [cite: 190, 277]
        const imageRes = await axios.post('https://maas-api.cn-huabei-1.xf-yun.com/v2.1/tti', {
            header: { 
                app_id: APPID // 对应截图 2 中的 APPID [cite: 198, 285]
            },
            parameter: {
                chat: {
                    domain: "xopqwentti20b", // 截图 2 中的文生图模型 ID [cite: 204, 291]
                    width: 768, 
                    height: 1024 // 设定为全身照比例 [cite: 228, 315]
                }
            },
            payload: {
                message: {
                    text: [{ role: "user", content: sparkResponse.img_p }] // 使用语言模型生成的指令 [cite: 216, 303]
                }
            }
        }, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        // 获取图片 Base64 结果 [cite: 247, 334]
        const base64Image = imageRes.data.payload.choices.text[0].content;

        return {
            statusCode: 200,
            body: JSON.stringify({
                poemEn: sparkResponse.en,
                poemZh: sparkResponse.zh,
                image: base64Image // 前端直接显示 Base64
            })
        };

    } catch (err) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Neural link failed", details: err.message }) 
        };
    }
};
