import Diagnostics from "./Diagnostics.js";
import Editor from "./Editor.js";
import { interpreterInstance } from "./Interpreter.js";
import ServerConnection from "./ServerConnection.js";

function main() {
  let editor = new Editor("editor");

  let serverConnection = new ServerConnection(editor);
  serverConnection.connect();

  let diagnostics = new Diagnostics();
  interpreterInstance.initialize(editor, diagnostics);
}


window.onload = main;
