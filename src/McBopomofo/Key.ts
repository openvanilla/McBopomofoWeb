/**
 * @license
 * Copyright (c) 2025 and onwards The McTabIM Authors.
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
  constructor(
    public readonly ascii: string = "",
    public readonly name: KeyName = KeyName.UNKNOWN,
    /** If the Shift modifier is pressed. */
    public readonly shiftPressed: boolean = false,
    /** If the Control modifier is pressed. */
    public readonly ctrlPressed: boolean = false,
    /** If the key is on the Numpad. */
    public readonly isNumpadKey: boolean = false
  ) {}

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

  /** If the key is for moving the input cursor. */
  get isCursorKey(): boolean {
    if (this.ctrlPressed) {
      return (
        this.ascii === "a" ||
        this.ascii === "e" ||
        this.ascii === "f" ||
        this.ascii === "b"
      );
    }

    return (
      this.name === KeyName.LEFT ||
      this.name === KeyName.RIGHT ||
      this.name === KeyName.HOME ||
      this.name === KeyName.END
    );
  }

  /** If the key is for deleting the previous character. */
  get isDeleteKey(): boolean {
    if (this.ctrlPressed) {
      return this.ascii === "h" || this.ascii === "d";
    }
    return this.name === KeyName.BACKSPACE || this.name === KeyName.DELETE;
  }

  toString(): string {
    return `Key{ascii: ${this.ascii}, name: ${this.name}, shift: ${this.shiftPressed}, ctrl: ${this.ctrlPressed}}`;
  }
}

/** Converts a keyboard event in the web browser to a key defined by McTabim. */
export function KeyFromKeyboardEvent(event: KeyboardEvent) {
  let isNumpadKey = false;
  let keyName = KeyName.UNKNOWN;
  switch (event.code) {
    case "ArrowLeft":
      keyName = KeyName.LEFT;
      break;
    case "ArrowRight":
      keyName = KeyName.RIGHT;
      break;
    case "ArrowUp":
      keyName = KeyName.UP;
      break;
    case "ArrowDown":
      keyName = KeyName.DOWN;
      break;
    case "Home":
      keyName = KeyName.HOME;
      break;
    case "End":
      keyName = KeyName.END;
      break;
    case "Backspace":
      keyName = KeyName.BACKSPACE;
      break;
    case "Delete":
      keyName = KeyName.DELETE;
      break;
    case "NumpadEnter":
    case "Enter":
      keyName = KeyName.RETURN;
      break;
    case "Escape":
      keyName = KeyName.ESC;
      break;
    case "Space":
      keyName = KeyName.SPACE;
      break;
    case "Tab":
      keyName = KeyName.TAB;
      break;
    case "PageUp":
      keyName = KeyName.PAGE_UP;
      break;
    case "PageDown":
      keyName = KeyName.PAGE_DOWN;
      break;
    case "NumpadAdd":
    case "NumpadSubtract":
    case "NumpadMultiply":
    case "NumpadDivide":
    case "NumpadDecimal":
      keyName = KeyName.ASCII;
      isNumpadKey = true;
      break;
    case "Numpad0":
    case "Numpad1":
    case "Numpad2":
    case "Numpad3":
    case "Numpad4":
    case "Numpad5":
    case "Numpad6":
    case "Numpad7":
    case "Numpad8":
    case "Numpad9":
      if (event.key.length === 1) {
        keyName = KeyName.ASCII;
        isNumpadKey = true;
      } else {
        switch (event.key) {
          case "ArrowLeft":
            keyName = KeyName.LEFT;
            break;
          case "ArrowRight":
            keyName = KeyName.RIGHT;
            break;
          case "ArrowUp":
            keyName = KeyName.UP;
            break;
          case "ArrowDown":
            keyName = KeyName.DOWN;
            break;
          case "Home":
            keyName = KeyName.HOME;
            break;
          case "End":
            keyName = KeyName.END;
            break;
          case "PageUp":
            keyName = KeyName.PAGE_UP;
            break;
          case "PageDown":
            keyName = KeyName.PAGE_DOWN;
            break;
          default:
            break;
        }
      }
    default:
      keyName = keyName;
      break;
  }
  const key = new Key(
    event.key,
    keyName,
    event.shiftKey,
    event.ctrlKey,
    isNumpadKey
  );
  return key;
}
