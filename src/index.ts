import { Client } from "discord.js"
import { readdirSync } from "fs"
import { createConnection } from "mysql"
import { MYSQLPASSWORD, token } from "./config"
import {createInterface} from "readline";
import {commands} from "./m/CommandLoader";
import {Communicator} from "./m/Communicator";
import {Logger} from "./m/Logger";
import chalk from "chalk";
import {HookStdout} from "./m/util";
import {createContext, runInContext, runInNewContext, Script} from "vm";


export const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    completer:completer,
    tabSize:4,
});


// mysql

export const con = createConnection({
    user:'root',
    host: "localhost",
    password:MYSQLPASSWORD
})

Communicator.SharedData['ConsoleLines'] = (Communicator.SharedData['ConsoleLines'] ?? 0) + commands.size

HookStdout()

Logger.DLog('msqllog','SQL', chalk.rgb(82,235,23),'Logging into mysql..\n')
con.on('connect',()=> Logger.UpdateDLog('msqllog','SQL', chalk.rgb(82,235,23),'Logged into mysql.'))
con.query(`create database if not exists Images`);
con.query(`create table if not exists Images.Hentai
           (
               ID   int auto_increment primary key ,
               Url  mediumtext null,
               Type int        null
           );
`);


function completer(line :string ) {
    const completions = Array.from(commands.keys())
    const hits = completions.filter((c) => c.startsWith(line));
    return [hits.length ? hits : completions, line];
}

export const oldConsoleLog = console.log;

// client set up

if (require.main === module ) {

    // only run if the context running this is main
    const EFiles = readdirSync(`${__dirname}/e`)
    const client = new Client()

    for (let v of EFiles) {

        if (!v.endsWith('.js')) {console.error('NONE JS file in EVENT directory'); continue}
        let pull : Function = require(`${__dirname}/e/${v}`)
        if (!pull) {console.error(`Event '${v}' DOES NOT have a function!`); continue}
        let s = v.slice(0,-3)
        if (typeof s != 'string') break
        client.on( s , pull.bind(null,client))
    }

    rl.pause()

    Logger.Custom.CommandInternal = (c:string,...s) => oldConsoleLog(`[${chalk.keyword("orange")("CMD")}] > ${chalk.hex('#6042f5')(c)} >`, ...s)
    console.log = Logger.Log.bind(this,undefined)
    // console.log('aaaa')

    rl.on("line", async (line : string)=>{

        let args = line.split(/ +/g)
        let commandName = args.shift()
        if (commandName == "") return rl.prompt(false);
        let command = commands.get(commandName ?? "")
        if (! command ) console.log("invalid command");
        else {
            console.log = Logger.Custom.CommandInternal.bind(this,commandName)
            await command.call(this,args,line,client)
            console.log = Logger.Log.bind(this,undefined)
        }

        rl.prompt(false);
    })


    client.login(token)

    Logger.DLog("login","CLIENT",chalk.cyan,"Logging in\n")
    let m = 0
    let s = ['-','\\','|','/']
    let int = setInterval(()=>{Logger.UpdateDLog("login","CLIENT",chalk.cyan,`Logging in ${ chalk.magentaBright(s[m++ % 4])}`);},500)

    Communicator.on("load",()=>{

        clearInterval(int)

        Logger.UpdateDLog("login","CLIENT",chalk.cyan,`Logged into ${client.user.username}\n`)
        Logger.Log(undefined,`Welcome, ${client.user.username}. It is ${new Date().toLocaleTimeString("en-gb",{hour12:true})}`)

        // console.log(Communicator.SharedData['ConsoleLogs'], Communicator.SharedData['ConsoleLines'])

        rl.resume()

        // rl.prompt(false);
    })


}