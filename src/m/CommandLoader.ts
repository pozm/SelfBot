import {Client} from "discord.js";
import {existsSync, readdirSync, watch} from "fs";
import {join} from "path";
import {exec} from "child_process";
import {Logger} from "./Logger";
import chalk from "chalk";

export const commands = new Map<string,(args : string[], line : string, client: Client) => Promise<void>>()

Logger.Custom.Command = (...s) => console.log(`[${chalk.keyword("orange")("CMD")}] >`, ...s)

const loadFile = (n: string) => {
    let f = `./dist/c/${n}`
    if (!existsSync(f)) throw "invalid file"
    else {
        Logger.Custom.Command("Loaded "+n)
        delete require.cache[join(__dirname,"../c/"+n)]
        let fn = require(join(__dirname,"../c/"+n)).default
        // console.log(fn.toString())
        commands.set(n.slice(0,-3),fn)
    }
}
const checkToRemove = () => {
    for (let f of commands.keys()) {
        let fn = `./dist/c/${f}.js`
        if (!existsSync(fn)) {
            commands.delete(f)
        }
    }
}


for (let f of readdirSync('./dist/c')) {
    loadFile(f)
}

let lastsrcUpdate = Date.now()

watch("./src/c", {  } ,(event,file)=> {
    if ((Date.now() -lastsrcUpdate) < 2e3) return;
    lastsrcUpdate = Date.now()
    if (event == "change"){
        Logger.Custom.Command("Detected changes from src, compiling...")
        exec('npx tsc')
    }
})

watch("./dist/c", {} ,(event,file)=> {
    let f = `./dist/c/${file}`
    switch (event) {
        case "rename":
            if (!existsSync(f)) {
                checkToRemove();
            } else {
                setTimeout(()=>{
                    loadFile(file)
                },5e2)
            }

            break;
        case "change":
            if (!existsSync(f)) {
                checkToRemove();
            }
            else {
                loadFile(file)
            }
            break;
    }

})