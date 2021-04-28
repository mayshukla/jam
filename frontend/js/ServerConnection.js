import { SERVER_WEBSOCKET_URL } from "./common/config.js";
import { Message, FullTextMessage, DiffMessage }
from "./common/messages.js";

/**
 * Manages the clients connection to the server.
 */
export default class ServerConnection {
  /**
   * @param editorElement The Element which contains the user's code in its
   * textContent field.
   */
  constructor(editorElement) {
    this.editorElement = editorElement;
  }

  connect() {
    this.socket = new WebSocket(SERVER_WEBSOCKET_URL);

    this.socket.addEventListener("open", (event) => {
      console.log("Connected to server websocket.");
    });

    this.socket.addEventListener("message", (event) => {
      let message = Message.fromJSON(event.data);
      if (message instanceof FullTextMessage) {
	console.log("Got full text from server:", message);
	this.editorElement.textContent = message.text;
      } else if (message instanceof DiffMessage) {
	console.log("Got diff from server:", message);
	// TODO
      } else {
	console.error("Unexpected message type.");
      }
    });
  }
}
