import { SERVER_WEBSOCKET_URL } from "./common/config.js";
import { Message, FullTextMessage, DiffMessage }
from "./common/messages.js";
import DiffMatchPatch from "./common/DiffMatchPatch.js";

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
    this.editorElement.addEventListener("input", () => this.handleEdit());

    this.dmp = new DiffMatchPatch();
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
	let text = message.text;
	this.shadow = text;
	this.setText(text);
      } else if (message instanceof DiffMessage) {
	this.handleDiff(message);
      } else {
	console.error("Unexpected message type.");
      }
    });
  }

  handleEdit() {
    let text = this.getText();
    let diff = this.dmp.diff(this.shadow, text);
    this.shadow = text;

    let message = new DiffMessage(diff);
    this.socket.send(message.toJSON());
  }

  handleDiff(diffMessage) {
    let diff = diffMessage.diff;
    this.shadow = this.dmp.applyDiffExact(this.shadow, diff);

    this.setText(this.dmp.applyDiffFuzzy(this.getText(), diff));
  }

  setText(text) {
    // TODO save cursor position

    this.editorElement.innerText = text;

    // TODO restore cursor position
  }

  getText() {
    return this.editorElement.innerText;
  }
}
