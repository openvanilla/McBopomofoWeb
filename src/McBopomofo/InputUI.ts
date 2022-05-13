import { Candidate } from "./CandidateController";

export enum ComposingBufferTextStyle {
  Normal = "normal",
  Highlighted = "highlighted",
}

export class ComposingBufferText {
  private text: string;
  private style: ComposingBufferTextStyle;

  constructor(
    text: string,
    style: ComposingBufferTextStyle = ComposingBufferTextStyle.Normal
  ) {
    this.text = text;
    this.style = style;
  }
}

export class InputUIState {
  composingBuffer: ComposingBufferText[];
  cursorIndex: number;
  candidates: Candidate[];
  tooltip: string;

  constructor(
    composingBuffer: ComposingBufferText[],
    cursorIndex: number,
    candidates: Candidate[],
    tooltip: string
  ) {
    this.composingBuffer = composingBuffer;
    this.cursorIndex = cursorIndex;
    this.candidates = candidates;
    this.tooltip = tooltip;
  }
}

export interface InputUI {
  reset(): void;
  commitString(text: string): void;
  update(state: string): void;
}
