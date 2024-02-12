/**
 * @file
 * The states for the input method module.
 *
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Candidate } from "../Gramambular2";

/**
 * The interface for all of the states.
 */
export interface InputState {}

/**
 * Empty state, the ground state of a state machine.
 *
 * When a state machine implementation enters this state, it may produce a side
 * effect with the previous state. For example, if the previous state is
 * Inputting, and an implementation enters Empty, the implementation may commit
 * whatever is in Inputting to the input method context.
 */
export class Empty implements InputState {
  toString(): string {
    return "Empty";
  }
}

/**
 * Empty state with no consideration for any previous state.
 *
 * When a state machine implementation enters this state, it must not produce
 * any side effect. In other words, any previous state is discarded. An
 * implementation must continue to enter Empty after this, so that no use sites
 * of the state machine need to check for both Empty and EmptyIgnoringPrevious
 * states.
 */
export class EmptyIgnoringPrevious implements InputState {
  toString(): string {
    return "EmptyIgnoringPrevious";
  }
}

/**  The state for committing text into the desired application. */
export class Committing implements InputState {
  readonly text: string;

  constructor(text: string) {
    this.text = text;
  }

  toString(): string {
    return "Committing " + this.text;
  }
}

/**
 * NotEmpty state that has a non-empty composing buffer ("preedit" in some IME
 * frameworks).
 */
export class NotEmpty implements InputState {
  readonly composingBuffer: string;
  readonly cursorIndex: number;
  readonly tooltip: string;

  constructor(buf: string, index: number, tooltipText: string = "") {
    this.composingBuffer = buf;
    this.cursorIndex = index;
    this.tooltip = tooltipText;
  }

  toString(): string {
    return "NotEmpty";
  }
}

/**
 * Inputting state with an optional field to commit evicted ("popped") segments
 * in the composing buffer.
 */
export class Inputting extends NotEmpty {
  constructor(buf: string, index: number, tooltipText: string = "") {
    super(buf, index, tooltipText);
  }

  toString(): string {
    return "Inputting " + this.composingBuffer + " tooltip:" + this.tooltip;
  }
}

/** Candidate selecting state with a non-empty composing buffer. */
export class ChoosingCandidate extends NotEmpty {
  readonly candidates: Candidate[];

  constructor(buf: string, index: number, cs: Candidate[]) {
    super(buf, index);
    this.candidates = cs;
  }

  toString(): string {
    return "ChoosingCandidate " + this.candidates;
  }
}

/**
 * Represents the Marking state where the user uses Shift-Left/Shift-Right to
 * mark a phrase to be added to their custom phrases. A Marking state still has
 * a composingBuffer, and the invariant is that composingBuffer = head +
 * markedText + tail. Unlike cursorIndex, which is UTF-8 based,
 * markStartGridCursorIndex is in the same unit that a Gramambular's grid
 * builder uses. In other words, markStartGridCursorIndex is the beginning
 * position of the reading cursor. This makes it easy for a key handler to know
 * where the marked range is when combined with the grid builder's (reading)
 * cursor index.
 */
export class Marking extends NotEmpty {
  readonly markStartGridCursorIndex: number;
  readonly head: string;
  readonly markedText: string;
  readonly tail: string;
  readonly reading: string;
  readonly acceptable: boolean;

  toString(): string {
    return "Marking " + this.markStartGridCursorIndex + "" + this.cursorIndex;
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
    this.markStartGridCursorIndex = startCursorIndexInGrid;
    this.head = headText;
    this.markedText = markedText;
    this.tail = tailText;
    this.reading = readingText;
    this.acceptable = canAccept;
  }
}

export class SelectingDictionary extends NotEmpty {
  readonly previousState: NotEmpty;
  readonly selectedPrase: string;
  readonly selectedIndex: number;
  readonly menu: string[];

  constructor(
    previousState: NotEmpty,
    selectedPrase: string,
    selectedIndex: number,
    menu: string[]
  ) {
    super(
      previousState.composingBuffer,
      previousState.cursorIndex,
      previousState.tooltip
    );
    this.previousState = previousState;
    this.selectedPrase = selectedPrase;
    this.selectedIndex = selectedIndex;
    this.menu = menu;
  }
}

export enum ChineseNumberStyle {
  lowercase,
  uppercase,
  suzhou,
}

export class ChineseNumber implements InputState {
  readonly number: string;
  readonly style: ChineseNumberStyle;

  constructor(number: string, style: ChineseNumberStyle) {
    this.number = number;
    this.style = style;
  }

  get composingBuffer(): string {
    switch (this.style) {
      case ChineseNumberStyle.lowercase:
        return "[中文數字] " + this.number;
      case ChineseNumberStyle.uppercase:
        return "[大寫數字] " + this.number;
      case ChineseNumberStyle.suzhou:
        return "[蘇州碼] " + this.number;
      default:
        break;
    }

    return "";
  }
}

export class SelectingDateMacro implements InputState {
  static macros: string[] = [
    "MACRO@DATE_TODAY_SHORT",
    "MACRO@DATE_TODAY_MEDIUM",
    "MACRO@DATE_TODAY_MEDIUM_ROC",
    "MACRO@DATE_TODAY_MEDIUM_CHINESE",
    "MACRO@DATE_TODAY_MEDIUM_JAPANESE",
    "MACRO@THIS_YEAR_PLAIN",
    "MACRO@THIS_YEAR_PLAIN_WITH_ERA",
    "MACRO@THIS_YEAR_ROC",
    "MACRO@THIS_YEAR_JAPANESE",
    "MACRO@DATE_TODAY_WEEKDAY_SHORT",
    "MACRO@DATE_TODAY_WEEKDAY",
    "MACRO@DATE_TODAY2_WEEKDAY",
    "MACRO@DATE_TODAY_WEEKDAY_JAPANESE",
    "MACRO@TIME_NOW_SHORT",
    "MACRO@TIME_NOW_MEDIUM",
    "MACRO@THIS_YEAR_GANZHI",
    "MACRO@THIS_YEAR_CHINESE_ZODIAC",
  ];

  readonly menu: string[] = [];
  constructor(converter: (input: string) => string) {
    for (let macro of SelectingDateMacro.macros) {
      this.menu.push(converter(macro));
    }
  }
}

export class Feature {
  readonly name: string;
  readonly nextState: () => InputState;

  constructor(name: string, nextState: () => InputState) {
    this.name = name;
    this.nextState = nextState;
  }

  toString(): string {
    return this.name;
  }
}

export class SelectingFeature implements InputState {
  readonly features: Feature[] = [
    new Feature("日期與時間", () => new SelectingDateMacro(this.converter)),
    new Feature(
      "中文數字",
      () => new ChineseNumber("", ChineseNumberStyle.lowercase)
    ),
    new Feature(
      "大寫數字",
      () => new ChineseNumber("", ChineseNumberStyle.uppercase)
    ),
    new Feature(
      "蘇州碼",
      () => new ChineseNumber("", ChineseNumberStyle.suzhou)
    ),
  ];

  converter: (input: string) => string;
  constructor(converter: (input: string) => string) {
    this.converter = converter;
  }
}
