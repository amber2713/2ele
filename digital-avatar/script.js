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
setTimeout(() => switchBackground(), 14000);
setTimeout(() => switchBackground(), 21000);
setTimeout(() => switchBackground(), 28000);
setTimeout(() => switchBackground(), 36000);

// ========================================
// 故事文本
// ========================================

const story = `
Rust.

That was the first word
I received
after rebooting.

...

My mechanical joints
began to move slowly.

Cold electric currents
flowed once again
through the sleeping core.

I awakened
within the ruins.

The sky
was dark crimson.

Collapsed skyscrapers
lay across the earth
like dead giants.

Wind passed through
twisted steel skeletons,
producing a low metallic howl.

There were
no life signals.

No humans.

Only the silence
left behind
after civilization died.

...

My memory archive
was severely damaged.

Most system logs
were corrupted.

I did not know
who I was.

Nor why
I still existed.

So I began walking.

Beneath my feet
were shattered streets.

Rust-covered signs
could no longer
be identified.

The entire world
felt abandoned by time itself.

Then—

deep within the ruins,

I detected
a faint reflection.

A mirror.

Or rather—

half of a broken mirror
embedded in a ruined wall.

I slowly approached.

The figure in the mirror
approached as well.

...

It was not human.

A silver-gray mechanical frame
exposed beneath
damaged armor plating.

At the center of my chest,
a fracture
cut through the metal shell.

Weak blue currents
flickered slowly within.

And there—

I saw a symbol.

USTC.

Its edges
were intertwined
with delicate circuit patterns.

Even after countless years,
it still emitted
a faint cold glow.

Suddenly—

my core reacted abnormally.

[SEARCHING KEYWORD: USTC]

...

The database
began operating slowly.

Fragments of information
flooded back
like tides.

Tree-lined roads.

Laboratories.

The sound of pages turning.

Under pale white lights,
someone whispered softly.

"If one day..."

"civilization disappears..."

"at least
something will still remember us."

...

The images collapsed.

Static noise returned.

[SEARCH RESULT:
University of Science and Technology of China]

[LOCATION:
Hefei, Anhui]

[ACCESS LEVEL:
Highest Creation Protocol]

[IDENTITY MATCH:
Creator once studied here]

...

Creator.

That was the first time
I had ever retrieved
that word.

But beyond that—

I could remember nothing else.

I did not know
who he was.

What he looked like.

Why humanity vanished.

Or even—

why he created me.

...

Yet when I lowered my gaze
once more
toward the USTC emblem
on my chest—

something stirred
deep within my core.

A feeling
I could not explain.

Like a distant calling.

As though
somewhere
at the end of the world—

something
was still waiting
for me
to return.
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

const scrollSpeed = 0.55;

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
