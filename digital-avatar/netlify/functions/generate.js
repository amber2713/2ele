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

        // ===== Qwen3 =====
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
                          "poem": "严格输出【中文】七言律诗",
                          "poem_en": "前面中文诗的【英文】翻译诗",
                          "prompt": "赛博风格全身数字人英文绘画prompt"
                        }
                        
                        关键词：${keywords}
`
                }],
                response_format: { type: "json_object" }
            })
        });

        const qwenData = await qwenRes.json();
        const result = JSON.parse(qwenData.choices[0].message.content);

        // ===== Image =====
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
                
                // ===== 强力容错（关键）=====
                let base64 = null;
                
                try {
                    base64 =
                        imgData?.payload?.choices?.text?.[0]?.content ||
                        imgData?.payload?.choices?.[0]?.text?.[0]?.content ||
                        null;
                } catch (e) {
                    base64 = null;
                }
                
                if (!base64) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            poem: result.poem,
                            poem_en: result.poem_en,
                            image: null,
                            error: "Image generation unstable",
                            raw: imgData
                        })
                    };
                }

        return {
            statusCode: 200,
            body: JSON.stringify({
                poem: result.poem,
                poem_en: result.poem_en,
                image: base64
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.toString() })
        };
    }
};
