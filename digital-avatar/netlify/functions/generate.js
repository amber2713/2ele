const crypto = require("crypto");
const fetch = require("node-fetch");

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

async function xfPost(path, body) {
    const host = "maas-api.cn-huabei-1.xf-yun.com";
    const auth = buildAuth(
        process.env.XF_API_KEY,
        process.env.XF_API_SECRET,
        host,
        path
    );

    const res = await fetch(`https://${host}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Host: host,
            Date: auth.date,
            Authorization: auth.authorization,
        },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    console.log("XF RESPONSE:", text);
    return JSON.parse(text);
}

exports.handler = async function (event) {
    try {
        const { k1, k2, k3 } = JSON.parse(event.body);
        const keywords = `${k1} ${k2} ${k3}`;

        // ===== Qwen3（HMAC）=====
        const qwenData = await xfPost("/v2/chat/completions", {
            model: process.env.QWEN_MODEL_ID,
            messages: [{
                role: "user",
                content: `用关键词 ${keywords} 写七言绝句、英文翻译，并润色成赛博风格全身数字人prompt。JSON输出 poem, poem_en, prompt`
            }]
        });

        const result = JSON.parse(qwenData.choices[0].message.content);

        // ===== Image（HMAC）=====
        const imgData = await xfPost("/v2.1/tti", {
            header: {
                app_id: process.env.XF_APP_ID,
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
        });

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
