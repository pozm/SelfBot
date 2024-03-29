import {Client, PresenceStatus} from "discord.js";

async function main ( args: string[] , line : string, client : Client ) {

    let tab : {[x:string]:string} = {'offline':"invisible",'online':'online','idle':'idle','dnd':'dnd','invisible':'invisible'}

    let parse = (t : string) => tab[t.toLowerCase()] ?? 'online'
    client.user.setStatus(parse(args[0]) as PresenceStatus).then(v => {
        console.log(`Changed status to '${parse(args[0])}'`)

    }, r => {
        throw `Failed to set status to '${parse(args[0])}'`
    })
}