import { WebSocket, isWebSocketCloseEvent } from
"https://deno.land/std@0.95.0/ws/mod.ts";

import { Message, FullTextMessage, DiffMessage }
from "./frontend/js/common/messages.js";

import "./frontend/js/common/diff_match_patch/diff_match_patch.js";

export default class SocketHandler {
  // Common version of the text
  serverText = "// Welcome to JAM!";
  dmp: diff_match_patch;
  sockets:WebSocket[] = new Array();

  constructor() {
    this.dmp = new diff_match_patch();
  }

  async handleSocket(sock: WebSocket) {
    this.sockets.push(sock);

    // When a client first connects, send the full text.
    let message = new FullTextMessage(this.serverText);
    await sock.send(message.toJSON());

    for await (const ev of sock) {
      if (typeof ev === 'string') {
	let message = Message.fromJSON(ev);
	if (message instanceof DiffMessage) {
	  this.handleClientDiff(message);
	} else {
	  console.error("Unexpected message type.");
	}
      } else if (isWebSocketCloseEvent(ev)) {
	console.log("Client closed socket");

	// Delete socket from list
	let index = this.sockets.indexOf(sock);
	this.sockets.splice(index, 1);
      } else {
	console.error("Unexpected socket event type:", typeof ev);
      }
    }
  }

  handleClientDiff(message: DiffMessage) {
    // TODO
  }
}
