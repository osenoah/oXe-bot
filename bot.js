const express = require('express');
const expressApp = express();
const path = require('path');
const axios = require('axios');
const port = process.env.PORT || 3000;
expressApp.use(express.static('static'));
expressApp.use(express.json());
require('dot.env').config();

const { Telegraf } = require('telegraph')

const bot = new Telegraf(process.env.BOT_TOKEN)

expressApp.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname + '/index.html'))
})

expressApp.use(bot.webhookCallback('/secret-path'))
bot.telegram.setWebhook('https://o-xe-bot.vercel.app//secret-path')

expressApp.listen(port, ()=> console.log(`Listening on ${port}`));

//start process
bot.command('start', ctx =>{
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'Yo!!😜 This is the oXe-🤖.nClick /features to see what i can do.',{
    })
});

//check ethereum rate
bot.command('eth', ctx =>{
    var rate;
    console.log(ctx.from);
    axios.get()
    .then(response => {
        console.log(response.data);
        rate = response.data.eth
        const message = `Ethereum is $${rate.usd}`
        bot.telegram.sendMessage(ctx.chat.id, message, {
        })
    })
})

//check weather