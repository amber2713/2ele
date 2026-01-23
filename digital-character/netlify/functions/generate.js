const fetch = require("node-fetch");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: "Function is alive. Please POST."
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { k1, k2, k3 } = body;

    if (!k1 || !k2 || !k3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing keywords" })
      };
    }

    const keywords = `${k1}, ${k2}, ${k3}`;
    const API_KEY = process.env.SILICON_API_KEY;

    // ===== 通用函数：调用 Qwen =====
    async function callQwen(prompt) {
      const res = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2-7B-Instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

      const json = await res.json();
      if (!json.choices) {
        throw new Error(JSON.stringify(json));
      }
      return json.choices[0].message.content;
    }

    // ========= 1. 优化绘画 Prompt =========
    const finalPrompt = await callQwen(
      `将这三个关键词扩展成用于生成 cyberpunk 风格、全身、数字人的英文绘画提示词：${keywords}`
    );

    // ========= 2. Kolors 生成图片 =========
    const imgRes = await fetch("https://api.siliconflow.cn/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Kwai-Kolors/Kolors",
        prompt: finalPrompt,
        image_size: "1024x1024",
        guidance_scale: 8,
        num_inference_steps: 30
      })
    });

    const imgJson = await imgRes.json();
    if (!imgJson.images) {
      throw new Error("Image error: " + JSON.stringify(imgJson));
    }

    // ⚠️ 硅基流动返回字段是 image 不是 url
    const imageUrl = imgJson.images[0].image;

    // ========= 3. 中文七言律诗 =========
    const poem = await callQwen(
      `根据这三个关键词写一首七言律诗：${keywords}`
    );

    // ========= 4. 英文翻译 =========
    const poem_en = await callQwen(
      `把这首中文诗翻译成英文诗：\n${poem}`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        image: imageUrl,
        poem,
        poem_en
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
