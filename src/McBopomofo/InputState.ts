/**
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
/* istanbul ignore next */
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
/* istanbul ignore next */
export class EmptyIgnoringPrevious implements InputState {
  toString(): string {
    return "EmptyIgnoringPrevious";
  }
}

/**  The state for committing text into the desired application. */
/* istanbul ignore next */
export class Committing implements InputState {
  /** The text to commit. */
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
/* istanbul ignore next */
export class NotEmpty implements InputState {
  /**
   * A string buffer that stores the current composing text. This represents the
   * text that is currently being typed but not yet committed.
   */
  readonly composingBuffer: string;
  /**
   * The current cursor position in the composition buffer. Represents the index
   * where new input will be inserted.
   */
  readonly cursorIndex: number;
  /** The tooltip to display for this input state */
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
/* istanbul ignore next */
export class Inputting extends NotEmpty {
  constructor(buf: string, index: number, tooltipText: string = "") {
    super(buf, index, tooltipText);
  }

  toString(): string {
    return "Inputting " + this.composingBuffer + " tooltip:" + this.tooltip;
  }
}

/** Candidate selecting state with a non-empty composing buffer. */
/* istanbul ignore next */
export class ChoosingCandidate extends NotEmpty {
  /** The candidates to choose from. */
  readonly candidates: Candidate[];
  /** The index of the cursor when the user starts to choose for candidates. */
  readonly originalCursorIndex: number;

  constructor(
    buf: string,
    index: number,
    cs: Candidate[],
    originalCursorIndex: number
  ) {
    super(buf, index);
    this.candidates = cs;
    this.originalCursorIndex = originalCursorIndex;
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
/* istanbul ignore next */
export class Marking extends NotEmpty {
  /** The index of the cursor that the user starts to make a marked range. It
   * helps to restore the position of the cursor. */
  readonly markStartGridCursorIndex: number;
  /** THe text before the marked text. */
  readonly head: string;
  /** The marked text. */
  readonly markedText: string;
  /** The text after the marked text. */
  readonly tail: string;
  /** The Bopomofo reading of the marked text. */
  readonly reading: string;
  /** Whether the marked text could be saved to the user phrases. */
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

/** Represents that the user is selecting a dictionary service. */
/* istanbul ignore next */
export class SelectingDictionary extends NotEmpty {
  /** The previous input state. */
  readonly previousState: NotEmpty;
  /** The selected phrase. */
  readonly selectedPrase: string;
  /** The index of the selected phrase. */
  readonly selectedIndex: number;
  /** The menu of dictionary services. */
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

export class ShowingCharInfo extends NotEmpty {
  readonly previousState: SelectingDictionary;
  readonly selectedPhrase: string = "";
  readonly menu: string[] = [];

  constructor(previousState: SelectingDictionary, selectedString: string) {
    super(
      previousState.composingBuffer,
      previousState.cursorIndex,
      previousState.tooltip
    );
    this.previousState = previousState;
    this.selectedPhrase = selectedString;
    this.buildMenu();
  }

  private buildMenu() {
    this.menu.push(
      "JavaScript String length: " + this.selectedPhrase.replace.length
    );

    try {
      const encoder = new TextEncoder();
      const utf8Bytes = encoder.encode(this.selectedPhrase);
      const utf8Hex = Array.from(utf8Bytes)
        .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
        .join("");
      this.menu.push("UTF-8 HEX: " + utf8Hex);
    } catch (e) {}
    try {
      const charInfo = Array.from(this.selectedPhrase)
        .map((char) => {
          const codePoint = char.codePointAt(0);
          return `U+${codePoint?.toString(16).toUpperCase().padStart(4, "0")}`;
        })
        .join("");
      this.menu.push("UTF-16 HEX:" + charInfo);
    } catch (e) {}
    try {
      const urlEncoded = encodeURIComponent(this.selectedPhrase);
      this.menu.push("URL Encoded: " + urlEncoded);
    } catch (e) {}
  }
}

/**
 * Enumeration representing different styles for Chinese numbers.
 * @enum {number}
 * @property {number} Lowercase - Chinese numbers in lowercase format (e.g., 一二三)
 * @property {number} Uppercase - Chinese numbers in uppercase format (e.g., 壹贰叁)
 * @property {number} Suzhou - Chinese numbers in Suzhou format (e.g., 〡〢〣)
 */
/* istanbul ignore next */
export enum ChineseNumbersStateStyle {
  Lowercase,
  Uppercase,
  Suzhou,
}

/** Represents that the user is inputting a Chinese number. */
/* istanbul ignore next */
export class ChineseNumber implements InputState {
  /** The user inputted number. */
  readonly number: string;
  /** The style of the Chinese number. */
  readonly style: ChineseNumbersStateStyle;

  constructor(number: string, style: ChineseNumbersStateStyle) {
    this.number = number;
    this.style = style;
  }

  get composingBuffer(): string {
    switch (this.style) {
      case ChineseNumbersStateStyle.Lowercase:
        return "[中文數字] " + this.number;
      case ChineseNumbersStateStyle.Uppercase:
        return "[大寫數字] " + this.number;
      case ChineseNumbersStateStyle.Suzhou:
        return "[蘇州碼] " + this.number;
      default:
        break;
    }

    return "";
  }
}

export enum RomanNumberStateStyle {
  Alphabets,
  FullWidthUpper,
  FullWidthLower,
}

export class RomanNumber implements InputState {
  /** The user inputted number. */
  readonly number: string;
  /** The style of the Roman number. */
  readonly style: RomanNumberStateStyle;

  constructor(number: string, style: RomanNumberStateStyle) {
    this.number = number;
    this.style = style;
  }

  get composingBuffer(): string {
    switch (this.style) {
      case RomanNumberStateStyle.Alphabets:
        return "[羅馬數字 (字母)] " + this.number;
      case RomanNumberStateStyle.FullWidthUpper:
        return "[羅馬數字 (全形大寫)] " + this.number;
      case RomanNumberStateStyle.FullWidthLower:
        return "[羅馬數字 (全形小寫)] " + this.number;
      default:
        break;
    }

    return "";
  }
}

/** Represents that the user is inputting a Big5 code. */
/* istanbul ignore next */
export class Big5 implements InputState {
  /** The user inputted code. */
  readonly code: string;

  constructor(code: string = "") {
    this.code = code;
  }

  /**
   * Gets the composition buffer string with "[內碼]" prefix and the current
   * input code.
   * @returns A string that combines "[內碼]" and the current input code.
   */
  get composingBuffer(): string {
    return "[內碼] " + this.code;
  }
}

/** Represents that the user is inputting a enclosed number. */
/* istanbul ignore next */
export class EnclosingNumber implements InputState {
  /** The user inputted number. */
  readonly number: string;

  constructor(number: string = "") {
    this.number = number;
  }

  get composingBuffer(): string {
    return "[標題數字] " + this.number;
  }
}

/**
 * Represents a state for selecting date-related macros in the input system.
 * This class implements the InputState interface and manages a collection of
 * date/time macro strings that can be converted to actual values.
 */
/* istanbul ignore next */
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
      let value = converter(macro);
      if (value) {
        this.menu.push(value);
      }
    }
  }
}

/**
 * Represents a feature with a name and a function to determine the next input
 * state.
 */
export class Feature {
  /** The name of the feature. */
  readonly name: string;
  /** A function that returns the next input state.  */
  readonly nextState: () => InputState;

