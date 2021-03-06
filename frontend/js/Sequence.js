/**
 * Represents a note within a cycle.
 */
export class Note {
  /**
   * @param freq The frequency of the note. -1 for a rest.
   * @param start The start time as a fraction of the cycle length.
   *   e.g. 0.5 means the note should start halfway through the cycle.
   * @param duration Duration of note as fraction of cycle length.
   */
  constructor(freq, start, duration) {
    this.freq = freq;
    this.start = start;
    this.duration = duration;
  }

  clone() {
    return new Note(this.freq, this.start, this.duration);
  }
}

export class BaseSequence {
  chooseRand() {
    return new RandomChoiceSequence(this);
  }

  join(sequence) {
    return new JoinSequence(this, sequence);
  }

  times(n) {
    return new MultiplySequence(this, n);
  }

  divide(n) {
    return new DivideSequence(this, n);
  }

  every(n) {
    return new EveryNSequence(this, n);
  }
}

/**
 * Represents a list of notes to be equally spaced within in one cycle
 * The main public interface is getNotesForNextCycle()
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

    let length = this.notesList.length;
    let duration = 1 / length;
    this.notes = [];

    for (let i = 0; i < notesList.length; ++i) {
      let freq = notesList[i];
      this.notes.push(new Note(freq, duration * i, duration));
    }
  }

  /**
   * Returns a list of Notes
   */
  getNotesForNextCycle() {
    return this.notes;
  }
}

/**
 * Plays notes simultaneously.
 */
export class ChordSequence extends BaseSequence {
  constructor(notesList) {
    super();
    this.notesList = notesList;
    this.notes = [];
    for (const freq of notesList) {
      this.notes.push(new Note(freq, 0, 1));
    }
  }

  getNotesForNextCycle() {
    return this.notes;
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
 * Joins 2 sequences together sequentially.
 */
export class JoinSequence extends BaseSequence {
  constructor(sequence1, sequence2) {
    super();
    this.sequence1 = sequence1;
    this.sequence2 = sequence2;
  }

  getNotesForNextCycle() {
    let notes1 = this.sequence1.getNotesForNextCycle();
    let notes2 = this.sequence2.getNotesForNextCycle();

    if (notes1.length === 0) {
      return notes2;
    }
    if (notes2.length === 0) {
      return notes1;
    }

    let result = [];

    let totalLength = notes1.length + notes2.length;
    let sequence1End = notes1.length / totalLength;
    for (let note of notes1) {
      // map to (0, sequence1End)
      note.start = mapRange(note.start, 0, 1, 0, sequence1End);
      note.duration *= notes1.length / totalLength;
      result.push(note);
    }

    for (let note of notes2) {
      // map to (sequence1End, 1)
      note.start = mapRange(note.start, 0, 1, sequence1End, 1);
      note.duration *= notes2.length / totalLength;
      result.push(note);
    }

    return result;
  }
}

/**
 * Repeats a sequence n times within one cycle.
 * For now, n should be an integer.
 */
export class MultiplySequence extends BaseSequence {
  constructor(sequence, n) {
    super();
    this.sequence = sequence;
    this.n = Math.floor(n);
    if (this.n <= 0) {
      this.n = 1;
    }
  }

  getNotesForNextCycle() {
    let result = [];
    for (let i = 0; i < this.n; ++i) {
      let startTime = i * (1 / this.n);
      let endTime = (i + 1) * (1 / this.n);
      let notes = this.sequence.getNotesForNextCycle();
      for (let note of notes) {
	note.start = mapRange(note.start, 0, 1, startTime, endTime);
	note.duration /= this.n;
	result.push(note);
      }
    }
    return result;
  }
}

/**
 * Plays a sequence n times slower.
 * For now, n should be an integer.
 */
export class DivideSequence extends BaseSequence {
  constructor(sequence, n) {
    super();
    this.sequence = sequence;
    this.n = Math.floor(n);
    if (this.n <= 0) {
      this.n = 1;
    }

    this.state = 0;
    this.originalNotes = [];
  }

  getNotesForNextCycle() {
    if (this.state === 0) {
      this.originalNotes = this.sequence.getNotesForNextCycle();
    }

    let result = [];
    for (let note of this.originalNotes) {
      let startTime = this.state * (1 / this.n);
      let endTime = (this.state + 1) * (1 / this.n);
      if (note.start >= startTime && note.start < endTime) {
	// Avoid modifying the original Note objects in this.originalNotes.
	let newNote = note.clone();
	newNote.start = mapRange(note.start, startTime, endTime, 0, 1);
	newNote.duration *= this.n;
	result.push(newNote);
      }
    }

    this.state++;
    this.state %= Math.floor(this.n);

    return result;
  }
}

/**
 * Plays a sequence every n times it is called.
 * Otherwise, produces an empty sequence.
 * n should be an integer.
 */
export class EveryNSequence extends BaseSequence {
  constructor(sequence, n) {
    super();
    this.sequence = sequence;
    this.n = Math.floor(n);
    if (this.n <= 0) {
      this.n = 1;
    }

    this.state = 0;
  }

  getNotesForNextCycle() {
    let result = [];
    if (this.state === this.n - 1) {
      result = this.sequence.getNotesForNextCycle();
    }

    this.state++;
    this.state %= Math.floor(this.n);

    return result;
  }
}

/**
 * Based on the arduino map() function.
 * https://www.arduino.cc/reference/en/language/functions/math/map/
 */
function mapRange(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * Convenience function to parse a string into a ListSequence object
 */
export function seq(text) {
  let list = text.split(" ")
      .filter(x => x.length > 0)
      .map(x => parseNote(x));
  return new ListSequence(list);
}

/**
 * Convenience function to parse a string into a ChordSequence object
 */
export function chord(text) {
  let list = text.split(" ")
      .filter(x => x.length > 0)
      .map(x => parseNote(x));
  return new ChordSequence(list);
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
