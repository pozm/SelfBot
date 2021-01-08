import chalk from "chalk";
import {oldConsoleLog, rl} from "../index";
import {CursorPos} from "readline";
import * as readline from "readline";
import {Communicator} from "./Communicator";
import {Clamp} from "./util";

function fillText(t : string) {
    let size = process.stdout.columns
    // console.log(size)
    return t + ' '.repeat(Clamp(0,size-t.length,Number.MAX_SAFE_INTEGER))
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
        let currpos = Communicator.SharedData['ConsoleLines'] ?? 0
        let oldPos = this.Store[id.toString()]
        let diffPos = (oldPos)-(currpos+1)
        // console.log((Math.abs(currpos) - diffPos))
        if (( Clamp(Math.abs(currpos),0,process.stdout.rows) - diffPos) < 0) return;
        if (s.join('').includes('\n')) Communicator.SharedData['ConsoleLines'] -= s.join('').split(/\n/).length - 1

        readline.moveCursor(process.stdout,0,diffPos)
        process.stdout.write(fillText(`[${c(t)}] > ${s.join(', ')}`))
        readline.moveCursor(process.stdout,0, (currpos+1)-oldPos)
        readline.cursorTo(process.stdout,0)

    }

}

export const Logger = new LoggerClass()