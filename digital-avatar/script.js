async function generate(){
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");

    const res = await fetch("/.netlify/functions/generate", {
        method:"POST",
        body: JSON.stringify({
            k1:k1.value,
            k2:k2.value,
            k3:k3.value
        })
    });

    const data = await res.json();
    loader.classList.add("hidden");

    if(!res.ok || !data.image){
        alert("生成失败");
        return;
    }

    poem.textContent = data.poem;
    poem_en.textContent = data.poem_en;
    img.src = "data:image/png;base64," + data.image;
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
