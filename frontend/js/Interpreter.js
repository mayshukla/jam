import Scheduler from './Scheduler.js';
import { ListSequence, seq } from './Sequence.js';
import { BaseOscillatorBuilder } from './OscillatorBuilder.js';

class Interpreter {
  /**
   * @param editor An Editor object.
   * @param diagnostics A Diagnostics object.
   */
  initialize(editor, diagnostics) {
    this.editor = editor;
    this.diagnostics = diagnostics;
    this.started = false;
    this.scheduler = null;

    // Keep track of which keys are pressed
    // https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
    this.keyStates = {};

    document.addEventListener("keydown", event => {
      this.keyStates[event.keyCode] = true;

      // 18 = alt
      // 82 = 'r'
      if (this.keyStates[18] == true
	  && this.keyStates[82] == true) {
	if (this.started !== true) {
	  this.startAudioEngine();
	}
	this.evalUserCode();
      }
    });

    document.addEventListener("keyup", event => {
      this.keyStates[event.keyCode] = false;
    });

    let stopButton = document.querySelector("#stop-button");
    stopButton.addEventListener("click", () => {
      if (this.scheduler !== null
	 && this.scheduler !== undefined) {
	this.scheduler.stop();
      }
    });
  }

  startAudioEngine() {
    if (this.started === true) {
      return;
    }
    console.log("starting engine");
    this.started = true;

    let audioContext = new AudioContext();
    this.scheduler = new Scheduler(audioContext, this.diagnostics);
    audioContext.resume();

    this.scheduler.start();
  }

  /**
   * Fetches all the code in the input box and evaluates it.
   */
  evalUserCode() {
    let text = this.editor.getText();
    
    try {
      // TODO find a way to not use eval
      eval(text);
    } catch (error) {
      this.diagnostics.clear();
      this.diagnostics.printError(error);
      return;
    }
  }
}

export const interpreterInstance = new Interpreter();

/**
 * Convenience function for user code.
 */
function play(name, type, sequence) {
  interpreterInstance.scheduler.play(name, type, sequence);
}

function setCyclesPerSecond(cps) {
  interpreterInstance.scheduler.setCyclesPerSecond(cps);
}

/**
 * @param type (optional) Type of oscillator (e.g. "sine").
 */
function osc(type) {
  let osc = new BaseOscillatorBuilder();
  if (typeof type === "string") {
    osc.setType(type);
  }
  return osc;
}

