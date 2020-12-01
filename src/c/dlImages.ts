import { Client, TextChannel } from "discord.js";
import {Clamp, DownloadImagesFromMessage, DownloadImagesFromMessages} from "../m/util";
import {Logger} from "../m/Logger";
import chalk from "chalk";

export default async function (  [channelID, before, type, amount] : string[] , line : string, client : Client ) {
    if (!amount) return;
    let channel = client.channels.get(channelID) as TextChannel
    if (!channel) return console.log("Invalid channel");
    if (channel.type != "text") return console.log("Invalid channel type");

    let isAtEnd = false;
    let imagesStolen = 0
    let lastID : string | undefined;
    Logger.DLog("dli","CMD",chalk.keyword("orange"),`${chalk.hex('#6042f5')('dlImages')} > 0/`+amount + '\n')
    while (imagesStolen < Number(amount) && !isAtEnd) {

        let msgs = await channel.fetchMessages({
            before : lastID ?? before,
            limit:Clamp(Number(amount) - imagesStolen,1,100),
        })
        if (lastID == msgs.last()?.id || !msgs.last()?.id) isAtEnd = true;
        lastID = msgs.last()?.id
        await new Promise(resolve => {
            DownloadImagesFromMessages(msgs.array(),Number(type)).then(c=>{
                imagesStolen += c;
                resolve(null)
            })

        })
        Logger.UpdateDLog("dli","CMD",chalk.keyword("orange"),`${chalk.hex('#6042f5')('dlImages')} > ${imagesStolen} / ${amount}`)
    }
    Logger.UpdateDLog("dli","CMD",chalk.keyword("orange"),`${chalk.hex('#6042f5')('dlImages')} > Completed stealing ${imagesStolen} images.\n`)

    return true;
}