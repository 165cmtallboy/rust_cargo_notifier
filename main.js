import axios from 'axios';
import fs from 'fs';
import server from '@liamcottle/rustplus.js';
import express from 'express';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';

dotenv.config();

const app = express();
const port = 3030
const d_end = process.env.ENDPOINT;
console.log(process.env.SECRET)
var s = new server('206.71.159.131', '28083', '76561198935889907', process.env.SECRET)

var current_cargo = 0;
var current_heli = 0;

const NOSEND = true;

function initializeDB(){
    const db = new sqlite3.Database("out.db")
    db.serialize(() => {
        db.run('create table if not exists member(time, name, x, y, spawnTime, deathTime)')
    });
    db.close();
    
}

async function sendMessage(body) {
    if (!NOSEND) {
        await axios.post(
            d_end,
            body);
        console.log('sending:', body);
    }
}

async function oneTerm() {

    var now = new Date();
    console.log('searching...', s.websocket.readyState);

    var res = await new Promise((resolve) => s.getMapMarkers((res) => resolve(res)))

    // team
    s.getTeamInfo((message) => {
        // saving
        const db = new sqlite3.Database("out.db")
        db.serialize(() => {
        message.response.teamInfo.members
            .forEach(({ name, x, y, spawnTime, deathTime }) => {
                db.run('insert into member values(?, ?, ?, ?, ?, ?)', [new Date().getTime(), name, x, y, spawnTime, deathTime])
            });
        });
        db.close();
    });

    // cargo
    res.response.mapMarkers.markers.forEach(async (data) => {
        console.log(data.type, data.x, data.y)

        if (data.type === 3) {
            console.log(data);
            console.log(data.sellOrders)
        }
        
        if (data.type === 5 && data.id !== current_cargo) {
            console.log("CARGO INCOMMING")
            current_cargo = data.id
            sendMessage(
                { content: 'CARGO INCOMMING!' }
            )
        }

        if (data.type === 8 && data.id !== current_heli) {
            console.log("CARGO INCOMMING")
            current_cargo = data.id
            sendMessage(
                { content: 'HELI INCOMMING!' }
            )
        }
    })
}

s.on('connected', async () => {
    console.info('connected')
    // sendMessage({content: 'hello'});
    s.getMap((res) => {
        fs.writeFile("public/map.jpg", res.response.map.jpgImage, (err) => {
            if (!err)
                console.log("Map wrote.")
            else
                console.error(err);
            setInterval(oneTerm, 1 * 1000);
            initializeDB();
        })
    })
});

s.connect();
app.use(express.static('public'))
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
