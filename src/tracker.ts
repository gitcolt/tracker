const DEFAULT_NUM_CHANNELS = 4;

const NOTE_LEN = 0.1;
const NOTE_FULL_LEN = 0.5;
const MAX_LOOKAHEAD_TIME = 0.55;

interface Note {
  label: string,
  freq: number | null,
}

interface NoteSet {
  [key: string]: Note,
}

const Notes: NoteSet = {
  NONE:      { label: '---', freq: null },
  C_4:       { label: 'C-4', freq: 261.63 },
  C_SHARP_4: { label: 'C#4', freq: 277.18 },
  D_4:       { label: 'D-4', freq: 293.66 },
  E_4:       { label: 'E-4', freq: 329.63 },
  F_4:       { label: 'F-4', freq: 349.23 },
  G_4:       { label: 'G-4', freq: 392.0 },
  A_4:       { label: 'A-4', freq: 440.0 },
  B_4:       { label: 'B-4', freq: 493.88 },
};

const keyToNote = new Map<string, Note>();
keyToNote.set('q', Notes.C_4);
keyToNote.set('2', Notes.C_SHARP_4);
keyToNote.set('w', Notes.D_4);
keyToNote.set('e', Notes.E_4);
keyToNote.set('r', Notes.F_4);
keyToNote.set('t', Notes.G_4);
keyToNote.set('y', Notes.A_4);
keyToNote.set('u', Notes.B_4);


enum ModifierType {
  MODIFIER_A,
  MODIFIER_B,
}

interface TrackerRow {
  note: Note,
  instrumentIdx: number,
  modifier: ModifierType,
}

function createTrackerRow(note: Note): TrackerRow {
  return {
    note,
    instrumentIdx: 0,
    modifier: ModifierType.MODIFIER_A,
  };
}

export function rowToStr(row: TrackerRow) {
  const noteStr = row.note.label.split('').join(' ');
  const instrumentStr = row.instrumentIdx.toString().padStart(2, '0').split('').join(' ');
  const modifierStr = '000'.split('').join(' ');
  return `${noteStr} ${instrumentStr} ${modifierStr}`;
}

interface Pattern {
  channels: TrackerRow[][];
  length: number;
}

function createPattern(length: number): Pattern {
  const channels: TrackerRow[][] = [];
  for (let i = 0; i < DEFAULT_NUM_CHANNELS; ++i) {
    const channel: TrackerRow[] = [];
    for (let j = 0; j < length; ++j) {
      let note;
      if (i == 0) {
        note = j % 2 == 0 ? Notes.NONE : Notes.E_4;
      } else if (i == 1) {
        note = j % 2 == 0 ? Notes.D_4 : Notes.NONE;
      } else {
        note = Notes.NONE;
      }
      channel.push(createTrackerRow(note));
    }
    channels.push(channel);
  }

  return { channels, length };
}

export class Instrument {
  private audioCtx: AudioContext;
  //private osc?: OscillatorNode;
  private hasStarted: boolean = false;
  private oscillatorType: OscillatorType;
  private gain: GainNode;

  constructor(audioCtx: AudioContext, masterGain: GainNode, type: OscillatorType) {
    this.audioCtx = audioCtx;
    this.oscillatorType = type;
    this.gain = new GainNode(audioCtx);
    this.gain.connect(masterGain);
  }

  schedule(freq: number, time: number) {
    const osc = new OscillatorNode(this.audioCtx, {
      type: this.oscillatorType,
      frequency: freq,
    });
    osc.connect(this.gain);
    osc.frequency.value = freq;
    osc.start(time);
    return osc;
  }
}

export class Tracker {
  sequence: Pattern[];
  instruments: Instrument[];
  currSequenceIdx: number = 0;
  currRow: number = 0;
  masterGain: GainNode;
  isPlaying: boolean = false;
  private nextRowIdxToBeScheduled = 0;
  private keyboardInstrument: Instrument;
  private audioCtx: AudioContext;
  private keyboardOscillators: {[key: number]: OscillatorNode} = {};

  constructor(audioCtx: AudioContext) {
    this.masterGain = new GainNode(audioCtx);
    this.masterGain.connect(audioCtx.destination);
    this.sequence = [createPattern(16)];
    this.instruments = [
      new Instrument(audioCtx, this.masterGain, 'sine'),
      new Instrument(audioCtx, this.masterGain, 'square'),
      new Instrument(audioCtx, this.masterGain, 'triangle'),
      new Instrument(audioCtx, this.masterGain, 'sawtooth'),
    ];
    this.keyboardInstrument = new Instrument(audioCtx, this.masterGain, 'sawtooth');
    this.audioCtx = audioCtx;
  }

  onUp() {
    if (this.isPlaying)
      return;
    this.moveCursorUp();
  }

  onDown() {
    if (this.isPlaying)
      return;
    this.moveCursorDown();
  }

  onKeyboardKeyPressed(key: string) {
    const note = keyToNote.get(key);
    if (!note)
      return;
    const osc = this.keyboardInstrument.schedule(note.freq!, this.audioCtx.currentTime);
    this.keyboardOscillators[note.freq!] = osc;
  }

  onKeyboardKeyReleased(key: string) {
    const note = keyToNote.get(key);
    if (!note)
      return;
    this.keyboardOscillators[note.freq!].stop(this.audioCtx.currentTime);
    delete this.keyboardOscillators[note.freq!];
  }

  getCurrPattern(): Pattern {
    return this.sequence[this.currSequenceIdx];
  }

  moveCursorDown() {
    const currPattern = this.getCurrPattern();
    this.currRow = Math.min(currPattern.length - 1, this.currRow + 1);
  }

  moveCursorUp() {
    this.currRow = Math.max(0, this.currRow - 1);
  }

  play() {
    if (this.isPlaying)
      return;
    this.nextRowIdxToBeScheduled = this.currRow;
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  scheduleNotes(now: number) {
    while (true) {
      const lookaheadTime = (this.nextRowIdxToBeScheduled - this.currRow) * NOTE_FULL_LEN;
      if (lookaheadTime > MAX_LOOKAHEAD_TIME)
        break;
      if (this.nextRowIdxToBeScheduled >= this.getCurrPattern().channels[0].length) {
        setTimeout(() => {this.isPlaying = false;}, lookaheadTime*1000);
        break;
      }
      this.getCurrPattern().channels.forEach((rows, i) => {
        const rowToBeScheduled = rows[this.nextRowIdxToBeScheduled];
        const note = rowToBeScheduled.note;
        if (note.freq) {
          const osc = this.instruments[i].schedule(note.freq, now + lookaheadTime);
          osc.stop(now + lookaheadTime + NOTE_LEN);
        }
      });
      this.nextRowIdxToBeScheduled++
      setTimeout(() => this.moveCursorDown(), (lookaheadTime + NOTE_FULL_LEN)*1000);
    }
  }

  update(audioCtx: AudioContext) {
    if (!this.isPlaying)
      return;
    const now = audioCtx.currentTime;
    this.scheduleNotes(now);
  }
}
