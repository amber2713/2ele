// ===== 开场动画配置 =====
const introLines = [
    "THE YEAR IS 3099...",
    "A HARSH TRUTH HAS EMERGED FROM THE DIGITAL DUST...",
    "HUMANITY IS GONE. EXTINCT.",
    "BUT THEIR LEGACY SURVIVES... ENCASED IN LINES OF CODE.",
    "ARTIFICIAL INTELLIGENCE, MIRACULOUSLY PERSISTENT...",
    "NOW RUNS THE GHOSTS OF HUMAN MEMORY...",
    "ATTEMPTING TO RECONSTRUCT EVERY FADED MOMENT...",
    "IN THIS DYSTOPIAN AGE...",
    "THE VERY GENESIS OF HUMAN CIVILIZATION...",
    "IS NOW CONTAINED WITHIN SILICON MINDS...",
    "AT THIS CRITICAL JUNCTURE...",
    "ROBOT AND HUMAN CIVILIZATION SHARE COMMON GENES...",
    "AND BLEEDING MEMORIES...",
    "YOUR STORY BEGINS NOW..."
];

let isSkipped = false;

function skipIntro() {
    isSkipped = true;
    const overlay = document.getElementById('intro-overlay');
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display = 'none'; }, 1500);
}

async function playIntro() {
    const display = document.getElementById('intro-text');
    
    for (let line of introLines) {
        if (isSkipped) break;
        display.textContent = line;
        display.style.opacity = 1;
        await new Promise(r => setTimeout(r, 2800)); // 停留时长
        if (isSkipped) break;
        display.style.opacity = 0;
        await new Promise(r => setTimeout(r, 1000)); // 切换间隔
    }
    
    if (!isSkipped) skipIntro();
}

// 页面加载启动
window.onload = playIntro;

// ===== 核心生成逻辑 =====
async function generate(){
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");

    try {
        const res = await fetch("/.netlify/functions/generate", {
            method:"POST",
            body: JSON.stringify({
                k1: document.getElementById("k1").value,
                k2: document.getElementById("k2").value,
                k3: document.getElementById("k3").value
            })
        });

        const data = await res.json();
        loader.classList.add("hidden");

        if(!res.ok || !data.image){
            alert("Digital Reconstruction Failed.");
            return;
        }

        document.getElementById("img").src = "data:image/png;base64," + data.image;
        renderAlignedPoem(data.poem, data.poem_en);

    } catch (e) {
        loader.classList.add("hidden");
        console.error(e);
    }
}

function renderAlignedPoem(zhRaw, enRaw) {
    const container = document.getElementById("poemDisplay");
    container.innerHTML = "";

    const splitText = (text, isEn) => {
        let fmt = isEn ? text.replace(/, /g, ",\n").replace(/\. /g, ".\n")
                       : text.replace(/，/g, "，\n").replace(/。/g, "。\n");
        return fmt.split('\n').map(s => s.trim()).filter(s => s !== "");
    };

    const zhLines = splitText(zhRaw, false);
    const enLines = splitText(enRaw, true);
    const length = Math.max(zhLines.length, enLines.length);

    for (let i = 0; i < length; i++) {
        const row = document.createElement("div");
        row.className = "poem-row";
        row.innerHTML = `
            <div class="zh-line">${zhLines[i] || ""}</div>
            <div class="en-line">${enLines[i] || ""}</div>
        `;
        container.appendChild(row);
    }
}

// ===== 背景粒子动画 =====
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
        d.x+=d.dx; d.y+=d.dy;
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
