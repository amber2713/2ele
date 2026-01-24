const crypto = require("crypto");
const fetch = require("node-fetch");

// ===== HMAC 仅给 Image 用 =====
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

        // ===== 第一步：Qwen3（Bearer，干净请求头）=====
        const qwenRes = await fetch("https://maas-api.cn-huabei-1.xf-yun.com/v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.QWEN_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.QWEN_MODEL_ID,
                messages: [{
                    role: "user",
                    content: `用关键词 ${keywords} 写七言绝句、英文翻译，并润色为赛博风格全身数字人prompt。JSON输出 poem, poem_en, prompt`
                }],
                response_format: { type: "json_object" }
            })
        });

        const qwenData = await qwenRes.json();
        console.log("QWEN RAW:", JSON.stringify(qwenData));

        const content = qwenData.payload.choices.text[0].content;
        const result = JSON.parse(content);
        // ===== 第二步：Image（HMAC）=====
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
                Host: host,
                Date: auth.date,
                Authorization: auth.authorization,
            },
            body: JSON.stringify({
                header: {
                    app_id: process.env.IMAGE_APP_ID,
                    uid: "123"
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
                        text: [{ role: "user", content: result.prompt }]
                    }
                }
            })
        });

        const imgData = await imgRes.json();
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
