
require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// openai key
apiKey2 = process.env.OPENAI_API_KEY;


// create LINE SDK client
const client = new line.Client(config);

// create Express app
const app = express();

// register a webhook handler with middleware
app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

//event handler
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text'){
        return Promise.resolve(null);
    }
    //openai api chat3.5
    const configuration = new Configuration({ apiKey: apiKey2 });
    const openai = new OpenAIApi(configuration);

    const openaiResponse = await openai.createChatCompletion({
        //model type
        model: 'gpt-3.5-turbo',

        //message
        messages: [ 
            { role:'system',content: 'You are a helpful assistant.'  },
            { role:'user',content: event.message.text  },
         ],
         //max tokens
        maxTokens: 2000,
        //temperature
        temperature: 0.2,
    });
    //reply
    const assistantReply = openaiResponse.data.choices[0].message.content;
    const reply = { type: 'text', text: assistantReply };
    return client.replyMessage(event.replyToken, reply);
}
// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});