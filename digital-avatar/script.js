async function generate(){
    const k1=document.getElementById("k1").value;
    const k2=document.getElementById("k2").value;
    const k3=document.getElementById("k3").value;

    const res = await fetch("/.netlify/functions/generate",{
        method:"POST",
        body:JSON.stringify({k1,k2,k3})
    });

    const data = await res.json();

    document.getElementById("img").src = "data:image/png;base64,"+data.image;
    document.getElementById("poem").innerText = data.poem;
    document.getElementById("poem_en").innerText = data.poem_en;
}

function goExplore(){
    window.location.href="https://www.bilibili.com";
}