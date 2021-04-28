import Scheduler from './Scheduler.js';
import { ListSequence, seq } from './Sequence.js';

class Interpreter {
  /**
   * @param editorElement The Element which contains the user's code in its
   * textContent field.
   */
  initialize(editorElement) {
    this.editorElement = editorElement;
    this.started = false;
    this.scheduler = null;

    // Chrome insists that audio stuff not be done until the user interacts with
    // the page in some way.
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
    this.editorElement.addEventListener(
      "click",
      () => this.startAudioEngine());

    // Keep track of which keys are pressed
    // https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
    this.keyStates = {};

    document.addEventListener("keydown", event => {
      this.keyStates[event.keyCode] = true;
      
      // 17 = ctrl
      // 13 = enter
      if (this.keyStates[17] == true
	  && this.keyStates[13] == true) {
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
    this.started = true;

    // Remove event listener so setup only happens once
    this.editorElement.removeEventListener("click", this.startAudioEngine);

    let audioContext = new AudioContext();
    this.scheduler = new Scheduler(audioContext);
    audioContext.resume();

    this.scheduler.start();
  }

  /**
   * Fetches all the code in the input box and evaluates it.
   */
  evalUserCode() {
    let text = this.editorElement.textContent;
    
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

