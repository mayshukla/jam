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

    this.socket.addEventListener("close", (event) => {
      console.log("Connection closed by server. Will attempt to reconnect in 1 second.");
      setTimeout(() => { this.connect(); }, 1000);
    });
  }

  handleEdit() {
    this.text = this.editor.getText();
    this.sendDiffToServer();
  }

  handleDiff(diffMessage) {
    let diff = diffMessage.diff;
    this.shadow = this.dmp.applyDiffExact(this.shadow, diff);

    let patch = this.dmp.createPatchFuzzy(this.text, diff);
    this.text = this.dmp.applyDiffFuzzy(this.text, diff);
    this.editor.applyPatch(patch);

    this.sendDiffToServer();
  }

  /**
   * Compare this.shadow and this.text and send the diff so the server.
   * Note: this function assumes this.shadow and this.text have already been
   * updated.
   */
  sendDiffToServer() {
    let diff = this.dmp.diff(this.shadow, this.text);
    this.shadow = this.text;

    let message = new DiffMessage(diff);
    this.socket.send(message.toJSON());
  }
}
