import './styles.css';

import { Panel, PanelContainer, DrawCallback } from './canvasUI';
import { Tracker, rowToStr } from './tracker';
import { Scope } from './scope';

const can = document.createElement('canvas')!;
const ctx = can.getContext('2d')!;

can.width = window.innerWidth;
can.height = window.innerHeight;
document.body.append(can);

function resizeCanvas() {
  can.width = window.innerWidth;
  can.height = window.innerHeight;
}

window.onorientationchange = resizeCanvas;
window.onresize = resizeCanvas;

const audioCtx = new AudioContext();
const tracker = new Tracker(audioCtx);
tracker.masterGain.connect(audioCtx.destination);

const scopes: Scope[] = [];
tracker.instruments.forEach((_, i) => {
  const scope = new Scope(audioCtx);
  tracker.instruments[i].gain.connect(scope.analyser)
  scopes.push(scope);
});

class Cursor {
  channel: number = 0;
  pos: number = 0;

  moveLeft() {
    if (this.pos == 0) {
      if (this.channel == 0)
        return;
      --this.channel;
      tracker.currChannelIdx = this.channel;
      this.pos = 5;
    } else
      this.pos = Math.max(0, this.pos - 1);
  }

  moveRight() {
    if (this.pos == 5) {
      if (this.channel == 3)
        return;
      ++this.channel;
      tracker.currChannelIdx = this.channel;
      this.pos = 0;
    } else
      this.pos = Math.min(5, this.pos + 1);
  }
}

const cursor = new Cursor();

type Side = 'top' | 'bottom' | 'left' | 'right';

function drawCbChamfered(...excludedSides: Side[]): DrawCallback {
  return (ctx, bounds, state) => {
    ctx.beginPath();
    ctx.lineWidth = 2;

    ctx.strokeStyle = state.isPressed ? 'darkgray' : 'white';
    const offset = ctx.lineWidth/2;

    if (!excludedSides.includes('top')) {
      ctx.moveTo(bounds.x, bounds.y + offset);
      ctx.lineTo(bounds.x + bounds.w, bounds.y + offset);
      // can this be moved to one place?
      ctx.stroke();
    }

    if (!excludedSides.includes('left')) {
      ctx.moveTo(bounds.x + offset, bounds.y)
      ctx.lineTo(bounds.x + offset, bounds.y + bounds.h)
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = state.isPressed ? 'white' : 'darkgray';

    if (!excludedSides.includes('bottom')) {
      ctx.moveTo(bounds.x, bounds.y + bounds.h - offset);
      ctx.lineTo(bounds.x + bounds.w, bounds.y + bounds.h - offset);
      ctx.stroke();
    }

    if (!excludedSides.includes('right')) {
      ctx.moveTo(bounds.x + bounds.w - offset, bounds.y);
      ctx.lineTo(bounds.x + bounds.w - offset, bounds.y + bounds.h);
      ctx.stroke();
    }
  };
}

function drawCbCenteredText(text: string): DrawCallback {
  return (ctx, bounds, state) => {
    ctx.font = 'bold 15px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'gray';
    ctx.fillText(text, bounds.x + bounds.w/2 + 2, bounds.y + bounds.h/2 + (state.isPressed ? 2 : 0) + 2, bounds.w);

    ctx.fillStyle = 'ivory';
    ctx.fillText(text, bounds.x + bounds.w/2, bounds.y + bounds.h/2 + (state.isPressed ? 2 : 0), bounds.w);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

const trackerPanel = new PanelContainer(500, 100, 30, 21);
const pPosLabel = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('POS'));
trackerPanel.addPanel(pPosLabel, 0, 0);

const pILabel = new Panel(1, 1)
                .addDrawCallback(drawCbChamfered())
                .addDrawCallback(drawCbCenteredText('I'))
trackerPanel.addPanel(pILabel, 4, 0);

const pDLabel = new Panel(1, 1)
                .addDrawCallback(drawCbChamfered())
                .addDrawCallback(drawCbCenteredText('D'))
trackerPanel.addPanel(pDLabel, 5, 0);

const pPos = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pPos, 6, 0);

const pNums = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums, 6, 1);

