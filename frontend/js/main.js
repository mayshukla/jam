import { interpreterInstance } from './Interpreter.js';
import { ListSequence, seq } from './Sequence.js';
import { SERVER_WEBSOCKET_URL } from "./common/config.js";
import { Message, FullTextMessage, DiffMessage }
from "./common/messages.js";

function connectToServerSocket() {
  const socket = new WebSocket(SERVER_WEBSOCKET_URL);

  socket.addEventListener("open", (event) => {
    console.log("Connected to server websocket.");
  });

  socket.addEventListener("message", (event) => {
    let message = Message.fromJSON(event.data);
    console.log("got message from server:", message);
  });
}

function main() {
  connectToServerSocket();

  let editor = document.querySelector("#editor");

  interpreterInstance.initialize(editor);
}


window.onload = main;
