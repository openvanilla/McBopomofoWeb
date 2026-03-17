import { Key, KeyName } from "./Key";

/**
 * Utility class for mapping keyboard events to internal `Key` representations.
 */
export class KeyMapping {
  static keyFromSimpleKeyboardEvent(
    button: string,
    isShift: boolean,
    isCtrl: boolean,
  ) {
    let keyName = KeyName.UNKNOWN;
    let ascii = "";

    if (button.length === 1) {
      keyName = KeyName.ASCII;
      ascii = button;
    } else {
      switch (button) {
        case "{bksp}":
          keyName = KeyName.BACKSPACE;
          break;
        case "{enter}":
          keyName = KeyName.RETURN;
          break;
        case "{space}":
          keyName = KeyName.SPACE;
          ascii = " ";
          break;
        case "{tab}":
          keyName = KeyName.TAB;
          break;
        default:
          break;
      }
    }

    return new Key(ascii, keyName, isShift, isCtrl);
  }

  /**
   * Converts a browser `KeyboardEvent` into a `Key` object used by the input controller.
   * @param event The keyboard event to convert.
   * @returns The corresponding `Key` object.
   */
  static keyFromKeyboardEvent(event: KeyboardEvent): Key {
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
        break;
    }
    const key = new Key(
      event.key,
      keyName,
      event.shiftKey,
      event.ctrlKey,
      isNumpadKey,
    );
    return key;
  }
}
