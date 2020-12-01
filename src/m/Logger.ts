import chalk from "chalk";
import {oldConsoleLog, rl} from "../index";
import {CursorPos} from "readline";
import * as readline from "readline";
import {Communicator} from "./Communicator";

function fillText(t : string) {
    let size = process.stdout.columns
    // console.log(size)
    return t + ' '.repeat(size-t.length)
}

class LoggerClass {
    public Custom : {[x:string]:(...s : any[])=>void}
    private Store : {[ID:string]:number}
    constructor() {
        this.Custom = {}
        this.Store = {}
    }
    Log(t : string= "LOG" ,...s : any[]) {
        oldConsoleLog(`[${chalk.greenBright(t)}] >`,...s)
    }
    CLog(t : string= "LOG", c:chalk.Chalk ,...s : string[]) {
        process.stdout.write(`[${c(t)}] > ${s.join(', ')}`)
    }
    DLog(id:number|string,t : string= "LOG", c:chalk.Chalk ,...s : string[]) {
        process.stdout.write(`[${c(t)}] > ${s.join(', ')}`)
        this.Store[id.toString()] = Communicator.SharedData['ConsoleLines']
    }
    UpdateDLog(id:number|string,t : string= "LOG", c:chalk.Chalk ,...s : string[]) {
        let currpos = Communicator.SharedData['ConsoleLines']
        let oldPos = this.Store[id.toString()]
        if (s.includes('\n')) Communicator.SharedData['ConsoleLines'] -= 1
        readline.moveCursor(process.stdout,0,(oldPos)-(currpos+1))
        process.stdout.write(fillText(`[${c(t)}] > ${s.join(', ')}`))
        readline.moveCursor(process.stdout,0, (currpos+1)-oldPos)
        readline.cursorTo(process.stdout,0)
    }

}

export const Logger = new LoggerClass()