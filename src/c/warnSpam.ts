import {Client, TextChannel} from "discord.js";
import {Communicator} from "../m/Communicator";


async function main (  []: string[] , line : string, client : Client ) {
    Communicator.SharedData["warnSpamming"] = !(Communicator.SharedData["warnSpamming"] ?? false)
    let c = client.channels.get("796904410260701206") as TextChannel

    let int: NodeJS.Timeout;
    int = setInterval(()=>{
        if (!Communicator.SharedData["warnSpamming"])
            return clearInterval(int)
        c.send("/warn 288062966803333120 using bot commands in no bot commands")
    },5e3)

}