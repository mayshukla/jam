import { WebSocket, isWebSocketCloseEvent } from
"https://deno.land/std@0.95.0/ws/mod.ts";

import { Message, FullTextMessage, DiffMessage }
from "./frontend/js/common/messages.js";

import DiffMatchPatch from "./frontend/js/common/DiffMatchPatch.js";

export default class SocketHandler {
  // Common version of the text
  serverText = "// Welcome to JAM!";
  dmp: DiffMatchPatch;
  // A map that contains open sockets and their corresponding shadow text.
  socketsToShadows = new Map();

  constructor() {
    this.dmp = new DiffMatchPatch();
  }

  async handleSocket(sock: WebSocket) {
    this.socketsToShadows.set(sock, this.serverText);

    // When a client first connects, send the full text.
    let message = new FullTextMessage(this.serverText);
    await sock.send(message.toJSON());

    for await (const ev of sock) {
      if (typeof ev === 'string') {
	let message = Message.fromJSON(ev);
	if (message instanceof DiffMessage) {
	  let diff = message.diff;
	  this.handleClientDiff(sock, message, diff);
	} else {
	  console.error("Unexpected message type.");
	}
      } else if (isWebSocketCloseEvent(ev)) {
	console.log("Client closed socket");

	// Delete socket from list
	this.socketsToShadows.delete(sock);
      } else {
	console.error("Unexpected socket event type:", typeof ev);
      }
    }
  }

  handleClientDiff(sock: WebSocket, message: DiffMessage, diff: Array<Object>) {
    // Generate and apply patch to shadow
    let shadow = this.socketsToShadows.get(sock);
    let newShadow = this.dmp.applyDiffExact(shadow, diff);
    this.socketsToShadows.set(sock, newShadow);
    console.log(newShadow);

    // Generate and apply patch to text

    // Send diffs to all clients
  }
}
