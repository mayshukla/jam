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
	  await this.handleClientDiff(sock, message, diff);
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

  async handleClientDiff(sock: WebSocket, message: DiffMessage, diff: Array<Object>) {
    // Generate and apply patch to shadow
    let shadow = this.socketsToShadows.get(sock);
    let newShadow = this.dmp.applyDiffExact(shadow, diff);
    this.socketsToShadows.set(sock, newShadow);

    // Generate and apply patch to text
    this.serverText = this.dmp.applyDiffFuzzy(this.serverText, diff);

    await this.updateAllClients();
  }

  /**
   * Sends diffs to all clients.
   * Should be called whenever serverText is updated.
   */
  async updateAllClients() {
    this.socketsToShadows.forEach(async (shadow, sock) => {
      // TODO check if diff is empty
      let diff = this.dmp.diff(shadow, this.serverText);
      this.socketsToShadows.set(sock, this.serverText);

      let message = new DiffMessage(diff);
      await sock.send(message.toJSON());
    });
  }
}
