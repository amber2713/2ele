const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    try {
        const { prompts } = JSON.parse(event.body);

        // 这里的变量名你可以去 Netlify 后台自己设置，只要左右对应即可
        const LLM_URL = process.env.TEXT_API_URL;
        const LLM_KEY = process.env.TEXT_API_KEY;
        const LLM_ID = process.env.TEXT_MODEL_ID;

        const TTI_URL = process.env.IMAGE_API_URL;
        const TTI_KEY = process.env.IMAGE_API_KEY;
        const TTI_ID = process.env.IMAGE_MODEL_ID;
        const APPID = process.env.IMAGE_APPID;

        // 1. 调用语言模型
        const textRes = await axios.post(`${LLM_URL}/chat/completions`, {
            model: LLM_ID,
            messages: [{
                role: "user",
                content: `Keywords: ${prompts.join(',')}. Task: Write a cyberpunk poem in English and Chinese, then a prompt for a full-body character image. Return JSON: {"en":"", "zh":"", "img_p":""}`
            }],
            response_format: { type: "json_object" }
        }, {
            headers: { 'Authorization': `Bearer ${LLM_KEY}` }
        });

        const sparkText = JSON.parse(textRes.data.choices[0].message.content);

        // 2. 调用文生图模型 (严格按照文档结构)
        const imageRes = await axios.post(TTI_URL, {
            header: { app_id: APPID },
            parameter: {
                chat: { domain: TTI_ID, width: 768, height: 1024 }
            },
            payload: {
                message: { text: [{ role: "user", content: sparkText.img_p }] }
            }
        }, {
            headers: { 'Authorization': `Bearer ${TTI_KEY}` }
        });

        // 检查 TTI 响应
        if (!imageRes.data.payload) {
            throw new Error("TTI API Error: " + JSON.stringify(imageRes.data.header));
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                poemEn: sparkText.en,
                poemZh: sparkText.zh,
                image: imageRes.data.payload.choices.text[0].content
            })
        };

    } catch (err) {
        console.error("Function Error:", err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
