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

exports.handler = async function (event) {
    try {
        const { k1, k2, k3 } = JSON.parse(event.body);
        const keywords = `${k1} ${k2} ${k3}`;
        const host = "maas-api.cn-huabei-1.xf-yun.com";

        // ---------- 推理接口调用 ----------
        const path1 = "/v2";
        const auth1 = buildAuth(
            process.env.QWEN_API_KEY,
            process.env.IMAGE_API_SECRET,
            host,
            path1
        );

        const qwenRes = await fetch(`https://${host}${path1}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Host: host,
                Date: auth1.date,
                Authorization: auth1.authorization,
            },
            body: JSON.stringify({
                model: process.env.QWEN_MODEL_ID,
                messages: [
                    {
                        role: "user",
                        content: `用关键词 ${keywords} 写七言绝句、英文翻译，并润色成赛博风格全身数字人prompt。JSON输出 poem, poem_en, prompt`,
                    },
                ],
                response_format: { type: "json_object" },
            }),
        });

        const text1 = await qwenRes.text();
        console.log("QWEN RESPONSE:", text1);

        let qwenData;
        try {
            qwenData = JSON.parse(text1);
        } catch (e) {
            throw new Error("Failed to parse QWEN JSON: " + text1);
        }
        const result = JSON.parse(qwenData.choices[0].message.content);

        // ---------- 文生图接口调用 ----------
        const path2 = "/v2.1/tti";
        const auth2 = buildAuth(
            process.env.QWEN_API_KEY,
            process.env.IMAGE_API_SECRET,
            host,
            path2
        );

        const imgRes = await fetch(`https://${host}${path2}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Host: host,
                Date: auth2.date,
                Authorization: auth2.authorization,
            },
            body: JSON.stringify({
                header: {
                    app_id: process.env.IMAGE_APP_ID,
                    uid: "123",
                },
                parameter: {
                    chat: {
                        domain: process.env.IMAGE_MODEL_ID,
                        width: 768,
                        height: 1024,
                        seed: 42,
                        num_inference_steps: 20,
                        guidance_scale: 6,
                        scheduler: "Euler",
                    },
                },
                payload: {
                    message: {
                        text: [{ role: "user", content: result.prompt }],
                    },
                },
            }),
        });

        const text2 = await imgRes.text();
        console.log("IMAGE RESPONSE:", text2);

        let imgData;
        try {
            imgData = JSON.parse(text2);
        } catch (e) {
            throw new Error("Failed to parse Image JSON: " + text2);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                poem: result.poem,
                poem_en: result.poem_en,
                image: imgData.payload.choices.text[0].content,
            }),
        };

    } catch (err) {
        console.log("FINAL ERROR:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.toString() }),
        };
    }
};
