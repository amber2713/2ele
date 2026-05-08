// ======================================
// 开场动画
// ======================================

const introScenes = [

{
    text:"SYSTEM REBOOTING...",
    sub:"Recovering damaged memory sectors...",
    bg:"images/scene1.jpg"
},

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
