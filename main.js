import axios from 'axios';
import fs from 'fs';
import server from '@liamcottle/rustplus.js';
import express from 'express';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import {generateCargo, generateHeli} from './embed.js';

dotenv.config();

const app = express();
const port = 3030
const d_end = process.env.ENDPOINT;
console.log(process.env.SECRET)
var s = new server('206.71.159.131', '28083', '76561198935889907', process.env.SECRET)

var current_cargo = 0;
var current_heli = 0;

const NOSEND = false;

function initializeDB(){
    const db1 = new sqlite3.Database("member.db")
    db1.serialize(() => {
        db1.run('create table if not exists member(time, name, x, y, spawnTime, deathTime)')
    });
    db1.close();
    const db2 = new sqlite3.Database("shop.db")
    db2.serialize(() => {
        db2.run('create table if not exists shop(time, name, id, x, y, currencyId, costPerItem, itemId, amountInStock, quantity)')
    });
    db2.close();
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
        console.log('team db')
        const db = new sqlite3.Database("member.db")
        db.serialize(() => {
        message.response.teamInfo.members
            .forEach(({ name, x, y, spawnTime, deathTime }) => {
                db.run('insert into member values(?, ?, ?, ?, ?, ?)', [new Date().getTime(), name, x, y, spawnTime, deathTime])
            });
        });
        db.close();
        console.log('team cl')
    });

    
    // cargo
    await Promise.all(res.response.mapMarkers.markers.map(async (data) => {
        if (data.type === 5 && data.id !== current_cargo) {
            console.log("CARGO INCOMMING")
            current_cargo = data.id
            await sendMessage(
                { content: '', embeds: [ generateCargo() ] }
            )
        }

        if (data.type === 8 && data.id !== current_heli) {
            console.log("CARGO INCOMMING")
            current_heli = data.id
            await sendMessage(
                { content: '', embeds: [ generateHeli() ] }
            )
        }
    }));

    
    console.log('cg db')
    const db = new sqlite3.Database("shop.db")
    db.serialize(() => {
    res.response.mapMarkers.markers.forEach( (data) => {
        if (data.type === 3) {
            let shop_name = data.name;
            let shop_id = data.id;
            let x = data.x;
            let y = data.y;
                data.sellOrders.forEach((order) => {
                    db.run('insert into shop values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [new Date().getTime(), shop_name, shop_id, x, y, order.currencyId, order.costPerItem, order.itemId, order.amountInStock, order.quantity])
                })
            }
        })
    })
    db.close();
    console.log('cg db cls')
}

initializeDB();
s.on('connected', async () => {
    console.info('connected')
    // sendMessage({content: 'hello'});
    s.getMap((res) => {
        fs.writeFile("public/map.jpg", res.response.map.jpgImage, (err) => {
            if (!err)
                console.log("Map wrote.")
            else
                console.error(err);
            setInterval(oneTerm, 1 * 3000);
        })
    })
});

s.connect();
app.use(express.static('public'))
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
