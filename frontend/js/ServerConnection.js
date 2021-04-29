import { SERVER_WEBSOCKET_URL } from "./common/config.js";
import { Message, FullTextMessage, DiffMessage }
from "./common/messages.js";
import DiffMatchPatch from "./common/DiffMatchPatch.js";

/**
 * Manages the clients connection to the server.
 */
export default class ServerConnection {
  /**
   * @param editor An Editor object.
   */
  constructor(editor) {
    this.editor = editor;
    this.editor.addEditListener(() => this.handleEdit());

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
	this.editor.setText(text);
	this.text = text;
      } else if (message instanceof DiffMessage) {
	this.handleDiff(message);
      } else {
	console.error("Unexpected message type.");
      }
    });
  }

  handleEdit() {
    if (this.debounce === true) {
      this.debounce = false;
      return;
    }
    this.text = this.editor.getText();
    let diff = this.dmp.diff(this.shadow, this.text);
    this.shadow = this.text;

    let message = new DiffMessage(diff);
    this.socket.send(message.toJSON());
  }

  handleDiff(diffMessage) {
    let diff = diffMessage.diff;
    this.shadow = this.dmp.applyDiffExact(this.shadow, diff);

    this.debounce = true;
    this.text = this.dmp.applyDiffFuzzy(this.text, diff);
    this.editor.setText(this.text);
  }
}
