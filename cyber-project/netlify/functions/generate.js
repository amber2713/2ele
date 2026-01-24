const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { prompts } = JSON.parse(event.body);

    // --- 环境变量命名区分 ---
    // 语言模型 (对应第一张图: random wander)
    const TEXT_API_KEY = process.env.TEXT_MODEL_API_KEY; 
    const TEXT_MODEL_ID = "xop3qwen1b7"; // 截图1中的 modelId [cite: 57]
    const TEXT_BASE_URL = "https://maas-api.cn-huabei-1.xf-yun.com/v1"; // 截图1中的接口地址 

    // 文生图模型 (对应第二张图: prompt)
    const IMAGE_APPID = process.env.IMAGE_MODEL_APPID;
    const IMAGE_API_KEY = process.env.IMAGE_MODEL_API_KEY;
    const IMAGE_MODEL_ID = "xopqwentti20b"; // 截图2中的 modelId [cite: 291]
    const IMAGE_BASE_URL = "https://maas-api.cn-huabei-1.xf-yun.com/v2.1/tti"; // 截图2和文档地址 [cite: 190, 277]

    try {
        // 1. 调用语言模型：优化 Prompt 并生成双语诗句
        const textResponse = await axios.post(`${TEXT_BASE_URL}/chat/completions`, {
            model: TEXT_MODEL_ID,
            messages: [
                { role: "system", content: "You are a cyberpunk digital character creator. Return ONLY JSON." },
                { role: "user", content: `Based on keywords: ${prompts.join(', ')}. 
                  Return JSON: {"en_poem":"...", "zh_poem":"...", "draw_prompt":"full body shot, cyberpunk style, [more details]"}` }
            ],
            // 强制要求输出 JSON 格式
            response_format: { "type": "json_object" } [cite: 70, 97]
        }, {
            headers: { 'Authorization': `Bearer ${TEXT_API_KEY}` } [cite: 18]
        });

        const resContent = JSON.parse(textResponse.data.choices[0].message.content);

        // 2. 调用文生图模型：传入语言模型生成的 draw_prompt
        const imageResponse = await axios.post(IMAGE_BASE_URL, {
            header: {
                app_id: IMAGE_APPID [cite: 198, 285]
            },
            parameter: {
                chat: {
                    domain: IMAGE_MODEL_ID, [cite: 204, 291]
                    width: 768,
                    height: 1024 // 设定为全身照比例 [cite: 228, 315]
                }
            },
            payload: {
                message: {
                    text: [{ role: "user", content: resContent.draw_prompt }] [cite: 216, 303]
                }
            }
        }, {
            headers: { 'Authorization': `Bearer ${IMAGE_API_KEY}` }
        });

        // 提取返回的 Base64 图片数据
        const base64Data = imageResponse.data.payload.choices.text[0].content; [cite: 247, 334]

        return {
            statusCode: 200,
            body: JSON.stringify({
                poemEn: resContent.en_poem,
                poemZh: resContent.zh_poem,
                image: base64Data
            })
        };

    } catch (error) {
        console.error(error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to link to Spark Neural Network." }) 
        };
    }
};
