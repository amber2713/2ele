async function generate(){
    const loader = document.getElementById("loader");
    const poemDisplay = document.getElementById("poemDisplay");
    loader.classList.remove("hidden");

    try {
        const res = await fetch("/.netlify/functions/generate", {
            method:"POST",
            body: JSON.stringify({
                k1: k1.value,
                k2: k2.value,
                k3: k3.value
            })
        });

        const data = await res.json();
        loader.classList.add("hidden");

        if(!res.ok || !data.image){
            alert("生成失败");
            return;
        }

        // 渲染图片
        img.src = "data:image/png;base64," + data.image;

        // 核心修改：处理中英文并生成对齐行
        renderAlignedPoem(data.poem, data.poem_en);

    } catch (error) {
        loader.classList.add("hidden");
        alert("请求出错");
    }
}

function renderAlignedPoem(zhRaw, enRaw) {
    const container = document.getElementById("poemDisplay");
    container.innerHTML = ""; // 清空旧内容

    // 格式化函数：将标点替换为换行并拆分为数组
    const splitText = (text, isEn) => {
        let formatted = isEn 
            ? text.replace(/, /g, ",\n").replace(/\. /g, ".\n")
            : text.replace(/，/g, "，\n").replace(/。/g, "。\n");
        
        return formatted.split('\n').map(s => s.trim()).filter(s => s !== "");
    };

    const zhLines = splitText(zhRaw, false);
    const enLines = splitText(enRaw, true);

    // 以行数较多者为准（通常建议 AI 返回行数一致）
    const maxLines = Math.max(zhLines.length, enLines.length);

    for (let i = 0; i < maxLines; i++) {
        const row = document.createElement("div");
        row.className = "poem-row";

        const zhDiv = document.createElement("div");
        zhDiv.className = "zh-line";
        zhDiv.textContent = zhLines[i] || "";

        const enDiv = document.createElement("div");
        enDiv.className = "en-line";
        enDiv.textContent = enLines[i] || "";

        row.appendChild(zhDiv);
        row.appendChild(enDiv);
        container.appendChild(row);
    }
}

// ===== 背景粒子动画 (保持不变) =====
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dots = Array.from({length:80}, ()=>({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*2+1,
    dx:Math.random()-0.5,
    dy:Math.random()-0.5
}));

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    dots.forEach(d=>{
        d.x+=d.dx;
        d.y+=d.dy;
        if(d.x<0||d.x>canvas.width)d.dx*=-1;
        if(d.y<0||d.y>canvas.height)d.dy*=-1;
        ctx.beginPath();
        ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle="#f5deb3";
        ctx.fill();
    });
    requestAnimationFrame(animate);
}
animate();
