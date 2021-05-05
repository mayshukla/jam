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
	this.deleteSocket(sock);
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
      if (sock.isClosed === true) {
	// Sometimes, a socket gets closed and a close event was not received.
	// In this case, we should not attempt to send a message to the closed
	// socket.
	this.deleteSocket(sock);
	return;
      }
      let diff = this.dmp.diff(shadow, this.serverText);
      this.socketsToShadows.set(sock, this.serverText);

      if (this.dmp.isDiffEmpty(diff)) {
	return;
      }

      let message = new DiffMessage(diff);
      await sock.send(message.toJSON());
    });
  }

  /**
   * Stop keeping track of the socket so that we don't accidentally send a
   * message to a closed socket.
   */
  deleteSocket(sock: WebSocket) {
    this.socketsToShadows.delete(sock);
  }
}
