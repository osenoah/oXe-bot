const express = require('express');
const expressApp = express();
const path = require('path');
const axios = require('axios');
const port = process.env.PORT || 8080;
const { default: OpenAI } = require('openai');
const fs = require("fs");
const userStates = new Map(); // Track user conversation states

const token = require('dotenv').config();
const splitMessage = (text, maxLength = 4000) => {
    const chunks = [];
    let currentChunk = '';
    
    const lines = text.split('\n');
    
    for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
};


const { Console } = require("console");
const { error } = require('console');
const myLog = new Console({
    stdout: fs.createWriteStream("errStdErr.txt"),
    stderr: fs.createWriteStream("errStdErr.txt")
})


const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN)


expressApp.use(express.static('static'));
expressApp.use(express.json());
expressApp.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname + '/index.json'))
});

// expressApp.listen(port, ()=> myLog.log(`Listening on ${port}`));

//start process
bot.command('start', ctx =>{
    myLog.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `Yo!!😜 This is the oXe-🤖.\nClick /features to see what i can do.`,{
    })
});

//features
bot.command('features', ctx =>{
    myLog.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `/eth For ETH price\n/btc For BTC price\n/sol For SOL price\n/weather For weather\n/manga To pull up an anime manga\n/gemini For an AI Chat`)
});

//check ETH price
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

//check BTC price
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
});

//check SOL price
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

// check weather
bot.command('weather', ctx => {
    myLog.log(ctx.from)
    const chatId = ctx.chat.id;
    
    userStates.set(chatId, { waitingFor:'weather_city'});
    
    bot.telegram.sendMessage(
        chatId, 
        `Which city would you like the weather for?🌤️`
    );
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



// AI CHAT
const openai = new OpenAI({apiKey: process.env.OPEN_AI});
myLog.log("OpenAI API Key exists:", !!process.env.OPEN_AI);

bot.command('chatgpt', ctx => {
    myLog.log(ctx.from);
    const chatId = ctx.chat.id;

    userStates.set(chatId, {waitingFor: 'chatgpt_question'});
    
    bot.telegram.sendMessage(
        chatId, 
        `What would you like me to explain? 🤖`
    );
});

// AI but GEMINI
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

bot.command('gemini', ctx => {
    myLog.log(ctx.from);
    const chatId = ctx.chat.id;

    userStates.set(chatId, {waitingFor: 'gemini_question'});
    
    bot.telegram.sendMessage(
        chatId, 
        `What would you like me to explain? 🤖`
    );
});


// OLD ANIME CODE
/* //anime feature: bring up manga panels OR a RANDOM anime Image.
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
                        // myLog.log("API Response:", panels);
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
                        chatId, `No theme for <b>${search}</b>🤨`, {
                            parse_mode: "HTML"
                    }
    );
    } error => {
            myLog.log("error", error);
            bot.telegram.sendMessage(
            chatId, `Theme for <b>${search}</b> unavailable 🤨`, {
            parse_mode: "HTML"
    })}
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
     }); */





//UPDATED anime feature: bring up manga panels OR a RANDOM anime Image.
bot.command('manga', ctx => {
    myLog.log(ctx.from)
    const chatId = ctx.chat.id;
    
   
    userStates.set(chatId, {waitingFor: 'manga_theme'});
    
    bot.telegram.sendMessage(
        chatId, 
        `What theme would you like to see? 😏`
    );
});

const vog = (search) => (`https://api.panelsdesu.com/v1/search?q=${search}`);
const des = (panels) => {
    `${panels.description}`
};
const getPhotoUrl = (panels) => `${panels.image_url}`;
const getRandomPanel = (panels) => {
    const randomIndex = Math.floor(Math.random() * panels.length);
    return panels[randomIndex]; 
};

const aniP = (search, chatId) => {
    const fig = vog(search);
    axios.get(fig).then((resp) => { 
        const { panels }= resp.data;
        myLog.log("API Endpoint:", fig);
        
        if (panels && panels.length > 0) {
            const randomPanel = getRandomPanel(panels);
            const photoUrl = getPhotoUrl(randomPanel); 
            const description = des(randomPanel);
            
            bot.telegram.sendPhoto(
                chatId, photoUrl, {
                    caption: description,
                    parse_mode: "HTML"
                }
            );
        } else {
            bot.telegram.sendMessage(
                chatId, `No theme for <b>${search}</b> 🤨`, {
                    parse_mode: "HTML"
                }
            );
        }
    }).catch(error => {
        myLog.log("error", error);
        bot.telegram.sendMessage(
            chatId, `Theme for <b>${search}</b> unavailable 🤨`, {
                parse_mode: "HTML"
            }
        );
    });
};



//BOT ON
bot.on('text', ctx => {
    const chatId = ctx.chat.id;
    const userState = userStates.get(chatId);
    
   if (userState && userState.waitingFor === 'gemini_question') {
    const question = ctx.message.text.trim();
    
    userStates.delete(chatId);
    
    bot.telegram.sendMessage(chatId, '🤔 Calm...');
    
    const prompt = `You are a helpful assistant using 'Domain Expansion: Infinite Wisdom' to explain things clearly.\n\nUser question: ${question}`;
    
    model.generateContent(prompt)
        .then(result => {
            const response = result.response;
            const aiResponse = response.text();
            
            // Split message if it's too long
            const chunks = splitMessage(aiResponse);
            
            // Send each chunk
            chunks.forEach((chunk, index) => {
                setTimeout(() => {
                    bot.telegram.sendMessage(chatId, chunk);
                }, index * 500); // 500ms delay between messages
            });
        })
        .catch(error => {
            myLog.log("Gemini error:", error.message);
            bot.telegram.sendMessage(
                chatId, 
                `Sorry, I couldn't process that right now. Please try again! 😢`
            );
        });
}

    // Handle ChatGPT question
    if (userState && userState.waitingFor === 'chatgpt_question') {
        const question = ctx.message.text.trim();
        
        userStates.delete(chatId);
        
        bot.telegram.sendMessage(chatId, '🤔 Calm...');
        
        openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: question
                },
                {
                    role: 'user',
                    content: question
                }
            ],
            temperature: 0.7,
        })
        .then(response => {
            const aiResponse = response.choices[0].message.content;
            bot.telegram.sendMessage(chatId, aiResponse);
        })
        .catch(error => {
            myLog.log("OpenAI error:", error);
            myLog.log("Full OpenAI error:", JSON.stringify(error, null, 2));
            myLog.log("Error message:", error.message);
            myLog.log("Error status:", error.status);
            myLog.log("Error code:", error.code);
            
            bot.telegram.sendMessage(
                chatId, 
                `Sorry, I couldn't process that. BooHoo 😢`
            );
        });
    }
    // Handle weather city
    else if (userState && userState.waitingFor === 'weather_city') {
        const city = ctx.message.text.trim();
        userStates.delete(chatId);
        getCityWeather(chatId, city);
    }
    // Handle manga theme
    else if (userState && userState.waitingFor === 'manga_theme') {
        const search = ctx.message.text.trim();
        userStates.delete(chatId);
        aniP(search, chatId);
    }
});


bot.launch();

//add health advice
//add code that checks details of a token maybe DEXScreener's API
//add code that gives an Update on Matches for EPL, Laliga,  Serie A and Bundensliga
//add code that
//add meme feature