  constructor(name: string, nextState: () => InputState) {
    this.name = name;
    this.nextState = nextState;
  }

  toString(): string {
    return this.name;
  }
}

/**
 * Represents a state for selecting special input features in McBopomofo. This
 * class manages various input features including Big5 encoding, date/time
 * macros, enclosing numbers, and different styles of Chinese numerals.
 */
/* istanbul ignore next */
export class SelectingFeature implements InputState {
  readonly features: Feature[] = (() => {
    var features: Feature[] = [];

    try {
      // Note: old JS engines may not support big5 encoding.
      let _ = new TextDecoder("big5-hkscs");
      features.push(new Feature("Big5 內碼輸入", () => new Big5()));
    } catch (e) {
      // bypass
    }

    features.push(
      new Feature("日期與時間", () => new SelectingDateMacro(this.converter))
    );
    features.push(new Feature("標題數字", () => new EnclosingNumber()));
    features.push(
      new Feature(
        "中文數字",
        () => new ChineseNumber("", ChineseNumbersStateStyle.Lowercase)
      )
    );
    features.push(
      new Feature(
        "大寫數字",
        () => new ChineseNumber("", ChineseNumbersStateStyle.Uppercase)
      )
    );
    features.push(
      new Feature(
        "蘇州碼",
        () => new ChineseNumber("", ChineseNumbersStateStyle.Suzhou)
      )
    );
    features.push(
      new Feature(
        "羅馬數字 (字母)",
        () => new RomanNumber("", RomanNumberStateStyle.Alphabets)
      )
    );
    features.push(
      new Feature(
        "羅馬數字 (全形大寫)",
        () => new RomanNumber("", RomanNumberStateStyle.FullWidthUpper)
      )
    );
    features.push(
      new Feature(
        "羅馬數字 (全形小寫)",
        () => new RomanNumber("", RomanNumberStateStyle.FullWidthLower)
      )
    );

    return features;
  })();

  converter: (input: string) => string;
  constructor(converter: (input: string) => string) {
    this.converter = converter;
  }
}

/**
 * Represents an entry in a custom menu.
 *
 * This class encapsulates a menu item with a title and a callback function that
 * gets executed when the menu item is selected.
 */
export class CustomMenuEntry {
  readonly title: string;
  readonly callback: () => void;

  constructor(title: string, callback: () => void) {
    this.title = title;
    this.callback = callback;
  }
}

/**
 * Represents a custom menu in the input system.
 *
 * This class extends the NotEmpty state and provides functionality for
 * a menu interface where the user can select an option from a list.
 *
 * @extends NotEmpty
 */
export class CustomMenu extends NotEmpty {
  readonly entries: CustomMenuEntry[];

  constructor(
    composingBuffer: string,
    cursorIndex: number,
    title: string,
    entries: CustomMenuEntry[]
  ) {
    super(composingBuffer, cursorIndex, title);
    this.entries = entries;
  }

  toString(): string {
    return "CustomMenuEntry " + this.tooltip;
  }
}
