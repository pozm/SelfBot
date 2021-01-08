import { Message } from "discord.js";
import { con } from "..";
import {MysqlError, OkPacket} from "mysql";
import {execFileSync} from "child_process";
import {join} from "path"
import * as util from "util";
import {Communicator} from "./Communicator";

export function DownloadImagesFromMessage(msg : Message,type : number) : Promise<number> {

    return new Promise(async (resolve, reject) => {
        let Stolen = 0;
        for (let att of msg.attachments.array()) {
            let respon = await AsyncQuery<OkPacket>(`insert ignore into Images.Hentai (Url, Type) select ?, ? where not exists (select * from Images.Hentai where Url = ?) `, [att.url,type,att.url])
            Stolen += (respon?.affectedRows ?? 0)
        }


        resolve(Stolen);

    })
}

export function DownloadImagesFromMessages(msgs : Message[],type : number) : Promise<number> {

    return new Promise(async (resolve, reject) => {
        let attchs = msgs.map(v=>v.attachments.array()).flat(10)
        if(!attchs.length) return resolve(0)
        // console.log(attchs.map(v=>[v.url,v.width,v.height,type]))
        let respon = await AsyncQuery<OkPacket>(`insert ignore into Images.Hentai (Url, LowRes , Width, Height,FileSize,FileType, Type) values ? on duplicate key update Url = values(Url)`,
            [attchs.map(v=>[v.url, v.url.replace('cdn',"media")
                .replace("com","net"),v.width,v.height, v.filesize, v.url.slice(v.url.lastIndexOf(".")+1),type]),attchs.join() ])
        if (respon?.message == "" && respon?.insertId == 0) {
            return resolve(0)
        } else if ( respon?.message == "" && respon?.insertId != 0) {
            return resolve(1)
        } else {
            let parsed = respon?.message.slice(1).split('  ').map(v=>{ let b = v.split(':'); return {[b[0]] : Number(b[1])}  }).reduce((p,c) => {return{...p,...c}})
            if (!parsed) return resolve(0)
            return resolve(parsed['Records'] - parsed['Duplicates'])
        }

    })
}

export function Clamp(num : number,min : number,max : number) {
    return Math.min(Math.max(num, min), max);
}

export async function AsyncQuery<T>(query : string,args?:any[], HandleError: (err:MysqlError) => void= (err)=>{console.log(err)} ) : Promise<(T|null)> {
    return new Promise(resolve => {

        let func = (err:MysqlError|null,result:any)=>{

            if (err) return HandleError(err)
            return resolve(result)

        }
        con.query(query,args ?? func, func)

    })

}


function intrl_hook_stdout(callback: (arg0: string, arg1: any, arg2: any) => void) {
    var old_write = process.stdout.write

    // @ts-ignore // ts doesn't like overwriting global variables
    process.stdout.write = (function(write) {
        return function(string : string, encoding : any, fd : any) {
            // @ts-ignore // lazy to assign proper type
            write.apply(process.stdout, arguments)
            callback(string, encoding, fd)
        }
    })(process.stdout.write)

    return function() {
        process.stdout.write = old_write
    }
}

export function HookStdout() {
    return intrl_hook_stdout(function(str, encoding, fd) {
        Communicator.SharedData['ConsoleLogs'] = [...(Communicator.SharedData['ConsoleLogs'] ?? []), str ]
        if (str.includes('\n')) {
            Communicator.SharedData['ConsoleLines'] = (Communicator.SharedData['ConsoleLines'] ?? 0) + str.split(/\n/).length-1
        }
    })
}