const pNums2 = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums2, 6, 2);

const pNums3 = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums3, 6, 3);

const pNums4 = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums4, 6, 4);

const pNums5 = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums5, 6, 5);

const pNums6 = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums6, 6, 6);

const pNums7 = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums7, 6, 7);

const pNums8 = new Panel(4, 1)
               .addDrawCallback(drawCbChamfered())
               .addDrawCallback(drawCbCenteredText('0 0 0 0'))
trackerPanel.addPanel(pNums8, 6, 8);

const pPatternLabel = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('bottom'))
               .addDrawCallback(drawCbCenteredText('PATTERN'));
trackerPanel.addPanel(pPatternLabel, 0, 1);

const pLengthLabel = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('top'))
               .addDrawCallback(drawCbCenteredText('LENGTH'));
trackerPanel.addPanel(pLengthLabel, 0, 2);

const pFineTuneLabel = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('bottom'))
               .addDrawCallback(drawCbCenteredText('FINETUNE'));
trackerPanel.addPanel(pFineTuneLabel, 0, 3);

const pSampleLabel = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('top', 'bottom'))
               .addDrawCallback(drawCbCenteredText('SAMPLE'));
trackerPanel.addPanel(pSampleLabel, 0, 4);

const pVolumeLabel = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('top', 'bottom'))
               .addDrawCallback(drawCbCenteredText('VOLUME'));
trackerPanel.addPanel(pVolumeLabel, 0, 5);

const pLength2Label = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('top', 'bottom'))
               .addDrawCallback(drawCbCenteredText('LENGTH'));
trackerPanel.addPanel(pLength2Label, 0, 6);

const pRepeatLabel = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('top', 'bottom'))
               .addDrawCallback(drawCbCenteredText('REPEAT'));
trackerPanel.addPanel(pRepeatLabel, 0, 7);

const pRepLenLabel = new Panel(6, 1)
               .addDrawCallback(drawCbChamfered('top'))
               .addDrawCallback(drawCbCenteredText('REPLEN'));
trackerPanel.addPanel(pRepLenLabel, 0, 8);

const upArrow = drawCbCenteredText('\u{1F845}');
const downArrow = drawCbCenteredText('\u{1F847}');

const pUpArrow = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow, 10, 0);

const pDownArrow = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow, 11, 0);

const pUpArrow2 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow2, 10, 1);

const pDownArrow2 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow2, 11, 1);

const pUpArrow3 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow3, 10, 2);

const pDownArrow3 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow3, 11, 2);

const pUpArrow4 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow4, 10, 3);

const pDownArrow4 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow4, 11, 3);

const pUpArrow5 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow5, 10, 4);

const pDownArrow5 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow5, 11, 4);

const pUpArrow6 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow6, 10, 5);

const pDownArrow6 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow6, 11, 5);

const pUpArrow7 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow7, 10, 6);

const pDownArrow7 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow7, 11, 6);

const pUpArrow8 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow8, 10, 7);

const pDownArrow8 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow8, 11, 7);

const pUpArrow9 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(upArrow)
  .clickable(() => console.log('up'));
trackerPanel.addPanel(pUpArrow9, 10, 8);

const pDownArrow9 = new Panel(1, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(downArrow)
  .clickable(() => console.log('down'));
trackerPanel.addPanel(pDownArrow9, 11, 8);

const pPlayButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('PLAY'))
  //.clickable(() => play());
trackerPanel.addPanel(pPlayButton, 12, 0);

const pStopButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('STOP'))
  .clickable(() => console.log('stop'));
trackerPanel.addPanel(pStopButton, 18, 0);

const pMod2WavButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('MOD2WAV'))
  .clickable(() => console.log('mod2wav'));
trackerPanel.addPanel(pMod2WavButton, 24, 0);

const pPatternButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('PATTERN'))
  .clickable(() => console.log('pattern'));
