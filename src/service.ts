import { EventEmitter } from "events";
import readline from "readline";
import { Handler } from "../handler";

export class Client extends EventEmitter {

    private readonly eventHandler = new Handler(this);
    private readonly rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    constructor(){
        super();
        this.initReadableStream();
        this.closeReadableStream();
        this.attachEvents();
    }

    private initReadableStream(){
        this.rl.on('line', (input) => {
            const [cmd, ...args] = input.trim().split(' ');
            this.emit('command', cmd, args);
        })
    }

    private closeReadableStream(){
        this.rl.on('exit', () => {
            process.stdout.write("Exiting Mark-it...");
            this.rl.close();
        })
    }

    private attachEvents(){
        this.on('command', (cmd: string, args: string[]) => {
            this.eventHandler.commandHandler(cmd, args);
        })
    }
}
