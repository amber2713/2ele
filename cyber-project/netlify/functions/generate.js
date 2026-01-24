const axios = require('axios');

exports.handler = async (event) => {
    // 跨域处理与请求方法检查
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { prompts } = JSON.parse(event.body);

    // --- 1. 语言模型配置 (从环境变量读取) ---
    const TEXT_API_KEY = process.env.TEXT_API_KEY;
    const TEXT_API_URL = process.env.TEXT_API_URL; // 对应截图1的接口地址
    const TEXT_MODEL_ID = process.env.TEXT_MODEL_ID; // 对应截图1的 modelId

    // --- 2. 文生图模型配置 (从环境变量读取) ---
    const IMAGE_API_KEY = process.env.IMAGE_API_KEY;
    const IMAGE_APPID = process.env.IMAGE_APPID;
    const IMAGE_API_URL = process.env.IMAGE_API_URL; // 对应截图2/文档的地址
    const IMAGE_MODEL_ID = process.env.IMAGE_MODEL_ID; // 对应截图2的 modelId

    try {
        // 第一步：请求语言模型优化 Prompt 并写诗
        // 遵循文档中的 OpenAI 兼容格式
        const textRes = await axios.post(`${TEXT_API_URL}/chat/completions`, {
            model: TEXT_MODEL_ID,
            messages: [
                { 
                    role: "system", 
                    content: "You are a cyberpunk digital character creator. You must return result in valid JSON format only." 
                },
                { 
                    role: "user", 
                    content: `Keywords: ${prompts.join(', ')}. 
                    Requirement: 
                    1. Create a short English poem. 
                    2. Create a Chinese version of the poem. 
                    3. Write a highly detailed image prompt for a FULL BODY SHOT of a cyberpunk character based on the keywords.
                    JSON format: {"en_poem": "...", "zh_poem": "...", "image_prompt": "..."}` 
                }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: { 'Authorization': `Bearer ${TEXT_API_KEY}`, 'Content-Type': 'application/json' }
        });

        const sparkResult = JSON.parse(textRes.data.choices[0].message.content);

        // 第二步：请求文生图模型
        // 遵循星火图片生成 WebAPI 文档格式
        const imageRes = await axios.post(IMAGE_API_URL, {
            header: {
                app_id: IMAGE_APPID
            },
            parameter: {
                chat: {
                    domain: IMAGE_MODEL_ID,
                    width: 768,
                    height: 1024 // 设定长宽比以支持全身照
                }
            },
            payload: {
                message: {
                    text: [
                        { role: "user", content: sparkResult.image_prompt }
                    ]
                }
            }
        }, {
            headers: { 'Authorization': `Bearer ${IMAGE_API_KEY}` }
        });

        // 获取 Base64 图片数据
        const base64Image = imageRes.data.payload.choices.text[0].content;

        return {
            statusCode: 200,
            body: JSON.stringify({
                poemEn: sparkResult.en_poem,
                poemZh: sparkResult.zh_poem,
                image: base64Image
            })
        };

    } catch (error) {
        console.error("Chain Error:", error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Generation failed", details: error.message })
        };
    }
};
