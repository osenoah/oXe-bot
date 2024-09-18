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
bot.telegram.setWebhook('')

expressApp.listen(port, ()=> console.log(`Listening on ${port}`));
