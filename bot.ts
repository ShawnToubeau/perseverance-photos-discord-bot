import {Client, Message, TextChannel} from 'discord.js';
import { config } from "dotenv";
import {GetRawImages} from "./marsScraper";

config();

const client = new Client();
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.on('ready', async () => {
    // getMissingImages()
    // getMessagesInChannel(CHANNEL_ID)
    //     .then(msgs => {
    //         msgs.forEach(msg => console.log("MSG: ", msg))
    //     })


    // console.log("Cache", channel.messages.cache)
    // console.log("?", channel.messages.cache.entries())
    // const sentImages = new Set();
    // retrieve messages from the channel
    // channel.messages.cache.forEach(msg => {
    //     console.log(msg);
    // })
});

const getChannel = (): TextChannel => {
    return client.channels.cache.get(CHANNEL_ID) as TextChannel;
}

/**
 * getMessagesInChannel retrieves all messages within a specific channel.
 *
 * @returns {Promise<Message[]>} - channel messages
 */
const getMessagesInChannel = async (): Promise<Message[]> => {
    return new Promise(((resolve, reject) => {
        getChannel().messages.fetch()
            .then(res => {
                resolve(res.array());
            })
            .catch(e => {
                reject(`error fetching channel messages: ${e}`)
            })
    }))
}

/**
 * deleteMessagesInChannel deletes all messages from a channel.
 *
 * @returns {Promise<string>} - message deletion result
 */
const deleteMessagesInChannel = async (): Promise<string> => {
    return new Promise(((resolve, reject) => {
        console.log("deleting images in channel..")
        getMessagesInChannel().then((messages) => {
            const deleteReqs: Promise<Message>[] = [];

            messages.forEach(msg => {
                deleteReqs.push(msg.delete())
            })

            Promise.all(deleteReqs)
                .then(delRes => {
                    resolve(`number of messages deleted: ${delRes.length}`);
                }).catch(err => {
                    reject(`error deleting messages in channel: ${err}`)
            })
        })
    }))
}

/**
 * getOne adds one image to a channel.
 */
const addOne = () => {
    GetRawImages().then(srcs => {
        if (srcs.length > 0) {
            const first = srcs[1];

            getChannel().send({files: [first]})
                .then(() => {
                    console.log("one image added to channel")
                })
                .catch(console.error)
        }
    })
}

const getImagesNamesInChannel = (): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
        getMessagesInChannel()
            .then(messages => {
                let images: string[] = [];

                messages.forEach(msg => {
                    if (msg.author.bot) {
                        msg.attachments.forEach(img => {
                            images.push(img.name)
                        })
                    }
                })

                resolve(images)
            })
            .catch(reject)
    })
}

const getMissingImages = (): Promise<string> => {
    return new Promise<string>(((resolve, reject) => {
        GetRawImages()
            .then(sources => {
                // console.log("Srcs", sources)

                if (sources.length > 0) {
                    getImagesNamesInChannel()
                        .then(presentImages => {
                            // console.log("Messages", images)
                            const groupGroups: string[][] = []
                            let imgGroups: string[] = []
                            const channel = getChannel();

                            sources.forEach((src, idx) => {
                                if (!presentImages.some(presentImage => src.includes(presentImage))) {
                                    if (idx !== 0 && idx % 10 === 0) {
                                        groupGroups.push(imgGroups)
                                        imgGroups = []
                                    }

                                    imgGroups.push(src)
                                }
                            })

                            // get last remaining images
                            if (imgGroups.length > 0) {
                                groupGroups.push(imgGroups)
                            }

                            const addReqs: Promise<Message>[] = []

                            groupGroups.forEach(group => {
                                addReqs.push(channel.send({files: group}))
                            })

                            console.log(`adding ${groupGroups.reduce((count, row) => count + row.length, 0)} images..`)
                            Promise.all(addReqs)
                                .then(res => {
                                    console.log(res)
                                    resolve(`${res.reduce((count, row) => count + row.attachments.array().length, 0)} images added to channel`)
                                })
                                .catch(e => {
                                    reject(`error adding images to channel: ${e}`)
                                })
                        })
                        .catch(reject)
                }
            })
            .catch(reject)
    }))
}

client.on('message', msg => {
    if (msg.content === "clear") {
        deleteMessagesInChannel()
            .then(console.log)
            .catch(console.error)
    }

    if (msg.content === "add1") {
        addOne();
    }

    if (msg.content === "missing") {
        getMissingImages()
            .then(console.log)
            .catch(console.error)
    }
});

client.login(TOKEN).then(() => {
    console.log("Bot logged in.")
}).catch(err => {
    console.error(`Error logging in: ${err}`)
})