trackerPanel.addPanel(pPatternButton, 12, 1);

const pClearButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('CLEAR'))
  .clickable(() => console.log('clear'));
trackerPanel.addPanel(pClearButton, 18, 1);

const pPat2SmpButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('PAT2SMP'))
  .clickable(() => console.log('pat2smp'));
trackerPanel.addPanel(pPat2SmpButton, 24, 1);

const pEditButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('EDIT'))
  .clickable(() => console.log('edit'));
trackerPanel.addPanel(pEditButton, 12, 2);

const pEditOpButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('EDIT OP.'))
  .clickable(() => console.log('edit op.'));
trackerPanel.addPanel(pEditOpButton, 18, 2);

const pPosEdButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('POS ED.'))
  .clickable(() => console.log('pos ed.'));
trackerPanel.addPanel(pPosEdButton, 24, 2);

const pRecordButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback((ctx, bounds) => {
    if (!tracker.isEditing)
      return;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
  })
  .addDrawCallback(drawCbCenteredText('RECORD'))
  .clickable(() => console.log('record'));
trackerPanel.addPanel(pRecordButton, 12, 3);

const pDiskOpButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('DISK OP.'))
  .clickable(() => console.log('disk op'));
trackerPanel.addPanel(pDiskOpButton, 18, 3);

const pSamplerButton = new Panel(6, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('SAMPLER'))
  .clickable(() => console.log('sampler'));
trackerPanel.addPanel(pSamplerButton, 24, 3);

const pQuadrascopeLabel = new Panel(18, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('QUADRASCOPE'));
trackerPanel.addPanel(pQuadrascopeLabel, 12, 4);

const drawCbQuadrascope: DrawCallback = (ctx, bounds) => {
  ctx.beginPath();
  const barWidth = 20;
  const scopeWidth = (bounds.w - (5 * barWidth)) / 4;
  ctx.lineWidth = 1;
  scopes.forEach((scope, i) => {
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(bounds.x + barWidth + (i*(scopeWidth + barWidth)), bounds.y, scopeWidth, bounds.h);
    ctx.strokeStyle = 'yellow';
    const sliceWidth = scopeWidth/scope.bufLen;
    scope.analyser.getByteTimeDomainData(scope.data);
    const contentStartX = bounds.x + barWidth + (i*(scopeWidth + barWidth));
    const midY = bounds.y + bounds.h/2;
    let x = contentStartX;
    for (let j = 0; j < scope.bufLen; ++j) {
      const v = scope.data[j] / 128;
      //const y = bounds.y + v * bounds.h/2;
      const y = midY + v * bounds.h/4 - bounds.h/4;
      if (j == 0)
        ctx.moveTo(x, y);
      else
        ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
  });
};

const pQuadrascope = new Panel(18, 3)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbQuadrascope);
trackerPanel.addPanel(pQuadrascope, 12, 5);

const pSignatureLeftLabel = new Panel(9, 1)
  .addDrawCallback(drawCbChamfered('right'))
  .addDrawCallback(drawCbCenteredText('YUMMYTRACKER'));
trackerPanel.addPanel(pSignatureLeftLabel, 12, 8);

const pSignatureRightLabel = new Panel(9, 1)
  .addDrawCallback(drawCbChamfered('left'))
  .addDrawCallback(drawCbCenteredText('T8-0CHIP JANUARY 1993'));
trackerPanel.addPanel(pSignatureRightLabel, 21, 8);

const pSongNameLeft = new Panel(4, 1)
  .addDrawCallback(drawCbChamfered('right'))
trackerPanel.addPanel(pSongNameLeft, 0, 9);

const pSongNameLabel = new Panel(8, 1)
  .addDrawCallback(drawCbChamfered('left', 'right'))
  .addDrawCallback(drawCbCenteredText('SONGNAME:'));
trackerPanel.addPanel(pSongNameLabel, 4, 9);

const pSongName = new Panel(11, 1)
  .addDrawCallback(drawCbChamfered('left', 'right'))
  .addDrawCallback(drawCbCenteredText('_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _  '));
