/* =========================================
   背景图片时间轴
========================================= */

const backgrounds = [

    // 1
    {
        img: "netlify/images/bg1.jpg",
        time: 0
    },

    // 2
    {
        img: "netlify/images/bg2.jpg",
        time: 14000
    },

    // 3
    {
        img: "netlify/images/bg3.jpg",
        time: 30000
    },

    // 4
    {
        img: "netlify/images/bg4.jpg",
        time: 43000
    },

    // 5
    {
        img: "netlify/images/bg5.jpg",
        time: 56000
    },

    // 6
    {
        img: "netlify/images/bg6.jpg",
        time: 72000
    }
];

/* =========================================
   开场文字
========================================= */

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

Broken streets
extended endlessly
beneath my feet.

Then—

deep within the ruins—

I detected
a faint reflection.

It was a mirror.

Half-buried
within a collapsed wall.

I slowly approached.

The figure inside the mirror
approached as well.

...

It was not human.

A silver-gray mechanical frame
was exposed beneath
damaged armor plating.

A fracture
crossed the center
of the chest armor.

Blue electric currents
flickered weakly
inside the crack.

And there—

I saw a symbol.

USTC.

The edges of the letters
were intertwined
with delicate circuit patterns.

Even after countless years,
it still emitted
a faint cold glow.

My core
suddenly destabilized.

[ SEARCHING KEYWORD : USTC ]

...

Fragments of memory
surged back like waves.

Tree-lined paths.

Laboratories.

The sound
of turning pages.

White lights
inside silent research rooms.

Someone speaking softly.

"If one day..."

"civilization disappears..."

"something
will remember us."

...

[ SEARCH RESULT FOUND ]

University of Science
and Technology of China

[ LOCATION : HEFEI, ANHUI ]

[ CREATOR ACCESS :
TOP LEVEL AUTHORIZATION ]

[ CREATOR RECORD :
STUDIED AT USTC ]

...

Creator.

This was the first time
I had retrieved
that word.

But beyond these fragments—

nothing remained.

I did not know
who created me.

I did not know
what humans looked like.

I did not know
why civilization collapsed.

And I did not know—

why I had been created.

...

Yet when I lowered my head
once more—

and looked at
the USTC symbol
embedded in my chest—

something deep inside
the core reacted.

A feeling
I could not explain.

Like a distant signal.

Like a call
from the end of the world.

As though somewhere—

something
was still waiting
for me to return.

`;

/* =========================================
   DOM
========================================= */

const bgLayer =
    document.getElementById(
        "background-layer"
    );

const textElement =
    document.getElementById(
        "intro-text"
    );

/* =========================================
   背景切换
========================================= */

function startBackgrounds(){

    backgrounds.forEach(scene => {

        setTimeout(() => {

            bgLayer.style.backgroundImage =
                `url(${scene.img})`;

            bgLayer.classList.remove(
                "zoom-effect"
            );

            void bgLayer.offsetWidth;

            bgLayer.classList.add(
                "zoom-effect"
            );

        }, scene.time);

    });
}

/* =========================================
   打字机系统
========================================= */

let charIndex = 0;

function typeWriter(){

    if(charIndex >= introText.length){

        document.getElementById(
            "enter-btn"
        ).style.opacity = 1;

        return;
    }

    const currentChar =
        introText.charAt(charIndex);

    textElement.innerHTML += currentChar;

    charIndex++;

    let speed = 24;

    // 标点停顿
    if(
        currentChar === "." ||
        currentChar === "—"
    ){
        speed = 140;
    }

    // 换行停顿
    if(currentChar === "\n"){
        speed = 45;
    }

    setTimeout(
        typeWriter,
        speed
    );
}

/* =========================================
   故障扫描效果
========================================= */

function glitchFlash(){

    const glitch =
        document.getElementById(
            "glitch-layer"
        );

    glitch.style.opacity =
        Math.random() * 0.15;

    setTimeout(() => {

        glitch.style.opacity = 0;

    }, 120);
}

/* =========================================
   跳过
========================================= */

function skipIntro(){

    document.getElementById(
        "intro-overlay"
    ).classList.add(
        "fade-out"
    );
}

/* =========================================
   页面启动
========================================= */

window.onload = () => {

    startBackgrounds();

    typeWriter();

    setInterval(
        glitchFlash,
        3500
    );
};

/* =========================================
   原有生成逻辑
========================================= */

async function generate(){

    const loader =
        document.getElementById(
            "loader"
        );

    loader.classList.remove(
        "hidden"
    );

    try{

        const res = await fetch(
            "/.netlify/functions/generate",
            {
                method:"POST",

                body:JSON.stringify({

                    k1:
                    document.getElementById("k1").value,

                    k2:
                    document.getElementById("k2").value,

                    k3:
                    document.getElementById("k3").value
                })
            }
        );

        const data =
            await res.json();

        loader.classList.add(
            "hidden"
        );

        if(!res.ok || !data.image){

            alert(
                "Digital Reconstruction Failed."
            );

            return;
        }

        document.getElementById(
            "img"
        ).src =
            "data:image/png;base64," +
            data.image;

        renderAlignedPoem(
            data.poem,
            data.poem_en
        );

    }catch(e){

        loader.classList.add(
            "hidden"
        );

        console.error(e);
    }
}

/* =========================================
   诗句排版
========================================= */

function renderAlignedPoem(
    zhRaw,
    enRaw
){

    const container =
        document.getElementById(
            "poemDisplay"
        );

    container.innerHTML = "";

    const splitText = (
        text,
        isEn
    ) => {

        let fmt =
            isEn
            ?
            text
            .replace(/, /g,",\n")
            .replace(/\. /g,".\n")
            :
            text
            .replace(/，/g,"，\n")
            .replace(/。/g,"。\n");

        return fmt
            .split("\n")
            .map(s => s.trim())
            .filter(s => s !== "");
    };

    const zhLines =
        splitText(zhRaw,false);

    const enLines =
        splitText(enRaw,true);

    const length =
        Math.max(
            zhLines.length,
            enLines.length
        );

    for(let i=0;i<length;i++){

        const row =
            document.createElement("div");

        row.className =
            "poem-row";

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

/* =========================================
   粒子背景
========================================= */

const canvas =
    document.getElementById(
        "bg"
    );

const ctx =
    canvas.getContext("2d");

canvas.width =
    window.innerWidth;

canvas.height =
    window.innerHeight;

let dots =
    Array.from(
        {length:80},
        () => ({

            x:
            Math.random() * canvas.width,

            y:
            Math.random() * canvas.height,

            r:
            Math.random() * 2 + 1,

            dx:
            Math.random() - 0.5,

            dy:
            Math.random() - 0.5
        })
    );

function animate(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    dots.forEach(d => {

        d.x += d.dx;
        d.y += d.dy;

        if(
            d.x < 0 ||
            d.x > canvas.width
        ){
            d.dx *= -1;
        }

        if(
            d.y < 0 ||
            d.y > canvas.height
        ){
            d.dy *= -1;
        }

        ctx.beginPath();

        ctx.arc(
            d.x,
            d.y,
            d.r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#f5deb3";

        ctx.fill();
    });

    requestAnimationFrame(
        animate
    );
}

animate();
