export  function generateCargo(){
    return { "type": "rich", "title": `カーゴが来ています！`, "description": "", "color": 0x00FFFF, "image": { "url": `https://images.squarespace-cdn.com/content/v1/5420d068e4b09194f76b2af6/1538674115349-AR0YMBWTMM24JOMAHF55/image-asset.png`, "height": 0, "width": 0 }, "footer": { "text": new Date().toString() } }
}

export  function generateHeli(){
    return { "type": "rich", "title": `ヘリが来ています！`, "description": "", "color": 0xFF0000, "image": { "url": `https://images.squarespace-cdn.com/content/v1/5420d068e4b09194f76b2af6/1441999665460-TRSSUVYMW1P5HV2U2ZDV/image-asset.png?format=1500w`, "height": 0, "width": 0 }, "footer": { "text": new Date().toString() } }
}