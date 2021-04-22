/**
 * Represents a note within a cycle.
 */
export class Note {
  /**
   * @param freq The frequency of the note.
   * @param start The start time as a fraction of the cycle length.
   *   e.g. 0.5 means the note should start halfway through the cycle.
   * @param duration Duration of note as fraction of cycle length.
   */
  constructor(freq, start, duration) {
    this.freq = freq;
    this.start = start;
    this.duration = duration;
  }
}

/**
 * Represents a list of notes to be equally spaced within in one cycle
 * The main public interface is the get notes for next cycle
 */
export class ListSequence {
  /**
   * @param notesList A list of frequences of notes.
   */
  constructor(notesList) {
    this.notesList = notesList;
  }

  /**
   * Returns a list of Notes
   */
  getNotesForNextCycle() {
    let length = this.notesList.length;
    let duration = 1 / length;
    let result = [];

    for (let i = 0; i < length; ++i) {
      let freq = this.notesList[i];
      // TODO allow variable duration
      result.push(new Note(freq, duration * i, duration));
    }

    return result;
  }
}
