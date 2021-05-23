const axios = require('axios');
const server = require('@liamcottle/rustplus.js');

const d_end = 'https://discord.com/api/webhooks/846019656039923733/WKpz1JPPGXyca373W-_kecGGSC5OVcLRO6JN3O68bQw1n-cSplS_mkeWJ1TGxAPvzdo-';
var s = new server('108.61.205.238', '28082', '76561198935889907', '-311123564')
var current = 0;


async function oneTerm() {

    var now = new Date();
    console.log('searching...')

    if (now.getHours() == 7 && (now.getMinutes()) == 0) {
        await axios.post(
            d_end,
            { content: ':bread:' }
        )
        return;
    }

    if (now.getHours() == 0 && (now.getMinutes()) == 0) {
        await axios.post(
            d_end,
            { content: '寝るぞ！' }
        )
        return;
    }
    if (0 < now.getHours() && now.getHours() < 7) {
        console.log('out of time')
        return;
    }
    var res = await new Promise((resolve) => s.getMapMarkers((res) => resolve(res)))
    res.response.mapMarkers.markers.forEach(async (data) => {
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
    await axios.post(
        d_end,
        { content: 'Gooooooooooood morning <3' }
    );
    
    setInterval(oneTerm, 60 * 1000);
});

s.connect();
