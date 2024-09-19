const express = require('express');
const expressApp = express();
const path = require('path');
const axios = require('axios');
const port = process.env.PORT || 3000;
expressApp.use(express.static('static'));
expressApp.use(express.json());
// const token = ();
require('dotenv').config();

const { Telegraf } = require('telegraf');
const { error } = require('console');

const bot = new Telegraf(process.env.BOT_TOKEN)

expressApp.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname + '/index.html'))
});

// expressApp.use(bot.webhookCallback('/secret-path'))
// bot.telegram.setWebhook(`https://localhost:3000bot${token}/secret-path`);

expressApp.listen(port, ()=> console.log(`Listening on ${port}`));

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
});
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
});
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
        console.log("API Endpoint:", endpoint);

bot.telegram.sendMessage(
    chatId, 
    weatherFeedback(name, main, weather[0], wind, clouds), {
        parse_mode: "HTML"
    }
);}, 
    error => {
        console.log("error", error);
        bot.telegram.sendMessage(
            chatId, `Weather for ${city} unavailable🤨`, {
                parse_mode: "HTML"
        }
    );
});
}
// check weather
bot.command('weather', ctx =>{
    console.log(ctx.from)
    const chatId = ctx.chat.id;
    const city = ctx.message.text.split(' ')[[1]];

    if (city === undefined) {
        bot.telegram.sendMessage(
            chatId, `Please provide city name as \n/weather 'city'`
        );
        return;
    } else {
    getCityWeather(chatId, city);
}});

//add clear feature: that clears all messages

//add meme feature

//add anime feature:
bot.launch();