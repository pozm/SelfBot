import { exec } from "child_process";
import {Client, Message} from "discord.js"
import { existsSync, readdirSync, watch } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import {Communicator} from "../m/Communicator";

module.exports = function run(client :Client,oldm: Message, newm : Message) : void {
    // if (newm.author.id !== '322062616027594753') return
    // if (newm.channel.id === '322062616027594753') {
    //     newm.channel.fetchMessages({
    //         limit:5,
    //         around : newm.id
    //     })
    //     let a = newm.channel.messages.keyArray()
    //     let idx = a.indexOf(newm.id)
    //     let fronta = newm.channel.messages.array().slice(0,idx).map(v=>v.author.id)
    //     let backa = newm.channel.messages.array().slice(idx).map(v=>v.author.id)
    //     let back = backa.lastIndexOf(client.user.id)
    //     let front = fronta.lastIndexOf(client.user.id)
    //     let use = (back < front && back != -1) ? back : front
    //     if (use > 4) return;
    //     let m = newm.channel.messages.array()[use]
    //     console.log(front,back,use,m?.id)
    //     if (m?.author?.id === client.user.id) {
    //         m.delete()
    //     }
    // }

}
