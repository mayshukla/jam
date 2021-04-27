import { WebSocket } from "https://deno.land/std@0.95.0/ws/mod.ts";

import { Message, FullTextMessage, DiffMessage }
from "./frontend/js/common/messages.js";

export default class SocketHandler {
  // Common version of the text
  serverText = "// Welcome to JAM!";

  constructor() {}

  async handleSocket(sock: WebSocket) {
    // When a client first connects, send the full text.
    let message = new FullTextMessage(this.serverText);
    await sock.send(message.toJSON());

    for await (const ev of sock) {
      if (typeof ev === 'string') {
	//console.log("got message from client:", ev);
	//await sock.send("hi from server");
      }
    }
  }
}
