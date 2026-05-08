const backgrounds = [

    {
        img:"netlify/images/bg1.jpg",
        time:0
    },

    {
        img:"netlify/images/bg2.jpg",
        time:15000
    },

    {
        img:"netlify/images/bg3.jpg",
        time:30000
    },

    {
        img:"netlify/images/bg4.jpg",
        time:42000
    },

    {
        img:"netlify/images/bg5.jpg",
        time:56000
    },

    {
        img:"netlify/images/bg6.jpg",
        time:72000
    }
];

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

Then—

deep within the ruins—

I detected
a faint reflection.

It was a mirror.

I slowly approached.

The figure inside the mirror
approached as well.

...

It was not human.

A silver-gray mechanical frame
was exposed beneath
damaged armor plating.

And there—

I saw a symbol.

USTC.

[ SEARCHING KEYWORD : USTC ]

Fragments of memory
surged back like waves.

Tree-lined paths.

Laboratories.

The sound
of turning pages.

"If one day..."

"civilization disappears..."

"something will remember us."

[ SEARCH RESULT FOUND ]

University of Science and Technology of China

[ LOCATION : HEFEI, ANHUI ]

`;

const bgLayer =
    document.getElementById(
        "background-layer"
    );

function startBackgrounds(){

    backgrounds.forEach(scene=>{

        setTimeout(()=>{

            bgLayer.style.backgroundImage =
                `url(${scene.img})`;

            bgLayer.classList.remove(
                "zoom-effect"
            );

            void bgLayer.offsetWidth;

            bgLayer.classList.add(
                "zoom-effect"
            );

        },scene.time);

    });
}

const textElement =
    document.getElementById(
        "intro-text"
    );

let charIndex = 0;

function typeWriter(){

    if(charIndex < introText.length){

        textElement.innerHTML +=
            introText.charAt(charIndex);

        charIndex++;

        let speed = 26;

        const currentChar =
            introText.charAt(charIndex);

        if(
            currentChar === "." ||
            currentChar === "—"
        ){
            speed = 180;
        }

        if(
            currentChar === "\n"
        ){
            speed = 60;
        }

        setTimeout(
            typeWriter,
            speed
        );

    }else{

        document.getElementById(
            "enter-btn"
        ).style.opacity = 1;
    }
}

function glitchFlash(){

    const glitch =
        document.getElementById(
            "glitch-layer"
        );

    glitch.style.opacity =
        Math.random() * 0.15;

    setTimeout(()=>{

        glitch.style.opacity = 0;

    },120);
}

function skipIntro(){

    document.getElementById(
        "intro-overlay"
    ).classList.add(
        "fade-out"
    );
}

window.onload = ()=>{

    startBackgrounds();

    typeWriter();

    setInterval(
        glitchFlash,
        3500
    );
};

document.addEventListener(
    "click",
    ()=>{
        skipIntro();
    }
);
