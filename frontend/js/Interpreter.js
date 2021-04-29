import Scheduler from './Scheduler.js';
import { ListSequence, seq } from './Sequence.js';

class Interpreter {
  /**
   * @param editor An Editor object.
   */
  initialize(editor) {
    this.editor = editor;
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
  }

  startAudioEngine() {
    if (this.started === true) {
      return;
    }
    console.log("starting engine");
    this.started = true;

    let audioContext = new AudioContext();
    this.scheduler = new Scheduler(audioContext);
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
      // TODO show error message in HTML
      console.error("Error from user code.");
      console.error(error);
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

