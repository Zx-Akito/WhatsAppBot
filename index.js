const qrcode = require('qrcode-terminal');
const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');


const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one"
    })
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    console.log('logged in', session)
});


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {

});

client.on('message', message => {
    if (message.body === 'السود عيونه') {
        // message.reply('pong');
        console.log('from', message.from)
        client.sendMessage(message.from, 'يا ولاه');
    }
});

client.initialize();