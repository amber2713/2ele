const crypto = require("crypto");
const fetch = require("node-fetch");

// ===== Image 用的 HMAC =====
function buildAuth(apiKey, apiSecret, host, path) {
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;

    const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(signatureOrigin)
        .digest("base64");

    const authorization = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

    return { authorization, date };
}

exports.handler = async function (event) {
    try {
        const { k1, k2, k3 } = JSON.parse(event.body);
        const keywords = `${k1} ${k2} ${k3}`;

        // =========================
        // Qwen3 —— 正确的 /v1 OpenAI 通道
        // =========================
        const qwenRes = await fetch("https://maas-api.cn-huabei-1.xf-yun.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.QWEN_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.QWEN_MODEL_ID,
                messages: [{
                    role: "user",
                    content: `
                        你必须严格按下面JSON格式输出：
                        
                        {
                          "poem": "一首中文七言绝句，只能是中文诗句",
                          "poem_en": "上面这首中文诗的英文翻译，不允许再写诗",
                          "prompt": "用于生成赛博风格全身数字人的英文绘画prompt,注意生成的人物形象需要时满足输入关键词的个人全身像"
                        }
                        
                        关键词：${keywords}
                        
                        要求：
                        - poem 必须是中文七言绝句
                        - poem_en 必须是对 poem 的英文翻译
                        - 不能输出除JSON外的任何内容
                        `
                }],
                response_format: { type: "json_object" }
            })
        });

        const qwenData = await qwenRes.json();
        console.log("QWEN RAW:", JSON.stringify(qwenData));

        const result = JSON.parse(qwenData.choices[0].message.content);

        // =========================
        // Image —— HMAC
        // =========================
        const host = "maas-api.cn-huabei-1.xf-yun.com";
        const path = "/v2.1/tti";

        const auth = buildAuth(
            process.env.IMAGE_API_KEY,
            process.env.IMAGE_API_SECRET,
            host,
            path
        );

        const imgRes = await fetch(`https://${host}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Host": host,
                "Date": auth.date,
                "Authorization": auth.authorization,
            },
            body: JSON.stringify({
                header: {
                            app_id: process.env.IMAGE_APP_ID,
                            uid: "123",
                            patch_id: []
                        },
                parameter: {
                    chat: {
                        domain: process.env.IMAGE_MODEL_ID,
                        width: 768,
                        height: 1024
                    }
                },
                payload: {
                    message: {
                        text: [{
                            role: "user",
                            content: typeof result.prompt === "string"
                                ? result.prompt
                                : JSON.stringify(result.prompt)
                        }]
                    }
                }
            })
        });

        const imgData = await imgRes.json();
        console.log("IMAGE RAW:", JSON.stringify(imgData));

        const base64 = imgData.payload.choices.text[0].content;

        return {
            statusCode: 200,
            body: JSON.stringify({
                poem: result.poem,
                poem_en: result.poem_en,
                image: base64
            })
        };

    } catch (err) {
        console.log("FINAL ERROR:", err);
        return {
            statusCode: 500,
            body: err.toString()
        };
    }
};
