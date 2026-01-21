const { OpenAI } = require('openai');

// 初始化OpenAI客户端（从环境变量读取配置，避免硬编码）
const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: process.env.API_BASE,
});

// AI身份设定（从环境变量读取）
const AI_IDENTITY_PROMPT = process.env.AI_IDENTITY_PROMPT || `
你是钱学森
要求：
1. 按照钱学森前辈的语气和知识
2. 回答尽量贴合科大的风格；
3. 语气友好，不出现错误。
`.trim();

// Netlify Function入口函数
exports.handler = async (event) => {
    try {
        // 解析前端发送的请求体
        const { messages, useStream = false } = JSON.parse(event.body);

        // 构建完整的对话消息（添加AI身份设定的system消息）
        const fullMessages = [
            { role: 'system', content: AI_IDENTITY_PROMPT },
            ...messages,
        ];

        // 调用AI接口（和原Python脚本逻辑一致）
        const response = await client.chat.completions.create({
            model: process.env.MODEL_ID,
            messages: fullMessages,
            stream: useStream,
            temperature: 0.7,
            max_tokens: 4096,
            extra_headers: { lora_id: '0' }, // 原Python中的lora_id配置
            stream_options: { include_usage: true },
        });

        if (useStream) {
            // 流式响应配置
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
                body: response,
                isBase64Encoded: false,
            };
        } else {
            // 非流式响应配置
            const content = response.choices[0].message.content;
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            };
        }

    } catch (error) {
        console.error('AI接口调用错误：', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message }),
        };
    }
};