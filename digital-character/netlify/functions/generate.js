const fetch = require("node-fetch");

exports.handler = async function (event) {
  // ✅ 防止浏览器直接访问导致崩溃
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

    // ========= 1. 用 DeepSeek 优化绘画 Prompt =========
    const promptRes = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages: [{
          role: "user",
          content: `将这三个关键词扩展成用于生成 cyberpunk 风格、全身、数字人的英文绘画提示词：${keywords}`
        }],
        temperature: 0.7
      })
    });

    const promptJson = await promptRes.json();
    if (!promptJson.choices) {
      throw new Error("Prompt generation failed: " + JSON.stringify(promptJson));
    }
    const finalPrompt = promptJson.choices[0].message.content;

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
      throw new Error("Image generation failed: " + JSON.stringify(imgJson));
    }

    const imageUrl = imgJson.images[0].url;

    // ========= 3. 中文七言律诗 =========
    const poemRes = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages: [{
          role: "user",
          content: `根据这三个关键词写一首七言律诗：${keywords}`
        }]
      })
    });

    const poemJson = await poemRes.json();
    if (!poemJson.choices) {
      throw new Error("Poem generation failed: " + JSON.stringify(poemJson));
    }
    const poem = poemJson.choices[0].message.content;

    // ========= 4. 翻译英文诗 =========
    const transRes = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        messages: [{
          role: "user",
          content: `把这首中文诗翻译成英文诗：\n${poem}`
        }]
      })
    });

    const transJson = await transRes.json();
    if (!transJson.choices) {
      throw new Error("Translation failed: " + JSON.stringify(transJson));
    }
    const poem_en = transJson.choices[0].message.content;

    // ========= 成功返回 =========
    return {
      statusCode: 200,
      body: JSON.stringify({
        image: imageUrl,
        poem,
        poem_en
      })
    };

  } catch (err) {
    // ❗所有错误都会返回到前端，而不是 502
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};
