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
  constructor(
    /** The text to commit. */
    readonly text: string
  ) {}

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
  constructor(
    /**
     * A string buffer that stores the current composing text. This represents the
     * text that is currently being typed but not yet committed.
     */
    readonly composingBuffer: string,
    /**
     * The current cursor position in the composition buffer. Represents the index
     * where new input will be inserted.
     */
    readonly cursorIndex: number,
    /** The tooltip to display for this input state */
    readonly tooltip: string = ""
  ) {}

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
  constructor(
    buf: string,
    index: number,
    /** The candidates to choose from. */
    readonly candidates: Candidate[],
    /** The index of the cursor when the user starts to choose for candidates. */
    readonly originalCursorIndex: number
  ) {
    super(buf, index);
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
  constructor(
    buf: string,
    index: number,
    tooltipText: string,
    /** The index of the cursor that the user starts to make a marked range. It
     * helps to restore the position of the cursor. */
    readonly markStartGridCursorIndex: number,
    /** THe text before the marked text. */
    readonly head: string,
    /** The marked text. */
    readonly markedText: string,
    /** The text after the marked text. */
    readonly tail: string,
    /** The Bopomofo reading of the marked text. */
    readonly reading: string,
    /** Whether the marked text could be saved to the user phrases. */
    readonly acceptable: boolean
  ) {
    super(buf, index, tooltipText);
  }

  toString(): string {
    return "Marking " + this.markStartGridCursorIndex + "" + this.cursorIndex;
  }
}

/** Represents that the user is selecting a dictionary service. */
/* istanbul ignore next */
export class SelectingDictionary extends NotEmpty {
  constructor(
    /** The previous input state. */
    readonly previousState: NotEmpty,
    /** The selected phrase. */
    readonly selectedPrase: string,
    /** The index of the selected phrase. */
    readonly selectedIndex: number,
    /** The menu of dictionary services. */
    readonly menu: string[]
  ) {
    super(
      previousState.composingBuffer,
      previousState.cursorIndex,
      previousState.tooltip
    );
  }
}

/**
 * Represents the state where the user is viewing detailed character information
 * for a selected phrase, such as string length, UTF-8 hex, UTF-16 hex, and
 * URL-encoded forms.
 */
export class ShowingCharInfo extends NotEmpty {
  /** The menu of character information. */
  readonly menu: string[] = [];

  /**
   * Creates an instance of ShowingCharInfo.
   * @param previousState The previous input state, which was a dictionary
   * selection.
   * @param selectedPhrase The phrase for which character information is being
   * shown.
   */
  constructor(
    readonly previousState: SelectingDictionary,
    readonly selectedPhrase: string
  ) {
    super(
      previousState.composingBuffer,
      previousState.cursorIndex,
      previousState.tooltip
    );
    this.buildMenu();
  }

  private buildMenu() {
    this.menu.push("JavaScript String length: " + this.selectedPhrase.length);

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

/** Represents that the user is inputting a number. */
export class NumberInput implements InputState {
  /**
   * Creates an instance of NumberInput.
   * @param number The number string entered by the user.
   * @param candidates The list of candidate characters or phrases corresponding
   * to the number.
   */
  constructor(readonly number: string, readonly candidates: Candidate[]) {}

  /**
   * Gets the composition buffer string with "[數字]" prefix and the current
   * input number.
   * @returns A string that combines "[數字]" and the current input number.
   */
  get composingBuffer(): string {
    return "[數字] " + this.number;
  }
}

/** Represents that the user is inputting a Big5 code. */
export class Big5 implements InputState {
  /**
   * Creates an instance of Big5.
   * @param code The user inputted code.
   */
  constructor(readonly code: string = "") {}

  /**
   * Gets the composition buffer string with "[內碼]" prefix and the current
   * input code.
   * @returns A string that combines "[內碼]" and the current input code.
   */
  get composingBuffer(): string {
    return "[內碼] " + this.code;
  }
}

/**
 * Represents a state for selecting date-related macros in the input system.
 * This class implements the InputState interface and manages a collection of
 * date/time macro strings that can be converted to actual values.
 */
export class SelectingDateMacro implements InputState {
  /**
   * Defines a list of macro strings representing various date and time formats.
   * These macros are used to generate corresponding date/time values.
   */
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
    for (const macro of SelectingDateMacro.macros) {
      const value = converter(macro);
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
  /**
   * Creates an instance of Feature.
   * @param name The name of the feature.
   * @param nextState A function that returns the next input state.
   */
  constructor(
    /** The name of the feature. */
    readonly name: string,
    /** A function that returns the next input state.  */
    readonly nextState: () => InputState
  ) {}

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
  /**
   * The list of available features.
   */
  readonly features: Feature[] = (() => {
    var features: Feature[] = [];

    try {
      // Note: old JS engines may not support big5 encoding.
      const _ = new TextDecoder("big5-hkscs");
      features.push(new Feature("Big5 內碼輸入", () => new Big5()));
    } catch (e) {
      // bypass
    }
    features.push(
      new Feature("日期與時間", () => new SelectingDateMacro(this.converter))
    );
    features.push(new Feature("數字輸入", () => new NumberInput("", [])));
    return features;
  })();

  /**
   * A function to convert macro strings (e.g., date/time macros) to their
   * actual string values.
   */
  converter: (input: string) => string;

  /**
   * Constructs a new SelectingFeature instance.
   * @param converter A function to convert macro strings (e.g., date/time
   * macros) to their actual string values.
   */
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
  constructor(readonly title: string, readonly callback: () => void) {}
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
  constructor(
    composingBuffer: string,
    cursorIndex: number,
    title: string,
    readonly entries: CustomMenuEntry[]
  ) {
    super(composingBuffer, cursorIndex, title);
  }

  toString(): string {
    return "CustomMenuEntry " + this.tooltip;
  }
}
