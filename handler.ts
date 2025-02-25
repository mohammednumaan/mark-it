import { EventEmitter } from "stream";

export class Handler {
    
    private eventEmitter: EventEmitter;

    constructor(client: EventEmitter){
        this.eventEmitter = client;
    }

    commandHandler(cmd: string, args: string[]){
        switch (cmd){
            case "create":
                this.createNote(args);
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

    private createNote(args: string[]){
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