/**
 * The getOscillator() method is used by the scheduler to create a web audio
 * API OscillatorNode object.
 */
export class BaseOscillatorBuilder {
  constructor() {
    this.type = "sine";
  }

  setType(type) {
    this.type = type;
    return this;
  }

  getOscillator(audioContext) {
    let osc = audioContext.createOscillator();
    osc.type = this.type;
    return osc;
  }
}
