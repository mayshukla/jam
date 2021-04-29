import Editor from "./Editor.js";
import { interpreterInstance } from "./Interpreter.js";
import ServerConnection from "./ServerConnection.js";

function main() {
  let editor = new Editor("editor");

  let serverConnection = new ServerConnection(editor);
  serverConnection.connect();

  interpreterInstance.initialize(editor);
}


window.onload = main;
