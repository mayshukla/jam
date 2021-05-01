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

export class BaseSequence {
  chooseRand() {
    return new RandomChoiceSequence(this);
  }
}

/**
 * Represents a list of notes to be equally spaced within in one cycle
 * The main public interface is the get notes for next cycle
 */
export class ListSequence extends BaseSequence {
  /**
   * @param notesList A list of frequences of notes.
   *
   * A frequency of -1 represents a rest.
   */
  constructor(notesList) {
    super();
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
      // Do not push rests to result.
      if (freq > 0) {
	// TODO allow variable duration
	result.push(new Note(freq, duration * i, duration));
      }
    }

    return result;
  }
}

/**
 * Chooses one note from the given sequence to play.
 */
export class RandomChoiceSequence extends BaseSequence {
  constructor(sequence) {
    super();
    this.sequence = sequence;
  }

  getNotesForNextCycle() {
    let notes = this.sequence.getNotesForNextCycle();

    if (notes.length === 0) {
      return [];
    }

    let index = Math.floor(Math.random() * notes.length);
    let note = notes[index];
    note.start = 0;
    note.length = 1;
    note.duration = 1;
    return [note];
  }
}

/**
 * Convenience function to turn a string into a ListSequence object
 */
export function seq(text) {
  let list = text.split(" ")
      .filter(x => x.length > 0)
      .map(x => parseNote(x));
  return new ListSequence(list);
}


let A4 = 440.0;
let semitone = Math.pow(2, 1/12);
let ratioToA = {
  "c": Math.pow(semitone, -9),
  "d": Math.pow(semitone, -7),
  "e": Math.pow(semitone, -5),
  "f": Math.pow(semitone, -4),
  "g": Math.pow(semitone, -2),
  "a": Math.pow(semitone, 0),
  "b": Math.pow(semitone, 2),
};

/**
 * Converts a note name such as "A4" to a frequency such as 440.0.
 * "x" will be converted into a rest (frequence = -1).
 */
function parseNote(noteName) {
  let letter = noteName.slice(0, 1);
  letter = letter.toLowerCase();

  if (letter === "x") {
    return -1;
  }

  let flatOrSharp = noteName.slice(1, 2);

  let octave;
  let multiplier = 1;
  if (flatOrSharp === "b") {
    octave = noteName.slice(2);
    multiplier = 1 / semitone;
  } else if (flatOrSharp === "#") {
    octave = noteName.slice(2);
    multiplier = semitone;
  } else {
    octave = noteName.slice(1);
  }

  octave = parseInt(octave);

  let freq = A4 * ratioToA[letter] * multiplier;
  freq *= Math.pow(2, octave - 4);

  return freq;
}
