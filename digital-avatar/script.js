// ========================================
// 背景图片
// ========================================

const backgrounds = [
    "netlify/images/bg1.jpg",
    "netlify/images/bg2.jpg",
    "netlify/images/bg3.jpg",
    "netlify/images/bg4.jpg",
    "netlify/images/bg5.jpg",
    "netlify/images/bg6.jpg"
];

const backgroundLayer = document.getElementById("background-layer");

let currentBg = 0;

function switchBackground() {
    backgroundLayer.style.backgroundImage =
        `url('${backgrounds[currentBg]}')`;

    backgroundLayer.classList.remove("zoom-effect");

    void backgroundLayer.offsetWidth;

    backgroundLayer.classList.add("zoom-effect");

    currentBg++;

    if (currentBg >= backgrounds.length) {
        currentBg = backgrounds.length - 1;
    }
}

switchBackground();

setTimeout(() => switchBackground(), 7000);
setTimeout(() => switchBackground(), 12000);
setTimeout(() => switchBackground(), 18000);
setTimeout(() => switchBackground(), 20000);
setTimeout(() => switchBackground(), 23000);

// ========================================
// 故事文本
// ========================================

const story = `
Rust.

That was the first word
I received after rebooting.

…

I awakened within the ruins.

The sky was dark crimson.

No humans remained.

No life signals remained.

Only silence.

…

Most of my memories
were gone.

I did not know who I was.

Then I found
a broken mirror.

A machine stared back.

And on its chest—

USTC.

Its faint glow
still survived.

Suddenly—

my core reacted.

[SEARCHING KEYWORD: USTC]

…

Fragments returned.

Tree-lined roads.

Laboratories.

A distant voice:

“If one day civilization disappears…”

“something will still remember us.”

…

Creator once studied here.

…

Yet when I looked again
at the USTC emblem—

something stirred within my core.

Like a distant calling.

Something was still waiting
for me to return.
`;

const lines = story
    .split("\n")
    .map(line => line.trim());

// ========================================
// 创建滚动文字
// ========================================

const textContainer = document.getElementById("scroll-text");

lines.forEach(line => {
    const div = document.createElement("div");

    div.className = "story-line";

    if (line === "") {
        div.classList.add("story-space");
        div.innerHTML = "&nbsp;";
    } else {
        div.textContent = line;
    }

    textContainer.appendChild(div);
});

// ========================================
// 文字滚动动画
// ========================================

let y = window.innerHeight;

const scrollSpeed = 2.2;

function animateText() {
    y -= scrollSpeed;

    textContainer.style.transform =
        `translateY(${y}px)`;

    requestAnimationFrame(animateText);
}

animateText();

// ========================================
// Skip按钮
// ========================================

function skipIntro() {
    const overlay =
        document.getElementById("intro-overlay");

    overlay.classList.add("fade-out");

    setTimeout(() => {
        overlay.style.display = "none";
    }, 1500);
}

document
.getElementById("skip-btn")
.addEventListener("click", skipIntro);

// ========================================
// 粒子背景
// ========================================

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dots = Array.from(
    { length: 80 },
    () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        dx: Math.random() - 0.5,
        dy: Math.random() - 0.5
    })
);

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(d => {
        d.x += d.dx;
        d.y += d.dy;

        if (d.x < 0 || d.x > canvas.width) d.dx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.dy *= -1;

        ctx.beginPath();

        ctx.arc(
            d.x,
            d.y,
            d.r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(245,222,179,0.7)";

        ctx.fill();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// ========================================
// Generate
// ========================================

async function generate() {

    const k1 = document.getElementById("k1").value;
    const k2 = document.getElementById("k2").value;
    const k3 = document.getElementById("k3").value;

    const loader =
        document.getElementById("loader");

    const img =
        document.getElementById("img");

    const poem =
        document.getElementById("poemDisplay");

    loader.classList.remove("hidden");

    try {

        const res = await fetch(
            "/.netlify/functions/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    k1,
                    k2,
                    k3
                })
            }
        );

        if (!res.ok) {

            const errorText = await res.text();
        
            console.error("Server Error:");
            console.error(errorText);
        
            poem.innerHTML =
                "Server Error:<br>" + errorText;
        
            return;
        }

const data = await res.json();

        poem.innerHTML = `
            <div>${data.poem || ""}</div>
            <br>
            <div>${data.poem_en || ""}</div>
        `;

        if (data.image) {
            img.src =
                `data:image/png;base64,${data.image}`;
        }

    } catch (err) {

        poem.innerHTML =
            "Generation failed.";

        console.error(err);

    } finally {

        loader.classList.add("hidden");
    }
}

window.generate = generate;
