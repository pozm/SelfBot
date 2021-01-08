import {Client, TextChannel} from "discord.js";

async function main (  [channel, user, ...msg]: string[] , line : string, client : Client ) {
    if (!channel || !user)
        throw "Unable to get user or channel"
    let c = (client.channels.get(channel) as TextChannel)
    if (c?.type !== "text") throw "channel is not a text channel!"
    c.send(`<@${user}> ${msg?.join?.(" ") ?? ""}`).then(msg=>msg.delete())
}