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
            console.log(data.green);
        }
        console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Ready!`.green);
    });

    // Jadwalkan pesan setiap jam 8 pagi WIB
    const rule = new schedule.RecurrenceRule();
    rule.tz = config.timezone;
    rule.hour = 8;
    rule.minute = 0;

    const groupId = '120363177308785364@g.us'; // Ganti dengan ID chat tujuan
    schedule.scheduleJob(rule, () => {
        client.sendMessage(groupId, "Selamat pagi Rifki!");
        client.sendMessage(groupId, "Selamat pagi Galuh!");
        client.sendMessage(groupId, "Selamat pagi Wildan!");
    });
});

client.on('message', async message => {
    const isGroup = message.from.endsWith('@g.us');
    if (!isGroup && !config.groups) return;

    switch (message.body) {
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

// Fungsi untuk mengunduh video YouTube
const downloadYouTubeVideo = async (url) => {
    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const stream = ytdl(url, { filter: 'audioandvideo' });
        const filePath = path.join(__dirname, 'downloads', `${title}.mp4`);

        // Buat direktori jika belum ada
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        return new Promise((resolve, reject) => {
            stream.pipe(fs.createWriteStream(filePath))
                .on('finish', () => resolve(filePath))
                .on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading video:', error);
        throw error;
    }
};

client.initialize();