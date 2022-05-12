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

export interface InputUI {
  reset(): void;

  append(text: ComposingBufferText): void;
  setCursorIndex(index: number): void;
  setCandidates(candidates: Candidate[]): void;
  setTooltip(tooltip: string): void;

  commitString(text: string): void;

  update(): void;
}
