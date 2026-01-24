function typeText(el, text, speed = 20) {
  el.innerText = "";
  let i = 0;
  const timer = setInterval(() => {
    el.innerText += text[i];
    i++;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}

async function generate() {
  const img = document.getElementById("image");
  img.style.opacity = 0;

  const res = await fetch("/.netlify/functions/generate", {
    method: "POST",
    body: JSON.stringify({
      k1: k1.value,
      k2: k2.value,
      k3: k3.value
    })
  });

  const data = await res.json();

  img.src = "data:image/png;base64," + data.image;
  setTimeout(() => img.style.opacity = 1, 300);

  typeText(document.getElementById("poem_cn"), data.poem, 18);
  typeText(document.getElementById("poem_en"), data.poem_en, 18);
}
