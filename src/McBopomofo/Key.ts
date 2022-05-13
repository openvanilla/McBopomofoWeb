export enum KeyName {
  ASCII,
  LEFT,
  RIGHT,
  HOME,
  END,
  UNKNOWN,
}

// Encapsulates the keys accepted by KeyHandler. This class never attempts to
// represent all key states that a generic input method framework desires to
// handle. Instead, this class only reflects the keys KeyHandler will handle.
//
// This is not always a perfect representation (for example, shift muddles the
// picture), but is sufficient for KeyHandler's needs.
export class Key {
  static BACKSPACE: string = "Backspace";
  static RETURN: string = "Enter";
  static UP: string = "ArrowUp";
  static DOWN: string = "ArrowDown";

  static ESC: string = "Escape";
  static SPACE: string = " ";
  static DELETE: string = "Delete";

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
    return this.ascii_ === Key.BACKSPACE || this.ascii_ === Key.DELETE;
  }
}
