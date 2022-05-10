export interface InputState {}

// Empty state, the ground state of a state machine.
//
// When a state machine implementation enters this state, it may produce a side
// effect with the previous state. For example, if the previous state is
// Inputting, and an implementation enters Empty, the implementation may commit
// whatever is in Inputting to the input method context.
export class Empty implements InputState {}

// Empty state with no consideration for any previous state.
//
// When a state machine implementation enters this state, it must not produce
// any side effect. In other words, any previous state is discarded. An
// implementation must continue to enter Empty after this, so that no use sites
// of the state machine need to check for both Empty and EmptyIgnoringPrevious
// states.
export class EmptyIgnoringPrevious implements InputState {}

// Committing text.
export class Committing implements InputState {
  private text_: string;
  get text(): string {
    return this.text_;
  }

  constructor(text: string) {
    this.text_ = text;
  }
}

// NotEmpty state that has a non-empty composing buffer ("preedit" in some IME
// frameworks).
export class NotEmpty implements InputState {
  private composingBuffer_: string;
  private cursorIndex_: number;
  private tooltip_: string;

  get composingBuffer(): string {
    return this.composingBuffer_;
  }
  get cursorIndex(): number {
    return this.cursorIndex_;
  }
  get tooltip(): string {
    return this.tooltip_;
  }

  constructor(buf: string, index: number, tooltipText: string = "") {
    this.composingBuffer_ = buf;
    this.cursorIndex_ = index;
    this.tooltip_ = this.tooltip;
  }
}

// Inputting state with an optional field to commit evicted ("popped") segments
// in the composing buffer.
export class Inputting extends NotEmpty {
  evictedText: string = "";

  constructor(buf: string, index: number, tooltipText: string = "") {
    super(buf, index, tooltipText);
  }
}

// Candidate selecting state with a non-empty composing buffer.
export class ChoosingCandidate extends NotEmpty {
  private candidates_: string[];
  get candidates(): string[] {
    return this.candidates_;
  }

  constructor(buf: string, index: number, cs: string[]) {
    super(buf, index);
    this.candidates_ = cs;
  }
}

// Represents the Marking state where the user uses Shift-Left/Shift-Right to
// mark a phrase to be added to their custom phrases. A Marking state still has
// a composingBuffer, and the invariant is that composingBuffer = head +
// markedText + tail. Unlike cursorIndex, which is UTF-8 based,
// markStartGridCursorIndex is in the same unit that a Gramambular's grid
// builder uses. In other words, markStratGridCursorIndex is the beginning
// position of the reading cursor. This makes it easy for a key handler to know
// where the marked range is when combined with the grid builder's (reading)
// cursor index.
export class Marking extends NotEmpty {
  private markStartGridCursorIndex_: number;
  private head_: string;
  private markedText_: string;
  private tail_: string;
  private reading_: string;
  private acceptable_: boolean;

  get markStartGridCursorIndex(): number {
    return this.markStartGridCursorIndex_;
  }
  get head(): string {
    return this.head_;
  }
  get markedText(): string {
    return this.markedText_;
  }
  get tail(): string {
    return this.tail_;
  }
  get reading(): string {
    return this.reading_;
  }
  get acceptable(): boolean {
    return this.acceptable_;
  }

  constructor(
    buf: string,
    index: number,
    tooltipText: string,
    startCursorIndexInGrid: number,
    headText: string,
    markedText: string,
    tailText: string,
    readingText: string,
    canAccept: boolean
  ) {
    super(buf, index, tooltipText);
    this.markStartGridCursorIndex_ = startCursorIndexInGrid;
    this.head_ = headText;
    this.markedText_ = markedText;
    this.tail_ = tailText;
    this.reading_ = readingText;
    this.acceptable_ = canAccept;
  }
}
