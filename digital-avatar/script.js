// ======================================
// 开场动画
// ======================================

const introScenes = [

{
    text:"SYSTEM REBOOTING...",
    sub:"Recovering damaged memory sectors...",
    bg:"images/scene1.jpg"
},// ======================================
// Digital USTC Opening System
// 图片轮播 + 文字滚动
// ======================================

// ======================================
// 背景图片列表
// 你把图片放到 images 文件夹
// ======================================

const backgrounds = [

    "images/bg1.jpg",
    "images/bg2.jpg",
    "images/bg3.jpg",
    "images/bg4.jpg",
    "images/bg5.jpg",
    "images/bg6.jpg"

];

// ======================================
// 图片切换参数
// ======================================

// 每张图显示时间（毫秒）
const IMAGE_DURATION = 6000;

// 当前图片索引
let currentImage = 0;

// 获取背景层
const bgLayer =
    document.getElementById("background-layer");

// ======================================
// 图片切换函数
// ======================================

function switchBackground(){

    // 设置背景图
    bgLayer.style.backgroundImage =
        `url(${backgrounds[currentImage]})`;

    // 触发缓慢放大
    bgLayer.classList.remove("zoom-effect");

    void bgLayer.offsetWidth;

    bgLayer.classList.add("zoom-effect");

    // 下一张
    currentImage++;

    if(currentImage >= backgrounds.length){
        currentImage = 0;
    }
}

// ======================================
// 开始轮播
// ======================================

function startBackgroundSlideshow(){

    // 第一张
    switchBackground();

    // 定时切换
    setInterval(
        switchBackground,
        IMAGE_DURATION
    );
}

// ======================================
// 打字文字（你的原效果）
// ======================================

const introText = `

锈蚀。

这是我重新启动后，
接收到的第一个词。

……

机械关节缓缓转动。

冰冷的电流，
重新流过沉睡已久的核心。

我从废墟中醒来。

天空是暗红色的。

断裂的高楼，
像死去的巨兽，
倾倒在大地之上。

风穿过钢铁残骸，
发出低沉的呜咽。

这里……

没有生命信号。

没有人类。

只有文明死去后的沉默。

……

我的记忆库严重损坏。

系统日志大片缺失。

我不知道自己是谁。

也不知道，
自己为何仍然存在。

于是我开始向前行走。

脚下是破碎的街道。

锈蚀的路牌，
早已无法辨认。

整个世界，
像被时间彻底遗忘。

忽然。

废墟深处，
出现了一道微弱的反光。

那是一面镜子。

准确来说，

是半块嵌在墙体里的、
残破镜面。

我缓缓靠近。

镜中的身影，
也在靠近。

……

那不是人类。

银灰色的机械骨架，
裸露在破损外壳之外。

胸口的位置，
一道裂痕贯穿整个装甲。

微弱的蓝色电流，
正在其中缓慢闪烁。

而在那里。

我看见了一枚标志。

USTC。

字符边缘，
缠绕着细密的电路纹路。

即使经历漫长岁月，
它依旧泛着微弱冷光。

我的核心，
忽然产生异常波动。

【检索关键词：USTC】

……

数据库开始缓慢运行。

大量破碎的信息，
如潮水般闪回。

林荫道。

实验室。

书页翻动的声音。

白色灯光下，
有人正在低声交谈。

“如果有一天……”

“文明消失了……”

“至少它还能记得我们。”

……

画面突然中断。

系统再次陷入杂讯。

【检索结果：中国科学技术大学】

【位置：安徽·合肥】

【关联权限：最高级创建协议】

【身份关联：制造者曾于此学习】

……

制造者。

这是我第一次，
读取到这个词。

可除了这些。

我再也无法找到，
关于他的任何记忆。

我不知道他是谁。

不知道他长什么样子。

不知道人类为何灭绝。

甚至不知道——

他为什么创造了我。

……

可当我再次低头，
看向胸口那枚USTC标志时。

核心深处，
却传来一种无法解释的感觉。

像是某种遥远的呼唤。

仿佛在世界尽头。

仍然有什么东西——

在等待我回去。

`;

// ======================================
// 文字逐字显示
// ======================================

const textElement =
    document.getElementById("intro-text");

let charIndex = 0;

function typeWriter(){

    if(charIndex < introText.length){

        textElement.innerHTML +=
            introText.charAt(charIndex);

        charIndex++;

        setTimeout(typeWriter,45);
    }
}

// ======================================
// 故障闪烁
// ======================================

function glitchFlash(){

    const glitch =
        document.getElementById("glitch-layer");

    glitch.style.opacity =
        Math.random() * 0.18;

    setTimeout(()=>{

        glitch.style.opacity = 0;

    },80);
}

// ======================================
// 跳过开场
// ======================================

function skipIntro(){

    const overlay =
        document.getElementById("intro-overlay");

    overlay.classList.add("fade-out");

    setTimeout(()=>{

        overlay.style.display = "none";

    },1600);
}

// ======================================
// 页面加载
// ======================================

window.onload = ()=>{

    // 背景轮播
    startBackgroundSlideshow();

    // 开始文字
    typeWriter();

    // 故障效果
    setInterval(glitchFlash,4000);
};

// ======================================
// 下面是你原来的AI功能
// 不需要改
// ======================================

async function generate(){

    const loader =
        document.getElementById("loader");

    loader.classList.remove("hidden");

    try{

        const res = await fetch(
            "/.netlify/functions/generate",
            {
                method:"POST",

                body:JSON.stringify({

                    k1:document.getElementById("k1").value,

                    k2:document.getElementById("k2").value,

                    k3:document.getElementById("k3").value
                })
            }
        );

        const data = await res.json();

        loader.classList.add("hidden");

        if(!res.ok || !data.image){

            alert("Digital Reconstruction Failed.");

            return;
        }

        document.getElementById("img").src =
            "data:image/png;base64," + data.image;

        renderAlignedPoem(
            data.poem,
            data.poem_en
        );

    }catch(e){

        loader.classList.add("hidden");

        console.error(e);
    }
}

// ======================================
// 诗句系统
// ======================================

function renderAlignedPoem(zhRaw,enRaw){

    const container =
        document.getElementById("poemDisplay");

    container.innerHTML = "";

    const splitText = (text,isEn)=>{

        let fmt = isEn
            ? text.replace(/, /g,",\n")
                  .replace(/\. /g,".\n")
            : text.replace(/，/g,"，\n")
                  .replace(/。/g,"。\n");

        return fmt.split('\n')
                  .map(s=>s.trim())
                  .filter(s=>s!=="");
    };

    const zhLines = splitText(zhRaw,false);

    const enLines = splitText(enRaw,true);

    const length =
        Math.max(
            zhLines.length,
            enLines.length
        );

    for(let i=0;i<length;i++){

        const row =
            document.createElement("div");

        row.className = "poem-row";

        row.innerHTML = `
            <div class="zh-line">
                ${zhLines[i] || ""}
            </div>

            <div class="en-line">
                ${enLines[i] || ""}
            </div>
        `;

        container.appendChild(row);
    }
}

// ======================================
// 粒子背景
// ======================================

const canvas =
    document.getElementById("bg");

const ctx =
    canvas.getContext("2d");

canvas.width =
    window.innerWidth;

canvas.height =
    window.innerHeight;

let dots = Array.from(
    {length:80},
    ()=>({

        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,

        r:Math.random()*2+1,

        dx:Math.random()-0.5,
        dy:Math.random()-0.5
    })
);

function animate(){

    ctx.clearRect(
        0,0,
        canvas.width,
        canvas.height
    );

    dots.forEach(d=>{

        d.x += d.dx;
        d.y += d.dy;

        if(d.x<0 || d.x>canvas.width)
            d.dx *= -1;

        if(d.y<0 || d.y>canvas.height)
            d.dy *= -1;

        ctx.beginPath();

        ctx.arc(
            d.x,
            d.y,
            d.r,
            0,
            Math.PI*2
        );

        ctx.fillStyle = "#f5deb3";

        ctx.fill();
    });

    requestAnimationFrame(animate);
}

animate();

{
    text:"NO HUMAN LIFE DETECTED",
    sub:"Civilization status: EXTINCT",
    bg:"images/scene2.jpg"
},

{
    text:"MEMORY CORE CORRUPTED",
    sub:"Attempting neural reconstruction...",
    bg:"images/scene3.jpg"
},

{
    text:"UNKNOWN ENTITY ACTIVATED",
    sub:"Mechanical consciousness detected",
    bg:"images/scene4.jpg"
},

{
    text:"VISUAL REFLECTION IDENTIFIED",
    sub:"Searching identity...",
    bg:"images/scene5.jpg"
},

{
    text:"USTC",
    sub:"Creator association found",
    bg:"images/scene6.jpg"
},

{
    text:"中国科学技术大学",
    sub:"Location: Hefei, Anhui",
    bg:"images/scene7.jpg"
},

{
    text:"SOMEONE CREATED ME THERE",
    sub:"But memory data has been erased...",
    bg:"images/scene8.jpg"
},

{
    text:"WHY WAS I CREATED?",
    sub:"No valid answer found.",
    bg:"images/scene9.jpg"
},

{
    text:"RETURN TO USTC",
    sub:"The journey begins now.",
    bg:"images/scene10.jpg"
}

];

