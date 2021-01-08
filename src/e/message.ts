import { exec } from "child_process";
import {Client, Message} from "discord.js"
import { existsSync, readdirSync, watch } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import {Communicator} from "../m/Communicator";

module.exports = function run(client :Client,message: Message) : void {
    // if (message.guild?.id === "769988189762486302") return;
    // if (message.author.id === "277567981913899013") {
    //     message.channel.send('dead people can\'t talk 🤐😔')
    // }
    // else if (message.author.id === "787086729470541844")
    //     message.channel.send("ok, fake british. If you are really british i require you to list every prime minister and king and queen in the british empire (england or united kingdom), you also need to list every town in the united kingdom or you are fake. ")

}
