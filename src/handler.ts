import * as fs from "fs/promises";
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

    private readNoteContent(args: string[]){
        this.input = [];
        this.currentFile = args[0];
        this.eventEmitter.emit('switch-mode', "?: Enter Note Content\n");
        this.eventEmitter.on('note-content', (input: string) => {
            const line = input.trim();
            this.input.push(line);
        })
    }

    async writeNote(){
        let fileContent= "";
        for (const line of this.input){
            fileContent += line;
        }
        
        try {
            await fs.writeFile(this.currentFile, fileContent);
        } catch (err){
            console.error("Error")
        }
    }

    private getNote(args: string[]){
    }

    private listNotes(args: string[]){
    }

    private updateNote(args: string[]){
    }

    private deleteNote(args: string[]){
    }
}