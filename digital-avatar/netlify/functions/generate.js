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
                        你需要按步骤完成任务：
                        
                        步骤1：
                        先根据关键词写一首【中文七言绝句】。
                        
                        步骤2：
                        把这首中文诗翻译成自然流畅的英文，不要再创作，只做翻译。
                        
                        步骤3：
                        把关键词润色成一个【赛博风格、全身数字人、英文绘画prompt】。
                        
                        最后，严格按下面JSON格式输出，不要添加任何解释：
                        
                        {
                          "poem": "步骤1写的中文七言绝句",
                          "poem_en": "步骤2的英文翻译",
                          "prompt": "步骤3的英文prompt"
                        }
                        
                        关键词：${keywords}
                        `
                        }],
response_format: { type: "json_object" }
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
