// 全局变量
let useStream = true;
let conversationHistory = [];
const API_URL = '/.netlify/functions/chat'; // 调用后端接口路径

// DOM元素
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const streamBtn = document.getElementById('streamBtn');
const clearBtn = document.getElementById('clearBtn');

// 初始化对话历史
async function initConversation() {
    conversationHistory = [];
}

// 切换流式/非流式模式
streamBtn.addEventListener('click', () => {
    useStream = !useStream;
    streamBtn.textContent = useStream ? '流式输出' : '非流式输出';
    streamBtn.classList.toggle('active');
    showMessage('系统提示', `已切换到${useStream ? '流式' : '非流式'}输出模式`, 'system');
});

// 清空聊天历史
clearBtn.addEventListener('click', () => {
    chatContainer.innerHTML = '';
    initConversation();
    showMessage('系统提示', '聊天历史已清空，AI身份设定保留', 'system');
});

// 发送按钮点击事件
sendBtn.addEventListener('click', sendMessage);

// 输入框回车事件
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// 发送消息函数
async function sendMessage() {
    const content = userInput.value.trim();
    if (!content) return;

    // 处理退出命令
    if (content.toLowerCase() === '退出') {
        showMessage('系统提示', '对话结束，再见！', 'system');
        userInput.disabled = true;
        sendBtn.disabled = true;
        return;
    }

    // 清空输入框
    userInput.value = '';

    // 显示用户消息
    showMessage('你', content, 'user');

    // 添加到对话历史
    conversationHistory.push({ role: 'user', content });

    // 显示助手正在回复
    const assistantMessageElement = showMessage('钱学森AI', '', 'assistant', true);

    try {
        if (useStream) {
            // 流式请求
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory, useStream: true }),
            });

            if (!response.ok) throw new Error(`HTTP错误！状态码：${response.status}`);

            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                fullContent += chunk;
                assistantMessageElement.querySelector('.content').textContent = fullContent;
            }

            // 添加到对话历史
            conversationHistory.push({ role: 'assistant', content: fullContent });

        } else {
            // 非流式请求
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory, useStream: false }),
            });

            if (!response.ok) throw new Error(`HTTP错误！状态码：${response.status}`);

            const data = await response.json();
            const content = data.content;

            // 更新助手消息
            assistantMessageElement.querySelector('.content').textContent = content;
            conversationHistory.push({ role: 'assistant', content });
        }

    } catch (error) {
        assistantMessageElement.querySelector('.content').textContent = `出错了：${error.message}`;
        console.error('发送消息失败：', error);
    }
}

// 显示消息函数
function showMessage(role, content, type, isStreaming = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;

    const roleElement = document.createElement('span');
    roleElement.className = 'role';
    roleElement.textContent = role + '：';

    const contentElement = document.createElement('span');
    contentElement.className = 'content';
    contentElement.textContent = content || (isStreaming ? '正在思考...' : '');

    if (isStreaming) contentElement.classList.add('streaming');

    messageElement.appendChild(roleElement);
    messageElement.appendChild(contentElement);

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight; // 滚动到底部

    return messageElement;
}

// 页面加载时初始化
window.addEventListener('load', initConversation);