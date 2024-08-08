const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const schedule = require('node-schedule');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    },
    webVersionCache: { 
        type: 'remote', 
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
    authStrategy: new LocalAuth({ clientId: "client" })
});
const config = require('./config/config.json');

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.clear();
    console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Ready!`.green);

    // Jadwalkan pengiriman pesan
    scheduleMessages([
        { time: '08:00', groupId: '120363177308785364@g.us', message: 'Selamat pagi, Rifki Sayang!' },
        { time: '12:00', groupId: '120363177308785364@g.us', message: 'Selamat siang, jangan lupa makan ya Rifki Sayang!' },
        { time: '17:00', groupId: '120363177308785364@g.us', message: 'Selamat sore, Rifki Sayang!' },
        { time: '22:00', groupId: '120363177308785364@g.us', message: 'Selamat malam, Rifki Sayang!' },
        { time: '00:00', groupId: '120363177308785364@g.us', message: 'Udah malem, cepet tidur ga!' },
    ]);
});

client.on('message', async message => {
    const isGroup = message.from.endsWith('@g.us');
    console.log(message.from);
    if (!isGroup && !config.groups) return;

    switch (message.body.toLowerCase()) {
        case `${config.prefix}ping`:
            if (message.author === config.ownerId) checkPing(message);
        break;
    }
});

const checkPing = async (message) => {
    const startTime = Date.now();
    await client.sendMessage(message.from, 'Pong!');
    const latency = Date.now() - startTime;
    await client.sendMessage(message.from, `Latency: ${latency} ms`);
}

// Fungsi untuk menjadwalkan beberapa pengiriman pesan ke grup
const scheduleMessages = (messages) => {
    messages.forEach(({ time, groupId, message }) => {
        const [hour, minute] = time.split(':');
        const rule = new schedule.RecurrenceRule();
        rule.hour = parseInt(hour);
        rule.minute = parseInt(minute);
        rule.tz = config.timezone;

        schedule.scheduleJob(rule, async () => {
            try {
                await client.sendMessage(groupId, message);
                console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Message sent to group ${groupId}: ${message}`.green);
            } catch (error) {
                console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Failed to send message to group ${groupId}:`.red, error);
            }
        });
    });
};

client.initialize();
