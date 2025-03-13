import * as fs from "fs/promises";
import { existsSync } from "fs";
import { homedir } from "os";
import path from "path";
import { Client } from "./service";

export class Handler {

    private eventEmitter: Client;
    private input: string[] = [];
    private currentFile: string = "";

    constructor(client: Client){
        this.eventEmitter = client;
    }

    commandHandler(cmd: string, args: string[]){
        switch (cmd){
            case "create":
                this.readNoteContent(args);
                break;
            case "get":
                this.getNote(args);
                break; 
            case "list":
                this.listNotes(args);
                break;
            case "update":
                this.updateNote(args);
                break;
            case "delete":
                this.deleteNote(args);
                break;
            default:
                this.eventEmitter.emit('response', 'Unknown Command.');
        }
    }
    
    async writeNote(){
        try {
            let fileContent= "";
            this.input.forEach((line, idx) => {
                if (idx) fileContent += `${line}\n`;
            })
            const folderPath = path.join(homedir(), '/Documents/mark-it/notebooks');
            await fs.writeFile(folderPath + `/${this.currentFile}.md`, fileContent);

        } catch (err){
            console.error("Error", err)
        }
    }

    private readNoteContent(args: string[]){
        this.input = [];    
        this.currentFile = args[0];
        if (this.checkSameFilename(this.currentFile)){
            console.log("\n<<<<< File With The Same Name Exists. >>>>>");
            this.eventEmitter.emit('response', 'Mark-It >> Type a command (help to list commands)')
            return;
        }
        
        this.eventEmitter.emit('switch-mode');

        console.log("\n===== Enter Note Content =====\n")
        this.eventEmitter.on('note-content', (input: string) => {
            const line = input.trim();
            this.input.push(line);
        })
    }

    private checkSameFilename(filename: string){
        const folderPath = path.join(homedir(), '/Documents/mark-it/notebooks');
        const filePath = folderPath + `/${filename}.md`;
        return existsSync(filePath);
    }

    private getNote(args: string[]){}
    private listNotes(args: string[]){}
    private updateNote(args: string[]){}
    private deleteNote(args: string[]){}

}