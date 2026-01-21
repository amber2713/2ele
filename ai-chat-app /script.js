async function sendMessage(userInput) {
  const res = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        { role: "user", content: userInput }
      ],
    }),
  });

  if (!res.ok) {
    throw new Error("请求失败：" + res.status);
  }

  const data = await res.json();
  return data.content;
}
