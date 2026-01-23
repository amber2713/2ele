exports.handler = async function (event) {
  const { k1, k2, k3 } = JSON.parse(event.body);
  const keywords = `${k1}, ${k2}, ${k3}`;

  const API_KEY = process.env.SILICON_API_KEY;

  // ---------- 第一步：用 DeepSeek 改进提示词 ----------
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
        content: `将这三个关键词扩展成用于生成 cyberpunk 风格全身数字人的英文绘画提示词：${keywords}`
      }],
      temperature: 0.7
    })
  });

  const promptData = await promptRes.json();
  const finalPrompt = promptData.choices[0].message.content;

  // ---------- 第二步：生成图片 ----------
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

  const imgData = await imgRes.json();
  const imageUrl = imgData.images[0].url;

  // ---------- 第三步：生成中文律诗 ----------
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

  const poemData = await poemRes.json();
  const poem = poemData.choices[0].message.content;

  // ---------- 第四步：翻译成英文 ----------
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

  const transData = await transRes.json();
  const poem_en = transData.choices[0].message.content;

  return {
    statusCode: 200,
    body: JSON.stringify({
      image: imageUrl,
      poem,
      poem_en
    })
  };
};
