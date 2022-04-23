import axios from 'axios';
import fs from 'fs';
import server from '@liamcottle/rustplus.js';
import express from 'express';

const app = express();
const port = 3030
const d_end = 'https://discord.com/api/webhooks/964727188844851261/5KGJCbS7aSlmqDahNEMekBdRSp4WlueRl7Qfo9Ya-rRP3JQnuC-QcqYxqKaoMrUZV3d4';
var s = new server('206.71.159.131', '28083', '76561198935889907', '-1181378574')
var current = 0;


async function sendMessage(body){
    await axios.post(
        d_end,
        body)
}

async function oneTerm() {

    var now = new Date();
    console.log('searching...', s.websocket.readyState);

    var res = await new Promise((resolve) => s.getMapMarkers((res) => resolve(res)))
    console.log(res.response.mapMarkers.markers)
    res.response.mapMarkers.markers.forEach(async (data) => {
        if(data.type === 3){
            console.log(data.sellOrders)
        }
        console.info(`data found ${data.type}\t\t${data.id}`);
        if (data.type === 5 && data.id !== current) {
            current = data.id
            await axios.post(
                d_end,
                { content: 'カーゴきてるぞ！' }
            )
        }
    })
}

s.on('connected', async () => {
    s.getTeamInfo((message) => {
        message.response.teamInfo.members
          .forEach((member) => {
              console.log(member.steamId);
          });
    });
    console.info('connected')
    // sendMessage({content: 'hello'});
    // setInterval(oneTerm, 10 * 1000);
    s.getMap((res) => {
        fs.writeFile("public/map.jpg", res.response.map.jpgImage, (err) => {
            if(!err)
                console.log("Map wrote.")
            else
                console.error(err);
        })      
    })
});

s.on('message', (message) => {
    console.log(message)
    if(message.broadcast && message.broadcast.entityChanged){

        var entityChanged = message.broadcast.entityChanged;

        var entityId = entityChanged.entityId;
        var value = entityChanged.payload.value;

        console.log("entity " + entityId + " is now " + (value ? "active" : "inactive"));

    }
});
s.connect();
app.use(express.static('public'))
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
