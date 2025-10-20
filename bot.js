const express = require('express');
const expressApp = express();
const path = require('path');
const axios = require('axios');
const port = process.env.PORT || 8080;
//const { default: OpenAI } = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
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


// AI but GEMINI
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


// OLD ANIME GENERATOR CODE
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


//TOKEN CHECKER - may just be in a new project
// const Moralis = require('moralis').default;
// const { EvmChain } = require('@moralisweb3/common-evm-utils');


//     let moralisStarted = false;
//     const startMoralis = async () => {
//         if (!moralisStarted) {
//             await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
//             moralisStarted = true;
//         }
//     };

//     const detectChain = (address) => {
//   const prefix = address.slice(0, 2);
//   if (prefix !== "0x") return EvmChain.ETHEREUM; //fallback

//   // You can add more sophisticated detection here later
//   // For now, check by known patterns / user preferences:
//   const possibleChains = [
//     EvmChain.ETHEREUM,
//     EvmChain.BSC,
//     EvmChain.POLYGON,
//     EvmChain.ARBITRUM,
//     EvmChain.BASE,
//     EvmChain.AVALANCHE,
//     EvmChain.OPTIMISM
//   ];
//   // Default fallback
//   return EvmChain.ETHEREUM;
// };

//         bot.command('tokencheck', ctx => {
//             myLog.log(ctx.from)
//             const chatId = ctx.chat.id;
        
//             userStates.set(chatId, {waitingFor: 'token_addy'});
            
//             bot.telegram.sendMessage(
//                 chatId, 
//                 `Send the addy!`
//             );
//         });


// const checkToken = async (chatId, address, username) => {
//     try {
//         // Search for the token across all networks
//         const searchUrl = `https://api.geckoterminal.com/api/v2/search/pools?query=${address}`;
//         const searchResponse = await axios.get(searchUrl);
        
//         if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
//             bot.telegram.sendMessage(chatId, `❌ Token not found or no liquidity pools exist yet.`);
//             return;
//         }
        
//         // Get the first pool (usually the main one)
//         const pool = searchResponse.data.data[0];
//         const poolAddress = pool.id;
//         const network = pool.relationships.network.data.id;
        
//         // Get detailed pool info
//         const poolUrl = `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}`;
//         const poolResponse = await axios.get(poolUrl);
//         const poolData = poolResponse.data.data;
//         const attributes = poolData.attributes;
        
//         // Extract token info
//         const tokenName = attributes.name;
//         const baseToken = attributes.base_token_price_usd;
//         const marketCap = attributes.market_cap_usd;
//         const fdv = attributes.fdv_usd;
//         const volume24h = attributes.volume_usd.h24;
//         const liquidity = attributes.reserve_in_usd;
//         const priceChangeH24 = attributes.price_change_percentage.h24;
//         const txnsH24Buys = attributes.transactions.h24.buys;
//         const txnsH24Sells = attributes.transactions.h24.sells;
//         const poolCreated = attributes.pool_created_at;
        
//         // Calculate age
//         const createdDate = new Date(poolCreated);
//         const now = new Date();
//         const ageMs = now - createdDate;
//         const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
//         const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
//         // Format numbers
//         const formatNum = (num) => {
//             if (!num) return 'N/A';
//             if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
//             if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
//             return `$${parseFloat(num).toFixed(2)}`;
//         };
        
//         // DexScreener link
//         const dexLink = `https://dexscreener.com/${network}/${poolAddress}`;
        
//         // Build message
//         const message = `
// 🔍 <b>Token Check by @${username}</b>

// 📛 <b>Name:</b> ${tokenName}
// 📍 <b>CA:</b> <code>${address}</code>

// 💰 <b>Price:</b> $${parseFloat(baseToken).toFixed(8)}
// 📊 <b>Market Cap:</b> ${formatNum(marketCap)}
// 💎 <b>FDV:</b> ${formatNum(fdv)}
// 📈 <b>24h Volume:</b> ${formatNum(volume24h)}
// 💧 <b>Liquidity:</b> ${formatNum(liquidity)}

// 📉 <b>24h Change:</b> ${priceChangeH24 ? priceChangeH24.toFixed(2) : 'N/A'}%
// ⏰ <b>Age:</b> ${ageDays}d ${ageHours}h

// 🛒 <b>Buys (24h):</b> ${txnsH24Buys}
// 🛍️ <b>Sells (24h):</b> ${txnsH24Sells}

// 🔗 <a href="${dexLink}">View on DexScreener</a>
//         `.trim();
        
//         bot.telegram.sendMessage(chatId, message, {
//             parse_mode: 'HTML',
//             disable_web_page_preview: true
//         });
        
//     } catch (error) {
//         myLog.log("Token check error:", error.response?.data || error.message);
//         bot.telegram.sendMessage(
//             chatId, 
//             `❌ Error checking token. Make sure the address is correct!`
//         );
//     }
// };


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
bot.on('text', async ctx => {
    const chatId = ctx.chat.id;
    const userState = userStates.get(chatId);

    // Handles Gemini
   if (userState && userState.waitingFor === 'gemini_question') {
    const question = ctx.message.text.trim();
    
    userStates.delete(chatId);
    
    bot.telegram.sendMessage(chatId, '🤔 Calm...');
    
    const prompt = `Explain\n\nUser question: ${question}`;
    
    model.generateContent(prompt)
        .then(result => {
            const response = result.response;
            const aiResponse = response.text();
            
            const chunks = splitMessage(aiResponse);
            
            chunks.forEach((chunk, index) => {
                setTimeout(() => {
                    bot.telegram.sendMessage(chatId, chunk);
                }, index * 500); 
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
    // Handle token
//     else if (userState && userState.waitingFor === 'token_addy') {
//     const address = ctx.message.text.trim();
//     const username = ctx.from.username || "Anonymous";
    
//     userStates.delete(chatId);
    
//     bot.telegram.sendMessage(chatId, '🔍 Checking token...');
    
//     await checkToken(chatId, address, username);
// }

}) 

bot.launch();

//add code that checks details of a token maybe DEXScreener's API
//add code that gives an Update on Matches for EPL, Laliga,  Serie A and Bundensliga
//add code that
//add meme feature
//link to vercel