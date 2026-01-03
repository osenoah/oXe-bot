const express = require('express');
const expressApp = express();
const path = require('path');
const axios = require('axios');
// const port = process.env.PORT || 8080;
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
    bot.telegram.sendMessage(ctx.chat.id, `𝗬𝗢! 𝗜'𝗺 𝗼𝗫𝗲-🤖. 𝗜 𝘀𝘂𝗺𝗺𝗼𝗻 𝗿𝗮𝗻𝗱𝗼𝗺 𝗺𝗮𝗻𝗴𝗮 𝗽𝗮𝗻𝗲𝗹𝘀 𝗮𝗻𝗱 𝗰𝗼𝗺𝗺𝘂𝗻𝗲 𝗹𝗶𝗸𝗲 𝗮𝗻 𝗔𝗜 𝘀𝗲𝗻𝘀𝗲𝗶.\n𝗖𝗹𝗶𝗰𝗸 /features 𝗮𝗻𝗱 𝗹𝗲𝘁'𝘀 𝗰𝗼𝗺𝗺𝗲𝗻𝗰𝗲.`,{
    })
});

//features
bot.command('features', ctx =>{
    myLog.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, `/manga To generate an anime manga panel\n/gemini For AI Chat`)
});

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
                `Sorry, I couldn't process that right now. Please try again.`
            );
        });
}

    // Handle manga theme
    else if (userState && userState.waitingFor === 'manga_theme') {
        const search = ctx.message.text.trim();
        userStates.delete(chatId);
        aniP(search, chatId);
    }
   

}) 

bot.launch();
