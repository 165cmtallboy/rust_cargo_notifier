import axios from 'axios';
import fs from 'fs';
import server from '@liamcottle/rustplus.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3030
const d_end = process.env.ENDPOINT;
console.log(process.env.SECRET)
var s = new server('206.71.159.131', '28083', '76561198935889907', process.env.SECRET)
var current = 0;
const NOSEND = true;

async function sendMessage(body){
    if(!NOSEND){
      await axios.post(
          d_end,
          body);
    }
}

async function oneTerm() {

    var now = new Date();
    console.log('searching...', s.websocket.readyState);

    var res = await new Promise((resolve) => s.getMapMarkers((res) => resolve(res)))
    
    // team
    s.getTeamInfo((message) => {
        message.response.teamInfo.members
          .forEach(({ name, x, y, spawnTime, deathTime}) => {
              console.log(`${name}\t\t${x}\t${y}\t${spawnTime}\t${deathTime}`)
          });
    });

    // cargo
    res.response.mapMarkers.markers.forEach(async (data) => {
        console.log(data.type, data.x, data.y)
        if(data.type === 3){
            // console.log(data.sellOrders)
        }
        // console.info(`data found ${data.type}\t\t${data.id}`);
        if (data.type === 5 && data.id !== current) {
            console.log("CARGO INCOMMING")
            current = data.id
            sendMessage(
                { content: 'カーゴきてるぞ！' }
            )
        }
    })
}

s.on('connected', async () => {
    console.info('connected')
    // sendMessage({content: 'hello'});
    s.getMap((res) => {
        fs.writeFile("public/map.jpg", res.response.map.jpgImage, (err) => {
            if(!err)
                console.log("Map wrote.")
            else
                console.error(err);
            setInterval(oneTerm, 1 * 1000);
        })      
    })
});

s.connect();
app.use(express.static('public'))
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
