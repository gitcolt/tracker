const DEFAULT_NUM_CHANNELS = 4;
const ROW_HEIGHT = 20;
const MIN_CHANNEL_SLOTS = 4;

enum NoteType {
  NONE = '---',
  C_2 = 'C-2',
  C_SHARP_2 = 'C#2',
  D_2 = 'D-1',
  E_2 = 'E-2',
  F_2 = 'F-2',
  G_FLAT_2 = 'Gb2',
  G_2 = 'G-2',
  A_3 = 'A-3',
  B_3 = 'B-3',
}

enum ModifierType {
  MODIFIER_A,
  MODIFIER_B,
}

interface TrackerRow {
  note: NoteType,
  instrument: number,
  modifier: ModifierType,
}

function createTrackerRow(): TrackerRow {
  return {
    note: NoteType.NONE,
    instrument: 0,
    modifier: ModifierType.MODIFIER_A,
  };
}

function rowToStr(row: TrackerRow) {
  const noteStr = row.note.split('').join(' ');
  const instrumentStr = row.instrument.toString().padStart(2, '0').split('').join(' ');
  const modifierStr = '000'.split('').join(' ');
  return `${noteStr} ${instrumentStr} ${modifierStr}`;
}

interface Pattern {
  channels: TrackerRow[][];
  length: number;
}

function createPattern(): Pattern {
  const length = 16;
  const channels: TrackerRow[][] = [];
  for (let i = 0; i < DEFAULT_NUM_CHANNELS; ++i) {
    const channel: TrackerRow[] = [];
    for (let j = 0; j < length; ++j)
      channel.push(createTrackerRow());
    channels.push(channel);
  }

  return { channels, length };
}

class PatternModule {
  private pattern: Pattern;
  private currRow: number = 0;
  private cursorPos: number = 0;

  constructor() {
    this.pattern = createPattern();

    document.addEventListener('keydown', e => {
      switch(e.key) {
        case 'ArrowUp':
          if (this.currRow > 0)
            --this.currRow;
          break;
        case 'ArrowDown':
          if (this.currRow < this.pattern.length - 1)
            ++this.currRow;
          break;
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D,
       startX: number, startY: number,
       width: number, height: number) {
    ctx.beginPath();
    /* The row number column is just some small fraction of the total width
     * that makes its font size similar to the other columns' font size.
     * Could figure out how to make them exacly the same instead
     */
    const rowNumColWidth = width / 25;
    const w = width - rowNumColWidth;
    const h = height;
    const gutterWidth = 5;
    const channelWidth = (w - (this.pattern.channels.length + 1) * gutterWidth) / this.pattern.channels.length;
    const rowGutterHeight = 3;
    const rowOffset = h / 2 - (ROW_HEIGHT) - (this.currRow * (ROW_HEIGHT + rowGutterHeight));

    // background
    ctx.fillStyle = 'blue';
    ctx.fillRect(startX, startY, w, h);

    // channel slot
    const numSlots = Math.max(this.pattern.channels.length, MIN_CHANNEL_SLOTS);
    for (let channelIdx = 0; channelIdx < numSlots; ++channelIdx) {
      ctx.fillStyle = 'red';
      const channelStartX = startX + rowNumColWidth + gutterWidth + (channelIdx * (channelWidth + gutterWidth));
      ctx.fillRect(channelStartX, startY, channelWidth, h);
      for (let row = 0; row < this.pattern.length; ++row) {
        // row
        ctx.fillStyle = row == this.currRow ? 'gray' : 'yellow';
        const rowStartY = startY + rowOffset + (row * (ROW_HEIGHT + rowGutterHeight));

        if (!this.pattern.channels[channelIdx])
          continue;
        if (rowStartY < startY
            || (rowStartY + ROW_HEIGHT - rowGutterHeight) > startY + height)
          continue;

        ctx.fillRect(startX, rowStartY, rowNumColWidth, ROW_HEIGHT);
        ctx.fillRect(channelStartX, rowStartY, channelWidth, ROW_HEIGHT);

        ctx.fillStyle = 'black';
        ctx.font = '20px Courier New';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        const rowNumStr = row.toString().padStart(2, '0').split('').join(' ');
        ctx.fillText(rowNumStr, startX + rowNumColWidth / 2, rowStartY + (ROW_HEIGHT / 2), rowNumColWidth);
        ctx.fillText(rowToStr(this.pattern.channels[channelIdx][row]), channelStartX + channelWidth / 2, rowStartY + (ROW_HEIGHT / 2), channelWidth - 10);
      }
    }

    // cursor
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 5;
    const textWidth = ctx.measureText('- - - - - - - -').width;
    ctx.strokeRect(startX + rowNumColWidth + gutterWidth + (channelWidth / 2) - (textWidth / 2) + (textWidth / 8) * 0, startY + rowOffset, 10, 10);
  }
};

export class Tracker {
  private ctx: CanvasRenderingContext2D;
  private strokeColor = 'blue';
  private strokeWidth = 1;
  private samples: string[] = ['sample_a', 'sample_b', 'sample_c'];
  private sequence: Pattern[];
  private patternModule: PatternModule;
  private currSequenceIdx: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.sequence = [createPattern()];
    this.patternModule = new PatternModule();
  }

  draw() {
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;
    this.patternModule.draw(this.ctx, 100, 100, 700, 500);
  }
}
