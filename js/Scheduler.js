export default class Scheduler {
  constructor(audioContext) {
    this.audioContext = audioContext;

    // Period to call lookAheadAndSchedule.
    this.lookAheadAndSchedulePeriod = 25; // ms
    // Amount of time in which lookAheadAndSchedule will start scheduling the
    // next cycle.
    this.scheduleAheadTime = 0.1; // seconds

    this.cyclesPerSecond = 1;

    this.oscillators = new Map();
  }

  /**
   * Start scheduling notes.
   */
  start() {
    // Start the next cycle in 1 second
    this.nextCycleStartTime = this.audioContext.currentTime + 1;
    this.lookAheadAndSchedule();
  }

  setCyclesPerSecond(cyclesPerSecond) {
    this.cyclesPerSecond = cyclesPerSecond;
  }

  /**
   * Adds or updates the oscillator with the given name
   * Oscillators are named to allow updating.
   * @param name The oscillators name as a string.
   * @param type The type of oscillator (e.g. "sine").
   * @param sequence The sequence object (e.g. a ListSequence)
   */
  setOscillator(name, type, sequence) {
    this.oscillators.set(name, {
      "type": type,
      "sequence": sequence
    });
  }

  /**
   * Looks ahead (based on this.lookAheadAndSchedulePeriod) and schedules
   * sounds if neccessary.
   * This method will call setTimeout to call itself again.
   *
   * TODO make this more robust for when there are a lot of events to schedule
   * for one cycle
   *
   * The main idea behind this method comes from this article:
   * https://www.html5rocks.com/en/tutorials/audio/scheduling/
   */
  lookAheadAndSchedule() {
    if ((this.nextCycleStartTime - this.audioContext.currentTime)
	<= this.scheduleAheadTime) {
      let cycleStartTime = this.nextCycleStartTime;
      this.nextCycleStartTime += 1 / this.cyclesPerSecond;

      this.oscillators.forEach(oscillator => {
	let notes = oscillator.sequence.getNotesForNextCycle();
	let type = oscillator.type;
	notes.forEach(note => {
	  let freq = note.freq;

	  // Convert to seconds
	  let startTime = cycleStartTime + note.start * (1/this.cyclesPerSecond);
	  let duration = note.duration * (1/this.cyclesPerSecond);

	  this.scheduleOscillator(
	    type,
	    freq,
	    startTime,
	    duration);
	});
      });
    }

    window.setTimeout(
      () => this.lookAheadAndSchedule(),
      this.lookAheadAndSchedulePeriod
    );
  }

  /**
   * Schedules an oscillator to play at startTime.
   * @param type The type of oscillator (e.g. "sine").
   * @param freq The frequency to play.
   * @param startTime Start time (absolute) in seconds.
   * @param duration Duration in seconds.
   */
  scheduleOscillator(type, freq, startTime, duration) {
    // TODO can we avoid creating an oscillator every time?
    let osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.connect(this.audioContext.destination);
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}
