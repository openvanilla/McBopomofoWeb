import { Candidate } from "./CandidateController";

export enum ComposingBufferTextStyle {
  Normal,
  Highlighted,
}

export class ComposingBufferText {
  private text_: string;
  get text(): string {
    return this.text_;
  }

  private style_: ComposingBufferTextStyle;

  get style(): ComposingBufferTextStyle {
    return this.style_;
  }

  constructor(
    text: string,
    style: ComposingBufferTextStyle = ComposingBufferTextStyle.Normal
  ) {
    this.text_ = text;
    this.style_ = style;
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
  update(state: InputUIState): void;
}
