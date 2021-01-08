import {Client} from "discord.js";
import {existsSync, lstatSync, readdirSync, readFileSync, watch} from "fs";
import {join} from "path";
import {exec} from "child_process";
import {Logger} from "./Logger";
import chalk from "chalk";
import {createContext, runInContext} from "vm";
import {createRequire} from "module";

// export const commands = new Map<string,(args : string[], line : string, client: Client) => Promise<void>>()
export const commands = new Map<string,string>()

Logger.Custom.Command = (...s) => console.log(`[${chalk.keyword("orange")("CMD")}] >`, ...s)

const checkMainFunc = (f : string,n:string) => {
    let con = true;
    let ctx = createContext({exports, require: createRequire(join(__dirname,"../c/"+n+".js"))})

    // check that the file has no issues
    try {
        // check for any global issues
        runInContext(f,ctx)

        //main
        if (!ctx.main) throw "main not found"

    }
    catch(e) {
        Logger.Custom.Command(chalk.red(`${n} has failed to load due to errors : ${e}`))
        con = false;
    }
    return con;
}

const loadFile = (n: string) => {
    let f = `./dist/c/${n}`
    if (!existsSync(f)) throw "invalid file"
    else {
        delete require.cache[join(__dirname,"../c/"+n)]
        let fn = readFileSync(join(__dirname,"../c/"+n)).toString()
        // console.log(fn.toString())
        if (!checkMainFunc(fn,n))
            return
        commands.set(n.slice(0,-3),fn)
        Logger.Custom.Command("Loaded "+n)
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
    if (!lstatSync(join(__dirname,'../c/'+f)).isDirectory())
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