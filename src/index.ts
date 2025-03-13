/*
    this is an event-driven application where the application listens for certain events
    to create, read, update and delete notes. users can create notes using markdown format.

*/

import { Client } from "./service";
const client = new Client();
client.on('response', (response) => {
    process.stdout.write(`\n${response}\n`);
    process.stdout.write(`\nMark-It >> `);
})
