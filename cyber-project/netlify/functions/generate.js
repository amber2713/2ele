const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    try {
        const { prompts } = JSON.parse(event.body);

        // --- 从 Netlify 读取环境变量 ---
        const TEXT_URL = process.env.TEXT_API_URL;
        const TEXT_KEY = process.env.TEXT_API_KEY;
        const TEXT_ID = process.env.TEXT_MODEL_ID;

        const IMAGE_URL = process.env.IMAGE_API_URL;
        const IMAGE_KEY = process.env.IMAGE_API_KEY;
        const IMAGE_ID = process.env.IMAGE_MODEL_ID;
        const APPID = process.env.IMAGE_APPID;

        // 1. 调用语言模型 (生成诗句和作图指令)
        const textRes = await axios.post(`${TEXT_URL}/chat/completions`, {
            model: TEXT_ID,
            messages: [{
                role: "user",
                content: `Keywords: ${prompts.join(',')}. Task: Write a 2-line cyberpunk poem in English and Chinese, and a prompt for a full-body character image. Return JSON: {"en":"", "zh":"", "img_p":""}`
            }],
            response_format: { type: "json_object" }
        }, {
            headers: { 
                'Authorization': `Bearer ${TEXT_KEY.trim()}`, // 使用 .trim() 防止多余空格导致 401
                'Content-Type': 'application/json' 
            }
        });

        const sparkResult = JSON.parse(textRes.data.choices[0].message.content);

        // 2. 调用文生图模型
        const imageRes = await axios.post(IMAGE_URL, {
            header: { app_id: APPID },
            parameter: {
                chat: { domain: IMAGE_ID, width: 720, height: 1280 } // 纵向比例更易生成全身照
            },
            payload: {
                message: { text: [{ role: "user", content: "Full body shot, cyberpunk style, " + sparkResult.img_p }] }
            }
        }, {
            headers: { 
                'Authorization': `Bearer ${IMAGE_KEY.trim()}`,
                'Content-Type': 'application/json'
            }
        });

        // 检查图片返回结果
        if (!imageRes.data.payload || !imageRes.data.payload.choices) {
            throw new Error(`Image API Error: ${imageRes.data.header?.message || 'Unknown'}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                poemEn: sparkResult.en,
                poemZh: sparkResult.zh,
                image: imageRes.data.payload.choices.text[0].content
            })
        };

    } catch (err) {
        // 将具体的错误信息传回前端，方便你调试
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Process Failed", 
                details: err.response ? JSON.stringify(err.response.data) : err.message 
            })
        };
    }
};
