import { interpreterInstance } from "./Interpreter.js";
import ServerConnection from "./ServerConnection.js";

function main() {
  let editor = document.querySelector("#editor");

  let serverConnection = new ServerConnection(editor);
  serverConnection.connect();

  interpreterInstance.initialize(editor);
}


window.onload = main;
