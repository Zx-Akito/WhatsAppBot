const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const schedule = require('node-schedule');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');

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
    ffmpeg: './ffmpeg.exe',
    authStrategy: new LocalAuth({ clientId: "client" })
});
const config = require('./config/config.json');

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.clear();
    const consoleTextPath = path.join(__dirname, 'config', 'console.txt');
    fs.readFile(consoleTextPath, 'utf-8', (err, data) => {
        if (err) {
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Console Text not found!`.yellow);
        } else {
            console.log(data.blue);
        }
        console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Ready!`.green);
    });

    // Jadwalkan pengiriman pesan
    scheduleMessage('08:00', '120363177308785364@g.us', 'Selamat pagi, Rifki!');
    scheduleMessage('08:00', '120363177308785364@g.us', 'Selamat pagi, Galuh!');
    scheduleMessage('08:00', '120363177308785364@g.us', 'Selamat pagi, Wildan!');

    // Jadwalkan pengiriman pesan
    scheduleMessage('12:00', '120363177308785364@g.us', 'Selamat siang, Rifki!');
    scheduleMessage('12:00', '120363177312785364@g.us', 'Selamat siang, Galuh!');
    scheduleMessage('12:00', '120363177312785364@g.us', 'Selamat siang, Wildan!');

    // Jadwalkan pengiriman pesan
    scheduleMessage('17:00', '120363177308785364@g.us', 'Selamat sore, Rifki!');
    scheduleMessage('17:00', '120363177312785364@g.us', 'Selamat sore, Galuh!');
    scheduleMessage('17:00', '120363177312785364@g.us', 'Selamat sore, Wildan!');

    // Jadwalkan pengiriman pesan
    scheduleMessage('22:00', '120363177308785364@g.us', 'Selamat malam, Rifki!');
    scheduleMessage('22:00', '120363177312785364@g.us', 'Selamat malam, Galuh!');
    scheduleMessage('22:00', '120363177312785364@g.us', 'Selamat malam, Wildan!');
});

client.on('message', async message => {
    const isGroup = message.from.endsWith('@g.us');
    console.log(message.from);
    if (!isGroup && !config.groups) return;

    switch (message.body.toLowerCase()) {
        case `${config.prefix}sticker`:
            handleStickerCreation(message);
            break;
        case `${config.prefix}image`:
            handleStickerToImage(message);
            break;
        default:
            markChatAsSeen(message);
    }
});

// Function to create sticker
const handleStickerCreation = async (message) => {
    try {
        const media = await getMediaFromMessage(message);
        if (media) {
            await client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerName: config.name,
                stickerAuthor: config.author
            });
            await client.sendMessage(message.from, "Success to create sticker!");
        } else {
            await client.sendMessage(message.from, "Reply with an image to create a sticker!");
        }
    } catch (error) {
        console.error(error);
        await client.sendMessage(message.from, "Failed to create sticker!");
    }
};

// Function to convert sticker to image
const handleStickerToImage = async (message) => {
    try {
        const media = await getMediaFromMessage(message);
        if (media) {
            await client.sendMessage(message.from, media);
            await client.sendMessage(message.from, "Success to convert sticker!");
        }
    } catch (error) {
        console.error(error);
    }
};

// Utility function to get media from message
const getMediaFromMessage = async (message) => {
    if (message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            return await quotedMsg.downloadMedia();
        }
    }
    if (message.hasMedia) {
        return await message.downloadMedia();
    }
    return null;
};

// Function to mark chat as seen
const markChatAsSeen = async (message) => {
    const chat = await client.getChatById(message.id.remote);
    await chat.sendSeen();
};

// Fungsi untuk menjadwalkan pengiriman pesan ke grup
const scheduleMessage = (time, groupId, message) => {
    const [hour, minute] = time.split(':');
    const rule = new schedule.RecurrenceRule();
    rule.hour = parseInt(hour);
    rule.minute = parseInt(minute);
    rule.tz = config.timezone;

    schedule.scheduleJob(rule, async () => {
        try {
            await client.sendMessage(groupId, message);
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Message sent to group ${groupId}`);
        } catch (error) {
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Failed to send message to group ${groupId}:`, error);
        }
    });
};

client.initialize();
