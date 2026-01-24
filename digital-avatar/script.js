function typeText(el, text, speed = 18) {
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
  const loadPoem = document.getElementById("loadingPoem");
  const loadImg = document.getElementById("loadingImage");

  img.style.opacity = 0;
  loadPoem.style.display = "block";
  loadImg.style.display = "block";

  poem_cn.innerText = "";
  poem_en.innerText = "";

  const res = await fetch("/.netlify/functions/generate", {
    method: "POST",
    body: JSON.stringify({
      k1: k1.value,
      k2: k2.value,
      k3: k3.value
    })
  });

  const data = await res.json();

  loadPoem.style.display = "none";
  typeText(poem_cn, data.poem);
  typeText(poem_en, data.poem_en);

  img.src = "data:image/png;base64," + data.image;
  setTimeout(() => {
    loadImg.style.display = "none";
    img.style.opacity = 1;
  }, 800);
}
