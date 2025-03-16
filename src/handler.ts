import path from "path";
import * as fs from "fs/promises";
import { Client } from "./service";
import { homedir } from "os";
import { existsSync, readdirSync, readFileSync, unlinkSync } from "fs";

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
                this.getNote(args[0]);
                break; 
            case "list":
                this.listNotes();
                break;
            case "update":
                this.updateNote(args);
                break;
            case "delete":
                this.deleteNote(args[0]);
                break;
            case "close":
                this.client.emit('exit');
                break;
            case "help":
                this.helpScreen();
                break;
            case "clear":
                console.clear();
                this.emitResponseEvent();
                break;
            default:
                this.client.emit('response', '<< Unknown Command (type help to list available commands) >>\n');
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
        this.emitResponseEvent();

    }

    private updateNote(args: string[]){
        this.currentFile = args[0];
        this.client.rl.close();

        if (!this.currentFile){
            console.log("\n<<<<< get command requires filename as argument >>>>>");
            return;  
        }

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
            this.emitResponseEvent();
        })
    }


    private readNoteStream(args: string[]){
        this.input = [];    
        this.currentFile = args[0];

        if (!this.currentFile){
            console.log("\n<<<<< create command requires filename as argument >>>>>");
            this.emitResponseEvent();
            return;  
        }

        if (this.checkFileExists(this.currentFile)){
            console.log("\n<<<<< File With The Same Name Exists. >>>>>");
            this.emitResponseEvent();
            return;
        }
        
        this.client.emit('switch-mode');
        console.log("\n===== Enter Note Content =====\n")
        this.client.on('note-content', (input: string) => {
            const line = input.trim();
            this.input.push(line);
        })
    }

    private checkFileExists(filename: string){
        const filePath = path.join(this.folderPath + `/${filename}.md`);
        return existsSync(filePath);
    }

    
    private getNote(filename: string) {
        if (!filename){
            console.log("\n<<<<< get command requires filename as argument >>>>>");
            this.emitResponseEvent();
            return;  
        }

        const filePath = path.join(this.folderPath, `${filename}.md`);
        if (this.checkFileExists(filename)) {
          try {
            const data = readFileSync(filePath, 'utf8');
            console.log('\n===== Note Content =====\n')
            console.log(data);
            console.log('\n===== End Of Note Content =====\n')

          } catch (err) {
            console.error(err);
          }
        } else {
          console.log("File does not exist. Please use 'list' to view available files.");
        }
        this.emitResponseEvent();  
    }

    private deleteNote(filename: string){
        if (!filename){
            console.log("\n<<<<< delete command requires filename as argument >>>>>");
            this.emitResponseEvent();
            return;  
        }

        const filePath = path.join(this.folderPath, `${filename}.md`);
        if (this.checkFileExists(filename)){
            try {
                unlinkSync(filePath);
                console.log(`\n===== File [${filename}.md] Deleted Successfully =====`);
              } catch (err) {
                console.error(err);
              }
        } else{
          console.log("\nFile does not exist. Please use 'list' to view available files.");
        }
        this.emitResponseEvent();
    }

    private helpScreen(){
        let responseString: string = "----- Welcome To Mark-It: Commands List -----\n";
        const commands: {[command: string]: string} = {
            add: 'create [filename] - Creates a new md note', 
            delete: 'delete [filename] - Deletes a md note', 
            update: 'update [filename] - Updates a md note',
            list: 'list - Lists all available md notes',
            close: 'close - Closes mark-it' ,
            help: 'help - Displays supports commands',
            clear: 'clear - Clears the screen'
        }
        for (let command in commands){
            responseString += `\n - ${command}: ${commands[command]}\n`;
        }
        console.log(`\n${responseString}`)
        this.emitResponseEvent();
    }

    private emitResponseEvent(){
        this.client.emit('response', '-- type help to list commands --');   
    }

}