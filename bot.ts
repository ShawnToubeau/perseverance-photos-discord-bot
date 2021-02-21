import { Client, TextChannel } from 'discord.js';
import { config } from "dotenv";
import {GetRawImages} from "./marsScraper";

config();

const client = new Client();
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.on('ready', async () => {
    const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;
    // console.log("Channel", channel)
    // console.log("Channel message", channel.messages)
    channel.messages.fetch().then(res => {
        console.log(res)
    })
    // console.log("Cache", channel.messages.cache)
    // console.log("?", channel.messages.cache.entries())
    const sentImages = new Set();
    // retrieve messages from the channel
    // channel.messages.cache.forEach(msg => {
    //     console.log(msg);
    // })
});

client.on('message', msg => {




    // if (msg.content === 'ping') {
    //     GetRawImages().then(srcs => {
    //         console.log("Sources", srcs)
    //
    //         if (srcs.length > 0) {
    //             const first = srcs[1];
    //
    //             channel.send({files: [first]}).then();
    //         }
    //     })
    // }
});

client.login(TOKEN).then(() => {
    console.log("Bot logged in.")
}).catch(err => {
    console.error(`Error logging in: ${err}`)
})