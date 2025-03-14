import * as fs from "fs/promises";
import { existsSync, readdirSync } from "fs";
import { homedir } from "os";
import path from "path";
import { Client } from "./service";

export class Handler {

    private client: Client;
    private input: string[] = [];

    private currentFile: string = "";
    private folderPath: string = path.join(homedir(), '/Documents/mark-it/notebooks');

    constructor(client: Client){
        this.client = client;
    }

    commandHandler(cmd: string, args: string[]){
        switch (cmd){
            case "create":
                this.readNoteStream(args);
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
                this.client.emit('exit');
                break;
            default:
                this.client.emit('response', 'Unknown Command.');
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

    private listNotes(){
        const filenames = readdirSync(this.folderPath);

        console.log("\n===== All Notebooks =====\n")
        filenames.forEach((filename, idx) => {
            console.log(`${idx + 1}: ${filename}`)            
        })
        console.log("\n===== End Of Notebook List =====\n")
        this.client.emit('response', '<< Type a command (help to list commands) >>')

    }

    private updateNote(args: string[]){
        this.currentFile = args[0];
        this.client.rl.close();

        const filePath = path.join(this.folderPath + `/${this.currentFile}.md`);
        const editorSpawn = require('child_process').spawn("nano", [filePath], {
            stdio: 'inherit',
            detached: true
        })

        editorSpawn.on('data', function(data: any){
            return process.stdout.pipe(data);
        });    
        
        editorSpawn.on('close', () => {
            console.log("\n===== Note Updated =====\n")
            this.client.initReadableStream();
            this.client.emit('response', '<< Type a command (help to list commands) >>')
            
        })
    }


    private readNoteStream(args: string[]){
        this.input = [];    
        this.currentFile = args[0];

        if (this.checkSameFilename(this.currentFile)){
            console.log("\n<<<<< File With The Same Name Exists. >>>>>");
            this.client.emit('response', '<< Type a command (help to list commands) >>')
            return;
        }
        
        this.client.emit('switch-mode');
        console.log("\n===== Enter Note Content =====\n")
        this.client.on('note-content', (input: string) => {
            const line = input.trim();
            this.input.push(line);
        })
    }

    private checkSameFilename(filename: string){
        const filePath = path.join(this.folderPath + `/${filename}.md`);
        return existsSync(filePath);
    }

    
    private getNote(args: string[]){}
    private deleteNote(args: string[]){}

}