import Scheduler from './Scheduler.js';
import { ListSequence } from './Sequence.js';

function setup() {
  let audioContext = new AudioContext();
  let scheduler = new Scheduler(audioContext);
  audioContext.resume();

  let sequence1 = new ListSequence([220.0000, 261.6256, 329.6276]);
  scheduler.setOscillator("osc1", "square", sequence1);
  let sequence2 = new ListSequence(
    [220.0000 * 2, 261.6256 * 2, 329.6276 * 2, 261.6256 * 2]);
  scheduler.setOscillator("osc2", "sine", sequence2);

  scheduler.start();

}

function main() {
  let editor = document.querySelector("#editor");

  // Chrome insists that audio stuff not be done until the user interacts with
  // the page in some way.
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  editor.addEventListener("click", setup);
}


window.onload = main;
