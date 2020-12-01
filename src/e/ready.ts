import { exec } from "child_process";
import { Client } from "discord.js"
import { existsSync, readdirSync, watch } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import {Communicator} from "../m/Communicator";

module.exports = function run(client :Client) : void {

    Communicator.emit("load")

}
