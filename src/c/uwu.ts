import { Client } from "discord.js";

async function main ( args: string[] , line : string, client : Client ) {
    for (let i=0;i<(Number(args[0]) ?? 1);i++) {
        client.users.get('475111190909943808')?.send('uwu')
    }
}