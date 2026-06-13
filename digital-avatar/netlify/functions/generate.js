const crypto = require("crypto");
const fetch = require("node-fetch");

function buildAuth(apiKey, apiSecret, host, path) {

```
const date = new Date().toUTCString();

const signatureOrigin =
    `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;

const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signatureOrigin)
    .digest("base64");

const authorization =
    `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

return {
    authorization,
    date
};
```

}

exports.handler = async function (event) {

```
try {

    const { k1, k2, k3 } =
        JSON.parse(event.body);

    const keywords =
        `${k1} ${k2} ${k3}`;

    // ==========================
    // QWEN
    // ==========================

    const qwenRes = await fetch(
        "https://maas-api.cn-huabei-1.xf-yun.com/v2/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization":
                    `Bearer ${process.env.QWEN_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.QWEN_MODEL_ID,
                messages: [
                    {
                        role: "system",
                        content:
                            "You must only respond with a standard JSON object. Do not converse."
                    },
                    {
                        role: "user",
                        content: `
```

Return ONLY valid JSON:

{
"poem":"中文七言律诗",
"poem_en":"English poem",
"prompt":"Cyberpunk full body digital human prompt"
}

Keywords:
${keywords}
`
}
],
response_format: {
type: "json_object"
},
temperature: 0.3
})
}
);

```
    const qwenData =
        await qwenRes.json();

    console.log(
        "QWEN RAW:",
        JSON.stringify(qwenData)
    );

    if (
        !qwenData.choices ||
        !qwenData.choices.length
    ) {

        return {
            statusCode: 500,
            body: JSON.stringify({
                error:
                    "Invalid Qwen response",
                raw: qwenData
            })
        };
    }

    const result =
        JSON.parse(
            qwenData.choices[0]
                .message.content
        );

    // ==========================
    // IMAGE
    // ==========================

    const host =
        "maas-api.cn-huabei-1.xf-yun.com";

    const path =
        "/v2.1/tti";

    const auth =
        buildAuth(
            process.env.IMAGE_API_KEY,
            process.env.IMAGE_API_SECRET,
            host,
            path
        );

    const imgRes = await fetch(
        `https://${host}${path}`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
                Host: host,
                Date: auth.date,
                Authorization:
                    auth.authorization
            },
            body: JSON.stringify({
                header: {
                    app_id:
                        process.env.IMAGE_APP_ID,
                    uid: "123",
                    patch_id: []
                },
                parameter: {
                    chat: {
                        domain:
                            process.env.IMAGE_MODEL_ID,
                        width: 768,
                        height: 1024
                    }
                },
                payload: {
                    message: {
                        text: [
                            {
                                role: "user",
                                content:
                                    String(
                                        result.prompt
                                    )
                            }
                        ]
                    }
                }
            })
        }
    );

    const imgData =
        await imgRes.json();

    console.log(
        "IMAGE RAW:",
        JSON.stringify(imgData)
    );

    let base64 = null;

    try {

        const payload =
            imgData.payload || {};

        const choices =
            payload.choices;

        if (
            choices &&
            typeof choices ===
                "object" &&
            !Array.isArray(
                choices
            )
        ) {

            base64 =
                choices.text?.[0]
                    ?.content ||
                null;
        }

        if (
            Array.isArray(
                choices
            )
        ) {

            base64 =
                choices[0]
                    ?.text?.[0]
                    ?.content ||
                null;
        }

    } catch (e) {
        base64 = null;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            poem: result.poem,
            poem_en:
                result.poem_en,
            image: base64
        })
    };

} catch (err) {

    console.error(err);

    return {
        statusCode: 500,
        body: JSON.stringify({
            error:
                err.toString(),
            stack:
                err.stack
        })
    };
}
```

};
