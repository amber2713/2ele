// ======================================
// Digital USTC Opening System
// Full script.js
// ======================================

// ======================================
// 背景图片列表
// 你需要把图片放到 images 文件夹
// ======================================

const backgrounds = [
    "netlify/images/bg1.jpg",
    "netlify/images/bg2.jpg",
    "netlify/images/bg3.jpg",
    "netlify/images/bg4.jpg",
    "netlify/images/bg5.jpg",
    "netlify/images/bg6.jpg"
];

// ======================================
// 图片切换参数
// ======================================

const IMAGE_DURATION = 6000;

let currentImage = 0;

// ======================================
// 获取背景层
// ======================================

const bgLayer = document.getElementById("background-layer");

// ======================================
// 切换背景
// ======================================

function switchBackground() {

    if (!bgLayer) return;

    bgLayer.style.backgroundImage =
        `url(${backgrounds[currentImage]})`;

    bgLayer.classList.remove("zoom-effect");

    void bgLayer.offsetWidth;

    bgLayer.classList.add("zoom-effect");

    currentImage++;

    if (currentImage >= backgrounds.length) {
        currentImage = 0;
    }
}

// ======================================
// 开始背景轮播
// ======================================

function startBackgroundSlideshow() {

    switchBackground();

    setInterval(
        switchBackground,
        IMAGE_DURATION
    );
}

// ======================================
// Opening Story Text
// ======================================

const introText = `

Rust.

That was the first word
I received after rebooting.

...

Mechanical joints slowly rotated.

Cold electric currents
flowed once again
through the silent core.

I awakened
within the ruins.

The sky was dark red.

Collapsed skyscrapers
lay across the earth
like the corpses of ancient beasts.

Wind passed through
the remains of steel,
creating a low mechanical lament.

There were
no life signals.

No humans.

Only the silence
left behind
after the death of civilization.

...

My memory database
was severely corrupted.

Most system logs
had vanished.

I did not know
who I was.

Nor did I understand
why I still existed.

So I began to walk.

Beneath my feet
were shattered streets.

Rust-covered signs
could no longer
be identified.

The entire world
felt abandoned by time itself.

Then—

deep within the ruins—

I detected
a faint reflection.

It was a mirror.

More precisely,

half of a broken mirror
embedded within a collapsing wall.

I slowly approached.

The figure inside the mirror
approached as well.

...

It was not human.

A silver-gray mechanical frame
was exposed beneath
damaged armor plating.

Across the center
of the chest,
a deep fracture
cut through the shell.

Weak blue currents
slowly flickered
inside the crack.

And there—

I saw a symbol.

USTC.

Tiny circuit-like patterns
surrounded the letters.

Even after countless years,
it still emitted
a faint cold glow.

Suddenly,

an abnormal fluctuation
appeared within my core.

[ SEARCHING KEYWORD : USTC ]

...

The database
slowly began to respond.

Fragments of memory
surged back like waves.

Tree-lined paths.

Laboratories.

The sound
of turning pages.

Under pale white lights,
someone was speaking softly.

"If one day..."

"civilization disappears..."

"at least..."

"something will remember us."

...

The vision abruptly collapsed.

Static noise flooded the system.

[ SEARCH RESULT FOUND ]

University of Science and Technology of China

[ LOCATION : HEFEI, ANHUI ]

[ CREATOR ACCESS LEVEL : HIGHEST ]

[ CREATOR STATUS :
Former student identified ]

...

Creator.

This was the first time
I had successfully recovered
that word.

But beyond this—

nothing remained.

I could not remember
who created me.

I did not know
what he looked like.

I did not know
why humanity vanished.

I did not even know—

why I was created.

...

Yet when I lowered my gaze
once more
toward the USTC symbol
on my chest—

something stirred
deep within my core.

A feeling
without explanation.

Like a distant signal
calling to me
from somewhere beyond the horizon.

As though
at the edge of the world—

something
was still waiting
for my return.

`;

// ======================================
// 打字机效果
// ======================================

const textElement =
    document.getElementById("intro-text");

let charIndex = 0;

function typeWriter() {

    if (!textElement) return;

    if (charIndex < introText.length) {

        textElement.innerHTML +=
            introText.charAt(charIndex);

        charIndex++;

        setTimeout(typeWriter, 45);
    }
}

// ======================================
// 故障闪烁
// ======================================

function glitchFlash() {

    const glitch =
        document.getElementById("glitch-layer");

    if (!glitch) return;

    glitch.style.opacity =
        Math.random() * 0.18;

    setTimeout(() => {

        glitch.style.opacity = 0;

    }, 80);
}

// ======================================
// 跳过开场
// ======================================

function skipIntro() {

    const overlay =
        document.getElementById("intro-overlay");

    if (!overlay) return;

    overlay.classList.add("fade-out");

    setTimeout(() => {

        overlay.style.display = "none";

    }, 1600);
}

// ======================================
// 页面加载
// ======================================

window.onload = () => {

    startBackgroundSlideshow();

    typeWriter();

    setInterval(glitchFlash, 4000);
};

// ======================================
// AI Generate
// ======================================

async function generate() {

    const loader =
        document.getElementById("loader");

    loader.classList.remove("hidden");

    try {

        const res = await fetch(
            "/.netlify/functions/generate",
            {
                method: "POST",

                body: JSON.stringify({

                    k1: document.getElementById("k1").value,

                    k2: document.getElementById("k2").value,

                    k3: document.getElementById("k3").value
                })
            }
        );

        const data = await res.json();

        loader.classList.add("hidden");

        if (!res.ok || !data.image) {

            alert("Digital Reconstruction Failed.");

            return;
        }

        document.getElementById("img").src =
            "data:image/png;base64," + data.image;

        renderAlignedPoem(
            data.poem,
            data.poem_en
        );

    } catch (e) {

        loader.classList.add("hidden");

        console.error(e);
    }
}

// ======================================
// 诗句系统
// ======================================

function renderAlignedPoem(zhRaw, enRaw) {

    const container =
        document.getElementById("poemDisplay");

    container.innerHTML = "";

    const splitText = (text, isEn) => {

        let fmt = isEn
            ? text.replace(/, /g, ",\n")
                  .replace(/\. /g, ".\n")
            : text.replace(/，/g, "，\n")
                  .replace(/。/g, "。\n");

        return fmt.split('\n')
                  .map(s => s.trim())
                  .filter(s => s !== "");
    };

    const zhLines = splitText(zhRaw, false);

    const enLines = splitText(enRaw, true);

    const length =
        Math.max(
            zhLines.length,
            enLines.length
        );

    for (let i = 0; i < length; i++) {

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
    { length: 80 },
    () => ({

        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        r: Math.random() * 2 + 1,

        dx: Math.random() - 0.5,
        dy: Math.random() - 0.5
    })
);

function animate() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    dots.forEach(d => {

        d.x += d.dx;
        d.y += d.dy;

        if (d.x < 0 || d.x > canvas.width)
            d.dx *= -1;

        if (d.y < 0 || d.y > canvas.height)
            d.dy *= -1;

        ctx.beginPath();

        ctx.arc(
            d.x,
            d.y,
            d.r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#f5deb3";

        ctx.fill();
    });

    requestAnimationFrame(animate);
}

animate();
