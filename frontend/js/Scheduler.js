export default class Scheduler {
  constructor(audioContext, diagnostics) {
    this.audioContext = audioContext;
    this.diagnostics = diagnostics;

    // Period to call lookAheadAndSchedule.
    this.lookAheadAndSchedulePeriod = 25; // ms
    // Amount of time in which lookAheadAndSchedule will start scheduling the
    // next cycle.
    this.scheduleAheadTime = 0.1; // seconds

    this.cyclesPerSecond = 1;

    this.oscillators = new Map();
    this.oscillatorsBackup = new Map();

    // Place a gain node before final output to allow muting everything.
    this.destination = audioContext.createGain();
    this.destination.connect(this.audioContext.destination);

    // True if this.oscillators has been modified by the user since the last
    // scheduling event.
    this.dirty = false;
  }

  /**
   * Start scheduling notes.
   */
  start() {
    // Start the next cycle in 0.5 seconds
    this.nextCycleStartTime = this.audioContext.currentTime + 0.5;
    this.lookAheadAndSchedule();
  }

  setCyclesPerSecond(cyclesPerSecond) {
    this.cyclesPerSecond = cyclesPerSecond;
  }

  /**
   * Adds or updates the oscillator with the given name
   * Oscillators are named to allow updating.
   * @param name The oscillators name as a string.
   * @param oscillatorBuilder An OscillatorBuilder instance
   * @param sequence The sequence object (e.g. a ListSequence)
   */
  play(name, oscillatorBuilder, sequence) {
    // Unmute in case previously muted.
    this.unmute();

    if (this.dirty === false) {
      this.backupState();
    }
    this.dirty = true;

    this.oscillators.set(name, {
      "oscillatorBuilder": oscillatorBuilder,
      "sequence": sequence
    });

    this.diagnostics.clear();
    this.diagnostics.print(this.getStatusString());
  }

  backupState() {
    this.oscillatorsBackup.clear();
    for (const keyValue of this.oscillators.entries()) {
      const key = keyValue[0];
      const value = keyValue[1];
      this.oscillatorsBackup.set(key, value);
    }
  }

  restoreState() {
    this.oscillators.clear();
    for (const keyValue of this.oscillatorsBackup.entries()) {
      const key = keyValue[0];
      const value = keyValue[1];
      this.oscillators.set(key, value);
    }
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

      try {
	this.oscillators.forEach(oscillator => {
	  let notes = oscillator.sequence.getNotesForNextCycle();
	  let oscillatorBuilder = oscillator.oscillatorBuilder;
	  notes.forEach(note => {
	    let freq = note.freq;

	    if (freq < 0) {
	      // Rest
	      return;
	    }

	    // Convert to seconds
	    let startTime = cycleStartTime + note.start * (1/this.cyclesPerSecond);
	    let duration = note.duration * (1/this.cyclesPerSecond);

	    this.scheduleOscillator(
	      oscillatorBuilder,
	      freq,
	      startTime,
	      duration);
	  });
	});

      } catch (error) {
	this.diagnostics.clear();
	this.diagnostics.printError("Error during scheduling. Restoring previous state.");
	this.diagnostics.printError(error);
	this.restoreState();
      }

      this.dirty = false;
    }

    window.setTimeout(
      () => this.lookAheadAndSchedule(),
      this.lookAheadAndSchedulePeriod
    );
  }

  /**
   * Schedules an oscillator to play at startTime.
   * @param oscillatorBuilder An OscillatorBuilder instance.
   * @param freq The frequency to play.
   * @param startTime Start time (absolute) in seconds.
   * @param duration Duration in seconds.
   */
  scheduleOscillator(oscillatorBuilder, freq, startTime, duration) {
    let osc = oscillatorBuilder.getOscillator(this.audioContext);
    osc.connect(this.destination);
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Stops sound and removes all oscillators.
   */
  stop() {
    this.mute();
    this.oscillators.clear();
  }

  mute() {
    this.destination.gain.setValueAtTime(0, this.audioContext.currentTime);
  }

  unmute() {
    this.destination.gain.setValueAtTime(1, this.audioContext.currentTime);
  }

  /**
   * Returns a string that shows some info about the state of the scheduler.
   * This can be printed to the user using Diagnostics.
   */
  getStatusString() {
    let status = "";

    status += "Oscillators:<br/>";
    for (const keyValue of this.oscillators.entries()) {
      const name = keyValue[0];
      const value = keyValue[1];
      status += name + ": ";
      status += value.oscillatorBuilder.type + "<br/>";
    }

    return status;
  }
}
