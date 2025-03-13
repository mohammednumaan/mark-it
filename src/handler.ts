import * as fs from "fs/promises";
import { existsSync, readdirSync } from "fs";
import { homedir } from "os";
import path from "path";
import { Client } from "./service";

export class Handler {

    private eventEmitter: Client;
    private input: string[] = [];
    private currentFile: string = "";
    private folderPath: string = path.join(homedir(), '/Documents/mark-it/notebooks');

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
                this.listNotes();
                break;
            case "update":
                this.updateNote(args);
                break;
            case "delete":
                this.deleteNote(args);
                break;
            case "close":
                this.eventEmitter.emit('exit');
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
            await fs.writeFile(this.folderPath + `/${this.currentFile}.md`, fileContent);

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
        const filePath = path.join(this.folderPath + `/${filename}.md`);
        return existsSync(filePath);
    }

    private listNotes(){
        const filenames = readdirSync(this.folderPath);

        console.log("\n===== All Notebooks =====\n")
        filenames.forEach((filename, idx) => {
            console.log(`${idx + 1}: ${filename}`)            
        })
        console.log("\n===== End Of Notebook List =====\n")
        this.eventEmitter.emit('response', 'Mark-It >> Type a command (help to list commands)')

    }

    private getNote(args: string[]){}
    private updateNote(args: string[]){}
    private deleteNote(args: string[]){}

}