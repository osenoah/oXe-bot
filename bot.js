const express = require('express');
const expressApp = express();
const path = require('path');
const axios = require('axios');
const port = process.env.PORT || 3000;
expressApp.use(express.static('static'));
expressApp.use(express.json());
// const token = ();
require('dotenv').config();

const { Console } = require("console");
const fs = require("fs");
const myLog = new Console({
    stdout: fs.createWriteStream("botStdout.txt"),
    stderr: fs.createWriteStream("errStdErr.txt")
})

const { Telegraf } = require('telegraf');
const { error } = require('console');

const bot = new Telegraf(process.env.BOT_TOKEN)

expressApp.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname + '/index.json'))
});

expressApp.listen(port, ()=> myLog.log(`Listening on ${port}`));

//start process
bot.command('start', ctx =>{
    myLog.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `Yo!!😜 This is the oXe-🤖.\nClick /features to see what i can do.`,{
    })
});

//features
bot.command('features', ctx =>{
    myLog.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `/eth For ETH price\n/btc For BTC price\n/weather For weather\n/sol For SOL price`)
});
//check ethereum rate
bot.command('eth', ctx =>{
    var rate;
    myLog.log(ctx.from);
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`)
    .then(response => {
        myLog.log(response.data);
        rate = response.data.ethereum
        const message = `Ethereum is $${rate.usd}`
        bot.telegram.sendMessage(ctx.chat.id, message, {
        })
    })
});
bot.command('btc', ctx =>{
    var rate;
    myLog.log(ctx.from);
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`)
    .then(response => {
        myLog.log(response.data);
        rate = response.data.bitcoin
        const message = `Bitcoin is $${rate.usd}`
        bot.telegram.sendMessage(ctx.chat.id, message, {
        })
    })
})
bot.command('sol', ctx =>{
    var rate;
    myLog.log(ctx.from);
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`)
    .then(response => {
        myLog.log(response.data);
        rate = response.data.solana
        const message = `Solana is $${rate.usd}`
        bot.telegram.sendMessage(ctx.chat.id, message, {
        })
    })
});


const appID = (process.env.APP_ID);
const appURL = (city) => ( 
    `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${appID}`
);


const weatherFeedback = (name, main, weather, wind, clouds) => (
    `Weather in <b>${name}</b>\n
    ${weather.main} - ${weather.description}\n
    Temperature: <b>${main.temp}°C</b>\n
    Pressure: <b>${main.pressure}hpa</b>\n
    Humidity: <b>${main.humidity}%</b>\n
    Wind: <b>${wind.speed}m/s</b>\n
    Clouds: <b>${clouds.all}%</b>\n
    `
);
const getCityWeather = (chatId, city) =>{
    const endpoint = appURL(city);
        axios.get(endpoint).then((resp) => {
        const { name, main, weather, wind, clouds } = resp.data;
        myLog.log("API Endpoint:", endpoint);

bot.telegram.sendMessage(
    chatId, 
    weatherFeedback(name, main, weather[0], wind, clouds), {
        parse_mode: "HTML"
    }
);}, 
    error => {
        myLog.log("error", error);
        bot.telegram.sendMessage(
            chatId, `Weather for <b>${city}</b> unavailable🤨`, {
                parse_mode: "HTML"
        }
    );
});
}
// check weather
bot.command('weather', ctx =>{
    myLog.log(ctx.from)
    const chatId = ctx.chat.id;
    const city = ctx.message.text.split(' ').slice(1).join(' ');

    if (city === undefined) {
        bot.telegram.sendMessage(
            chatId, `Please provide city name as \n/weather 'city'`
        );
        return;
    } else {
    getCityWeather(chatId, city);
}});

//add clear feature: that clears all messages

//add mention feature

//add health advice

//add meme feature

//add gif feature

//add anime feature: bring up manga panels OR a RANDOM anime Image.
const { default: Undici } = require('undici');

const vog = (search) => (`https://api.panelsdesu.com/v1/search?q=${search}`);

const des = (panels) => {
    `${panels.description}`
};
const getPhotoUrl = (panels) => `${panels.image_url}`;
const getRandomPanel = (panels) => {
    const randomIndex = Math.floor(Math.random() * panels.length);
    return panels[randomIndex]; 
};
// myLog.log(des);
const aniP = (search, chatId) => {
    const fig = vog(search);
        axios.get(fig).then((resp) => { 
            const { panels }= resp.data;
                myLog.log("API Endpoint:", fig);
                myLog.log("API Response:", panels);
        if (panels && panels.length > 0) {
            const randomPanel = getRandomPanel(panels);
            const photoUrl = getPhotoUrl(randomPanel); 
            const description = des(randomPanel);
                bot.telegram.sendPhoto(
                    chatId, photoUrl,
                    des(panels[0]), {
                        caption: description,
                        parse_mode: "HTML"
                    }
    );} else {
        bot.telegram.sendMessage(
                chatId, `No theme for <b>${search}</b> unavailable🤨`, {
                    parse_mode: "HTML"
            }
    );
}
    error => {
        myLog.log("error", error);
         bot.telegram.sendMessage(
         chatId, `Theme for <b>${search}</b> unavailable 🤨`, {
        parse_mode: "HTML"
});
}
})};
bot.command('manga', ctx => {
    myLog.log(ctx.from)
    const chatId = ctx.chat.id;
    const search = ctx.message.text.split(' ')[1];

    if(search === undefined) {
        bot.telegram.sendMessage(
            chatId, `What would you want to see😏\n/manga 'theme'`
        );
        return;
    } else {
    aniP(search, chatId);
}
})
bot.launch();