trackerPanel.addPanel(pSongName, 12, 9);

const pSongTime = new Panel(7, 1)
  .addDrawCallback(drawCbChamfered('left'))
  .addDrawCallback(drawCbCenteredText('00:00'));
trackerPanel.addPanel(pSongTime, 23, 9);

const pSampleNameLeft = new Panel(4, 1)
  .addDrawCallback(drawCbChamfered('right'))
trackerPanel.addPanel(pSampleNameLeft, 0, 10);

const pSampleNameLabel = new Panel(8, 1)
  .addDrawCallback(drawCbChamfered('left', 'right'))
  .addDrawCallback(drawCbCenteredText('SAMPLENAME:'));
trackerPanel.addPanel(pSampleNameLabel, 4, 10);

const pSampleName = new Panel(11, 1)
  .addDrawCallback(drawCbChamfered('left'))
  .addDrawCallback(drawCbCenteredText('_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _  '));
trackerPanel.addPanel(pSampleName, 12, 10);

const pLoadButton = new Panel(7, 1)
  .addDrawCallback(drawCbChamfered())
  .addDrawCallback(drawCbCenteredText('LOAD'))
  .clickable(() => console.log('load'));
trackerPanel.addPanel(pLoadButton, 23, 10);

const pChannelsHeader = new Panel(30, 2)
  .addDrawCallback(drawCbChamfered('bottom'));
trackerPanel.addPanel(pChannelsHeader, 0, 11);

const skinnyBarWidth = 4;
const rowHeight = 20;

function drawCbChannel(channelNum: number): DrawCallback {
  return (ctx, bounds) => {
    const rowStrs = channelNum == -1
      ? tracker.getCurrPattern().channels[0].map((_, i) => i.toString().padStart(2, '0').split('').join(' '))
      : tracker.getCurrPattern().channels[channelNum].map(r => rowToStr(r));
    const contentStartX = bounds.x + skinnyBarWidth;
    const contentStartY = bounds.y + skinnyBarWidth;
    const contentWidth = bounds.w - skinnyBarWidth*2;
    const contentHeight = bounds.h - skinnyBarWidth*2;
    const midX = bounds.x + bounds.w/2;
    const midY = bounds.y + bounds.h/2;

    // content background
    ctx.beginPath();
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(contentStartX, contentStartY, contentWidth, bounds.h - skinnyBarWidth*2);

    // chamfer bl -> br -> tr
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.moveTo(contentStartX, contentStartY + contentHeight - ctx.lineWidth/2);
    ctx.lineTo(contentStartX + contentWidth - ctx.lineWidth/2, contentStartY + contentHeight - ctx.lineWidth/2);
    ctx.lineTo(contentStartX + contentWidth - ctx.lineWidth/2, contentStartY);
    ctx.stroke();

    // chamfer tr -> tl -> bl
    ctx.beginPath();
    ctx.strokeStyle = 'darkgray';
    ctx.moveTo(contentStartX + contentWidth - ctx.lineWidth/2, contentStartY + ctx.lineWidth/2);
    ctx.lineTo(contentStartX + ctx.lineWidth/2, contentStartY + ctx.lineWidth/2);
    ctx.lineTo(contentStartX + ctx.lineWidth/2, contentStartY + contentHeight + ctx.lineWidth/2);
    ctx.stroke();

    // cursor bar
    ctx.beginPath();
    ctx.fillStyle = 'silver';
    const cursorBarStartY = midY - rowHeight/1.2; // TODO replace magic number
    ctx.fillRect(contentStartX, cursorBarStartY, contentWidth, rowHeight);
    // chamfer top
    ctx.strokeStyle = 'white';
    ctx.moveTo(contentStartX, cursorBarStartY);
    ctx.lineTo(contentStartX + contentWidth, cursorBarStartY);
    ctx.stroke();
    // chamfer bottom
    ctx.beginPath();
    ctx.strokeStyle = 'darkgray';
    ctx.moveTo(contentStartX, cursorBarStartY + rowHeight);
    ctx.lineTo(contentStartX + contentWidth, cursorBarStartY + rowHeight);
    ctx.stroke();

    // rows
    const rowOffset = midY - rowHeight/2 - tracker.currRow*rowHeight;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'hanging';
    for (let rowNum = 0; rowNum < rowStrs.length; ++rowNum) {
      const rowStartY = rowOffset + rowNum*rowHeight;
      if (rowStartY < contentStartY)
        continue;
      if (rowStartY + rowHeight > bounds.y + bounds.h - skinnyBarWidth)
        continue;
      ctx.fillStyle = rowNum == tracker.currRow ? 'black' : 'blue';
      ctx.fillText(rowStrs[rowNum], midX, rowStartY, contentWidth);
      // cursor
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      const charWidth = ctx.measureText('---------------').width/15;
      if (cursor.channel == channelNum && rowNum == tracker.currRow) {
        const cursorWidth = cursor.pos == 0 ? charWidth*6 : charWidth*2;
        const cursorHeight = charWidth*2;
        let cursorLeft = midX - charWidth*8 + (charWidth*2*cursor.pos)
        if (cursor.pos != 0)
          cursorLeft += charWidth*4;
        ctx.strokeRect(cursorLeft, rowStartY - 6, cursorWidth, cursorHeight);
      }
    }
  };
}

