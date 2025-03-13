import { EventEmitter } from "events";
import { Handler } from "./handler";
import * as readline from "readline";
import { homedir } from "os";
import path from "path";
import { existsSync, mkdirSync } from "fs";

type inputMode = 'command' | 'note-content';

export class Client extends EventEmitter {

    private readonly rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "Mark-It >> "
    })
    private inputMode: inputMode = 'command';
    private readonly eventHandler = new Handler(this);
    

    constructor(){
        super();
        this.attachEvents();
        this.initReadableStream();
        this.closeReadableStream();
        this.createFolder();

        process.nextTick(() => {
            this.emit('response', 'Mark-It >> Type a command (help to list commands)')
        })
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
                    console.log("\n===== End Of Note Content =====\n")
                    this.eventHandler.writeNote();
                    
                    this.switchMode()
                    this.rl.prompt(true);
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

        this.on('switch-mode', () => {
            this.switchMode();
        })
    }

    private switchMode(){
        this.inputMode = (this.inputMode === 'command') ? 'note-content' : 'command'; 
        this.rl.setPrompt(this.inputMode === "note-content" ? "" : "Mark-It >> ");
    }

    private createFolder(){

        try{
            const homeDir = homedir();
            const folderPath = path.join(homeDir, '/Documents/mark-it/notebooks');
            if (!existsSync(folderPath)){
                mkdirSync(folderPath, {recursive: true})
            }
        } catch(err){
            console.error(err);
        }
    }
}
