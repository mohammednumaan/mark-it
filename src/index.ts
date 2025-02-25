/*
    this is an event-driven application where the application listens for certain events
    to create, read, update and delete notes. users can create notes using markdown format.
    
    - listen for certain events for performing operations
    - a simple markdown parser to parse the markdown notes input

*/

import { Client } from "./service";
const client = new Client();
