exports.handler = async function(event) {

const {k1,k2,k3} = JSON.parse(event.body);
const keywords = `${k1} ${k2} ${k3}`;

// ====== 第一步：Qwen3 生成诗 + 英文 + Prompt ======

const qwenRes = await fetch("https://maas-api.cn-huabei-1.xf-yun.com/v2",{
    method:"POST",
    headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer sk-qiXqtAiI5QEGrK0bD90e79Af68724a75824dFd286b5b91F5"
    },
    body:JSON.stringify({
        model:"xop3qwen1b7",
        messages:[{
            role:"user",
            content:`用关键词 ${keywords} 写一首七言绝句，并翻译成英文。再将这三个词润色为适合生成赛博风格全身数字人的英文prompt。按JSON输出：poem, poem_en, prompt`
        }],
        response_format:{type:"json_object"}
    })
});

const qwenData = await qwenRes.json();
const result = JSON.parse(qwenData.choices[0].message.content);

// ====== 第二步：Qwen-Image 生成图片 ======

const imgRes = await fetch("https://maas-api.cn-huabei-1.xf-yun.com/v2.1/tti",{
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify({
        header:{
            app_id:"a3af8563",
            uid:"123"
        },
        parameter:{
            chat:{
                domain:"xopqwentti20b",
                width:768,
                height:1024,
                seed:42,
                num_inference_steps:20,
                guidance_scale:6,
                scheduler:"Euler"
            }
        },
        payload:{
            message:{
                text:[{role:"user",content:result.prompt}]
            }
        }
    })
});

const imgData = await imgRes.json();
const base64 = imgData.payload.choices.text[0].content;

return {
    statusCode:200,
    body:JSON.stringify({
        poem:result.poem,
        poem_en:result.poem_en,
        image:base64
    })
};
};