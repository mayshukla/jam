import Scheduler from './Scheduler.js';
import { ListSequence, seq } from './Sequence.js';
import { SERVER_WEBSOCKET_URL } from "./common/config.js";
import { Message, FullTextMessage, DiffMessage }
from "./common/messages.js";

let s;

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

function setup() {
  // Remove event listener so setup only happens once
  let editor = document.querySelector("#editor");
  editor.removeEventListener("click", setup);

  let audioContext = new AudioContext();
  s = new Scheduler(audioContext);
  audioContext.resume();

  s.start();
}

/**
 * Fetches all the code in the input box and evaluates it.
 */
function evalUserCode() {
  let text = document.querySelector("#editor").textContent;

  try {
    // TODO find a way to not use eval
    eval(text);
  } catch (error) {
    // TODO show error message in HTML
    console.error("Error from user code.");
    console.error(error);
    return;
  }
}

function main() {
  connectToServerSocket();

  let editor = document.querySelector("#editor");

  // Chrome insists that audio stuff not be done until the user interacts with
  // the page in some way.
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  editor.addEventListener("click", setup);

  // Keep track of which keys are pressed
  // https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
  let keyStates = {};

  document.addEventListener("keydown", event => {
    keyStates[event.keyCode] = true;

    // 17 = ctrl
    // 13 = enter
    if (keyStates[17] == true
	&& keyStates[13] == true) {
      evalUserCode();
    }
  });

  document.addEventListener("keyup", event => {
    keyStates[event.keyCode] = false;
  });
}


window.onload = main;
