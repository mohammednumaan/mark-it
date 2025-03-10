import { EventEmitter } from "events";
import { Handler } from "./handler";
import * as readline from "readline";
import { mkdir } from "fs/promises";

type inputMode = 'command' | 'note-content';

export class Client extends EventEmitter {

    private readonly rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "Mark-It >>"
    })
    private inputMode: inputMode = 'command';
    private readonly eventHandler = new Handler(this);
    

    constructor(){
        super();
        this.attachEvents();
        this.initReadableStream();
        this.closeReadableStream();
    }

    private initReadableStream(){
        this.rl.on('line', (input) => {
            if (this.inputMode === 'command'){
                const [cmd, ...args] = input.trim().split(' ');
                this.emit('command', cmd, args);
            }

            if (this.inputMode === "note-content"){
                const data = input.trim();
                if (data === ":exit") {
                    this.eventHandler.writeNote();
                    this.switchMode()
                }
                else this.emit('note-content', data)
            }
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

        this.on('switch-mode', (prompt: string) => {
            this.switchMode(prompt);
        })
    }

    private switchMode(prompt?: string){
        this.inputMode = (this.inputMode === 'command') ? 'note-content' : 'command'; 
        this.rl.setPrompt(prompt || "Mark-It >>");
    }

}
