const express = require('express');
const expressApp = express();
const path = require('path');
const axios = require('axios');
const port = process.env.PORT || 3000;
expressApp.use(express.static('static'));
expressApp.use(express.json());
const token = (process.env.BOT_TOKEN);
require('dotenv').config();

const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

expressApp.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname + '/index.html'))
})

// expressApp.use(bot.webhookCallback('/secret-path'))
// bot.telegram.setWebhook(`https://api.telegram.org/bot${token}/secret-path`);

// expressApp.listen(port, ()=> console.log(`Listening on ${port}`));

//start process
bot.command('start', ctx =>{
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `Yo!!😜 This is the oXe-🤖.\nClick /features to see what i can do.`,{
    })
});

//features
bot.command('features', ctx =>{
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `/eth For ETH price\n/btc For BTC price\n/weather For weather\n/sol For SOL price`)
})
//check ethereum rate
bot.command('eth', ctx =>{
    var rate;
    console.log(ctx.from);
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`)
    .then(response => {
        console.log(response.data);
        rate = response.data.ethereum
        const message = `Ethereum is $${rate.usd}`
        bot.telegram.sendMessage(ctx.chat.id, message, {
        })
    })
})
bot.command('btc', ctx =>{
    var rate;
    console.log(ctx.from);
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`)
    .then(response => {
        console.log(response.data);
        rate = response.data.bitcoin
        const message = `Bitcoin is $${rate.usd}`
        bot.telegram.sendMessage(ctx.chat.id, message, {
        })
    })
})
bot.command('sol', ctx =>{
    var rate;
    console.log(ctx.from);
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`)
    .then(response => {
        console.log(response.data);
        rate = response.data.solana
        const message = `Solana is $${rate.usd}`
        bot.telegram.sendMessage(ctx.chat.id, message, {
        })
    })
})

bot.command('weather', ctx =>{
    
})

//check weather
bot.launch();