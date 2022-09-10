const SCOPE_FFT_SIZE = 2048;

export class Scope {
  analyser: AnalyserNode;
  data: Uint8Array;
  bufLen: number;

  constructor(audioCtx: AudioContext) {
    this.analyser = new AnalyserNode(audioCtx);
    this.analyser.fftSize = SCOPE_FFT_SIZE;
    this.bufLen = this.analyser.frequencyBinCount;
    this.data = new Uint8Array(this.bufLen);
  }
}
