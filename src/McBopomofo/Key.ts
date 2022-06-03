/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

export enum KeyName {
  ASCII = "ASCII",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  HOME = "HOME",
  END = "END",
  BACKSPACE = "BACKSPACE",
  RETURN = "RETURN",
  UP = "UP",
  DOWN = "DOWN",
  ESC = "ESC",
  SPACE = "SPACE",
  DELETE = "DELETE",
  TAB = "TAB",
  PAGE_UP = "PAGE_UP",
  PAGE_DOWN = "PAGE_DOWN",
  UNKNOWN = "UNKNOWN",
}

/**
 * Encapsulates the keys accepted by KeyHandler. This class never attempts to
 * represent all key states that a generic input method framework desires to
 * handle. Instead, this class only reflects the keys KeyHandler will handle.
 *
 * This is not always a perfect representation (for example, shift muddles the
 * picture), but is sufficient for KeyHandler's needs.
 */
export class Key {
  private ascii_: string = "";
  get ascii(): string {
    return this.ascii_;
  }

  private name_: KeyName = KeyName.UNKNOWN;
  get name(): KeyName {
    return this.name_;
  }

  private shiftPressed_: boolean = false;
  get shiftPressed(): boolean {
    return this.shiftPressed_;
  }

  private ctrlPressed_: boolean = false;
  get ctrlPressed(): boolean {
    return this.ctrlPressed_;
  }

  constructor(
    c: string = "",
    n: KeyName = KeyName.UNKNOWN,
    isShift: boolean = false,
    isCtrl: boolean = false
  ) {
    this.ascii_ = c;
    this.name_ = n;
    this.shiftPressed_ = isShift;
    this.ctrlPressed_ = isCtrl;
  }

  static asciiKey(
    c: string,
    shiftPressed: boolean = false,
    ctrlPressed: boolean = false
  ): Key {
    return new Key(c, KeyName.ASCII, shiftPressed, ctrlPressed);
  }

  static namedKey(
    name: KeyName,
    shiftPressed: boolean = false,
    ctrlPressed: boolean = false
  ): Key {
    return new Key("", name, shiftPressed, ctrlPressed);
  }

  get isCursorKeys(): boolean {
    return (
      this.name_ === KeyName.LEFT ||
      this.name_ === KeyName.RIGHT ||
      this.name_ === KeyName.HOME ||
      this.name_ === KeyName.END
    );
  }

  get isDeleteKeys(): boolean {
    return this.name === KeyName.BACKSPACE || this.name === KeyName.DELETE;
  }
}
