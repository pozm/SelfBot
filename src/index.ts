import { Client } from "discord.js"
import { readdirSync } from "fs"
import { createConnection } from "mysql"
import { MYSQLPASSWORD, token } from "./config"
import {createInterface, emitKeypressEvents} from "readline";
import {commands} from "./m/CommandLoader";
import {Communicator} from "./m/Communicator";
import {Logger} from "./m/Logger";
import chalk from "chalk";
import {HookStdout} from "./m/util";
import {createContext, runInContext, runInNewContext, Script} from "vm";
import {join} from "path"
import {createRequire} from "module"

// type
type keypress_key = {name:string,sequence:string,ctrl:boolean,meta:boolean,shift:boolean}

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
emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

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
            let console_mod = {...console}
            console_mod.log = Logger.Custom.CommandInternal.bind(this,commandName)
            let scrpt = new Script(command + `;this.__internal_exit_state = main(...__Imported_Args).then(r=>this.__internal_exit_state=[true,r],e=>this.__internal_exit_state=[false,e]);`)
            let require_mod = createRequire(join(__dirname,"./c/"+commandName+".js"))
            let ctx = createContext({require:require_mod,console:console_mod,exports, setInterval,clearInterval ,process,__interl_location:join(__dirname,"./c/internal"),__Imported_Args:[args,line,client]})
            try {
                scrpt.runInContext(ctx, {
                    filename: commandName+".js",

                    displayErrors: true,
                })

                let exit : [boolean, any] = await ctx.__internal_exit_state

                console_mod.log(exit[0] ? `✔${ typeof exit[1] === "string" ? ` | ${exit[1]}` : ""}` : `❌ | ${exit[1]}`)
            } catch (e) {
                console.log(chalk.red("Unable to execute " + commandName + "due to errors : " + e))
            }
        }
        rl.prompt(false);
    });

    process.stdin.on("keypress",(str:string,key:keypress_key) => {
        // console.log(str,key)
        if (key.ctrl && key.name == "f") {

        }
    })
    let int:NodeJS.Timeout;
    if ((process.env?.discord ?? true) == true) {
        client.login(token)

        Logger.DLog("login", "CLIENT", chalk.cyan, "Logging in\n")
        let m = 0
        let s = ['-', '\\', '|', '/']
        int = setInterval(() => {
            Logger.UpdateDLog("login", "CLIENT", chalk.cyan, `Logging in ${chalk.magentaBright(s[m++ % 4])}`);
        }, 500)
    } else {
        Logger.Log(undefined,"Running without discord, most builtin commands will not work!")
        rl.resume()
    }

    Communicator.on("load",()=>{

        clearInterval(int)

        Logger.UpdateDLog("login","CLIENT",chalk.cyan,`Logged into ${client.user.username}\n`)
        Logger.Log(undefined,`Welcome, ${client.user.username}. It is ${new Date().toLocaleTimeString("en-gb",{hour12:true}).slice(0,-3)}`)

        // console.log(Communicator.SharedData['ConsoleLogs'], Communicator.SharedData['ConsoleLines'])

        // let cntr = 0
        // Logger.DLog('counter',"cnt",chalk.red,cntr.toString()+"\n")
        //
        // setInterval(()=> {
        //     cntr++;
        //     Logger.UpdateDLog('counter', "cnt", chalk.red, cntr.toString()+"\n")
        // },1e3)

        rl.resume()

        // rl.prompt(false);
    })


}