let isSkipped = false;

async function typeText(el,text,speed=40){

    el.innerHTML="";

    for(let i=0;i<text.length;i++){

        if(isSkipped) return;

        el.innerHTML += text.charAt(i);

        await new Promise(r=>setTimeout(r,speed));
    }
}

function glitchFlash(){

    const glitch =
        document.getElementById("glitch-layer");

    glitch.style.opacity =
        Math.random()*0.22;

    setTimeout(()=>{
        glitch.style.opacity=0;
    },80);
}

async function playIntro(){

    const textEl =
        document.getElementById("intro-text");

    const subEl =
        document.getElementById("intro-sub");

    const bg =
        document.getElementById("background-layer");

    for(const scene of introScenes){

        if(isSkipped) break;

        bg.style.backgroundImage =
            `url(${scene.bg})`;

        bg.classList.remove("zoom-effect");

        void bg.offsetWidth;

        bg.classList.add("zoom-effect");

        textEl.style.opacity=0;
        subEl.style.opacity=0;

        await new Promise(r=>setTimeout(r,500));

        glitchFlash();

        textEl.style.opacity=1;
        subEl.style.opacity=1;

        await typeText(textEl,scene.text,38);

        await new Promise(r=>setTimeout(r,300));

        await typeText(subEl,scene.sub,20);

        await new Promise(r=>setTimeout(r,2400));

        textEl.style.opacity=0;
        subEl.style.opacity=0;

        await new Promise(r=>setTimeout(r,1200));
    }

    document.getElementById("enter-btn")
        .style.opacity=1;
}

