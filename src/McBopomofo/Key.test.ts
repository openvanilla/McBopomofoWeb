import { Key, KeyName, KeyFromKeyboardEvent } from "./Key";

describe("Key", () => {
  describe("construction", () => {
    it("should create with default values", () => {
      const key = new Key();
      expect(key.ascii).toBe("");
      expect(key.name).toBe(KeyName.UNKNOWN);
      expect(key.shiftPressed).toBe(false);
      expect(key.ctrlPressed).toBe(false);
      expect(key.isNumpadKey).toBe(false);
    });

    it("should create ASCII key with factory method", () => {
      const key = Key.asciiKey("a", true, true);
      expect(key.ascii).toBe("a");
      expect(key.name).toBe(KeyName.ASCII);
      expect(key.shiftPressed).toBe(true);
      expect(key.ctrlPressed).toBe(true);
    });

    it("should create named key with factory method", () => {
      const key = Key.namedKey(KeyName.RETURN, true, false);
      expect(key.ascii).toBe("");
      expect(key.name).toBe(KeyName.RETURN);
      expect(key.shiftPressed).toBe(true);
      expect(key.ctrlPressed).toBe(false);
    });
  });

  describe("cursor keys", () => {
    it("should detect regular cursor keys", () => {
      expect(Key.namedKey(KeyName.LEFT).isCursorKey).toBe(true);
      expect(Key.namedKey(KeyName.RIGHT).isCursorKey).toBe(true);
      expect(Key.namedKey(KeyName.HOME).isCursorKey).toBe(true);
      expect(Key.namedKey(KeyName.END).isCursorKey).toBe(true);
    });

    it("should detect Emacs-style cursor keys", () => {
      expect(Key.asciiKey("a", false, true).isCursorKey).toBe(true);
      expect(Key.asciiKey("e", false, true).isCursorKey).toBe(true);
      expect(Key.asciiKey("f", false, true).isCursorKey).toBe(true);
      expect(Key.asciiKey("b", false, true).isCursorKey).toBe(true);
    });
  });

  describe("delete keys", () => {
    it("should detect regular delete keys", () => {
      expect(Key.namedKey(KeyName.BACKSPACE).isDeleteKey).toBe(true);
      expect(Key.namedKey(KeyName.DELETE).isDeleteKey).toBe(true);
    });

    it("should detect Emacs-style delete keys", () => {
      expect(Key.asciiKey("h", false, true).isDeleteKey).toBe(true);
      expect(Key.asciiKey("d", false, true).isDeleteKey).toBe(true);
    });
  });

  describe("KeyFromKeyboardEvent", () => {
    it("should handle arrow keys", () => {
      const event = {
        code: "ArrowLeft",
        key: "ArrowLeft",
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const key = KeyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.LEFT);
    });

    it("should handle numpad keys", () => {
      const event = {
        code: "Numpad1",
        key: "1",
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const key = KeyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.ASCII);
      expect(key.isNumpadKey).toBe(true);
    });

    it("should handle special keys", () => {
      const event = {
        code: "Enter",
        key: "Enter",
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const key = KeyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.RETURN);
    });
  });
});

describe("numpad keys", () => {
  it("should handle numpad operators", () => {
    const cases = [
      { code: "NumpadAdd", key: "+" },
      { code: "NumpadSubtract", key: "-" },
      { code: "NumpadMultiply", key: "*" },
      { code: "NumpadDivide", key: "/" },
      { code: "NumpadDecimal", key: "." },
    ];

    cases.forEach(({ code, key }) => {
      const event = {
        code,
        key,
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const keyObj = KeyFromKeyboardEvent(event);
      expect(keyObj.name).toBe(KeyName.ASCII);
      expect(keyObj.isNumpadKey).toBe(true);
      expect(keyObj.ascii).toBe(key);
    });
  });

  it("should handle numpad navigation keys", () => {
    const cases = [
      { code: "Numpad4", key: "ArrowLeft", expected: KeyName.LEFT },
      { code: "Numpad6", key: "ArrowRight", expected: KeyName.RIGHT },
      { code: "Numpad8", key: "ArrowUp", expected: KeyName.UP },
      { code: "Numpad2", key: "ArrowDown", expected: KeyName.DOWN },
      { code: "Numpad7", key: "Home", expected: KeyName.HOME },
      { code: "Numpad1", key: "End", expected: KeyName.END },
      { code: "Numpad9", key: "PageUp", expected: KeyName.PAGE_UP },
      { code: "Numpad3", key: "PageDown", expected: KeyName.PAGE_DOWN },
    ];

    cases.forEach(({ code, key, expected }) => {
      const event = {
        code,
        key,
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const keyObj = KeyFromKeyboardEvent(event);
      expect(keyObj.name).toBe(expected);
    });
  });

  it("should handle numpad enter", () => {
    const event = {
      code: "NumpadEnter",
      key: "Enter",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.RETURN);
  });
});