const pChannelRowNum = new Panel(2, 8)
  .addDrawCallback(drawCbChamfered('top', 'right'))
  .addDrawCallback(drawCbChannel(-1))
trackerPanel.addPanel(pChannelRowNum, 0, 13);

const pChannel1 = new Panel(7, 8)
  .addDrawCallback(drawCbChamfered('top', 'left', 'right'))
  .addDrawCallback(drawCbChannel(0))
trackerPanel.addPanel(pChannel1, 2, 13);

const pChannel2 = new Panel(7, 8)
  .addDrawCallback(drawCbChamfered('top', 'left', 'right'))
  .addDrawCallback(drawCbChannel(1))
trackerPanel.addPanel(pChannel2, 9, 13);

const pChannel3 = new Panel(7, 8)
  .addDrawCallback(drawCbChamfered('top', 'left', 'right'))
  .addDrawCallback(drawCbChannel(2))
trackerPanel.addPanel(pChannel3, 16, 13);

const pChannel4 = new Panel(7, 8)
  .addDrawCallback(drawCbChamfered('top', 'left' ))
  .addDrawCallback(drawCbChannel(3))
trackerPanel.addPanel(pChannel4, 23, 13);

document.addEventListener('keydown', (e: KeyboardEvent) => {
  switch(e.key) {
    case 'd':
      trackerPanel.debug = true;
      break;
    case 'ArrowUp':
      tracker.onUp();
      break;
    case 'ArrowDown':
      tracker.onDown();
      break;
    case 'ArrowLeft':
      cursor.moveLeft();
      break;
    case 'ArrowRight':
      cursor.moveRight();
      break;
    case 'Enter':
      tracker.togglePlayPause();
      break;
    case ' ':
      tracker.toggleEditMode();
      break;
    case 'q':
    case 'w':
    case 'e':
    case 'r':
    case 't':
    case 'y':
    case 'u':
    case 'i':
    case '2':
    case 'Backspace':
      if (e.repeat)
        break;
      tracker.onKeyboardKeyPressed(e.key);
      break;
  }
});
document.addEventListener('keyup', (e: KeyboardEvent) => {
  switch(e.key) {
    case 'd':
      trackerPanel.debug = false;
      break;
    case 'q':
    case 'w':
    case 'e':
    case 'r':
    case 't':
    case 'y':
    case 'u':
    case 'i':
    case '2':
      tracker.onKeyboardKeyReleased(e.key);
      break;
  }
});

(function loop() {
  ctx.clearRect(0, 0, can.width, can.height);

  tracker.update(audioCtx);

  trackerPanel.draw(ctx);

  requestAnimationFrame(loop);
})();