function skipIntro(){

    isSkipped=true;

    const overlay =
        document.getElementById("intro-overlay");

    overlay.classList.add("fade-out");

    setTimeout(()=>{
        overlay.style.display="none";
    },1600);
}

window.onload=()=>{

    playIntro();

    setInterval(glitchFlash,4000);
};

// ======================================
// AI生成
// ======================================

async function generate(){

    const loader =
        document.getElementById("loader");

    loader.classList.remove("hidden");

    try{

        const res = await fetch(
            "/.netlify/functions/generate",
            {
                method:"POST",

                body:JSON.stringify({

                    k1:document.getElementById("k1").value,

                    k2:document.getElementById("k2").value,

                    k3:document.getElementById("k3").value
                })
            }
        );

        const data = await res.json();

        loader.classList.add("hidden");

        if(!res.ok || !data.image){

            alert("Digital Reconstruction Failed.");

            return;
        }

        document.getElementById("img").src =
            "data:image/png;base64," + data.image;

        renderAlignedPoem(
            data.poem,
            data.poem_en
        );

    }catch(e){

        loader.classList.add("hidden");

        console.error(e);
    }
}

function renderAlignedPoem(zhRaw,enRaw){

    const container =
        document.getElementById("poemDisplay");

    container.innerHTML = "";

    const splitText = (text,isEn)=>{

        let fmt = isEn
            ? text.replace(/, /g,",\n")
                  .replace(/\. /g,".\n")
            : text.replace(/，/g,"，\n")
                  .replace(/。/g,"。\n");

        return fmt.split('\n')
                  .map(s=>s.trim())
                  .filter(s=>s!=="");
    };

    const zhLines = splitText(zhRaw,false);

    const enLines = splitText(enRaw,true);

    const length =
        Math.max(
            zhLines.length,
            enLines.length
        );

    for(let i=0;i<length;i++){

        const row =
            document.createElement("div");

        row.className = "poem-row";

        row.innerHTML = `
            <div class="zh-line">
                ${zhLines[i] || ""}
            </div>

            <div class="en-line">
                ${enLines[i] || ""}
            </div>
        `;

        container.appendChild(row);
    }
}

// ======================================
// 粒子背景
// ======================================

const canvas =
    document.getElementById("bg");

const ctx =
    canvas.getContext("2d");

canvas.width =
    window.innerWidth;

canvas.height =
    window.innerHeight;

let dots = Array.from(
    {length:80},
    ()=>({

        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,

        r:Math.random()*2+1,

        dx:Math.random()-0.5,
        dy:Math.random()-0.5
    })
);

function animate(){

    ctx.clearRect(
        0,0,
        canvas.width,
        canvas.height
    );

    dots.forEach(d=>{

        d.x += d.dx;
        d.y += d.dy;

        if(d.x<0 || d.x>canvas.width)
            d.dx *= -1;

        if(d.y<0 || d.y>canvas.height)
            d.dy *= -1;

        ctx.beginPath();

        ctx.arc(
            d.x,
            d.y,
            d.r,
            0,
            Math.PI*2
        );

        ctx.fillStyle="#f5deb3";

        ctx.fill();
    });

    requestAnimationFrame(animate);
}

animate();
