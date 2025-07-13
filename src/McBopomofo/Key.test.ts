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

describe("toString method", () => {
  it("should return formatted string representation", () => {
    const key1 = Key.asciiKey("a", true, false);
    expect(key1.toString()).toBe(
      "Key{ascii: a, name: ASCII, shift: true, ctrl: false}"
    );

    const key2 = Key.namedKey(KeyName.RETURN, false, true);
    expect(key2.toString()).toBe(
      "Key{ascii: , name: RETURN, shift: false, ctrl: true}"
    );

    const key3 = new Key("x", KeyName.ASCII, true, true, true);
    expect(key3.toString()).toBe(
      "Key{ascii: x, name: ASCII, shift: true, ctrl: true}"
    );
  });
});

describe("constructor with all parameters", () => {
  it("should create key with all parameters", () => {
    const key = new Key("z", KeyName.ASCII, true, true, true);
    expect(key.ascii).toBe("z");
    expect(key.name).toBe(KeyName.ASCII);
    expect(key.shiftPressed).toBe(true);
    expect(key.ctrlPressed).toBe(true);
    expect(key.isNumpadKey).toBe(true);
  });
});

describe("edge cases for cursor keys", () => {
  it("should not detect non-cursor keys as cursor keys", () => {
    expect(Key.namedKey(KeyName.SPACE).isCursorKey).toBe(false);
    expect(Key.namedKey(KeyName.RETURN).isCursorKey).toBe(false);
    expect(Key.asciiKey("x", false, true).isCursorKey).toBe(false);
    expect(Key.asciiKey("a", true, false).isCursorKey).toBe(false); // shift+a, no ctrl
  });

  it("should handle uppercase Emacs cursor keys with ctrl", () => {
    expect(Key.asciiKey("A", false, true).isCursorKey).toBe(false); // uppercase A
    expect(Key.asciiKey("E", false, true).isCursorKey).toBe(false); // uppercase E
  });
});

describe("edge cases for delete keys", () => {
  it("should not detect non-delete keys as delete keys", () => {
    expect(Key.namedKey(KeyName.SPACE).isDeleteKey).toBe(false);
    expect(Key.namedKey(KeyName.RETURN).isDeleteKey).toBe(false);
    expect(Key.asciiKey("x", false, true).isDeleteKey).toBe(false);
    expect(Key.asciiKey("h", true, false).isDeleteKey).toBe(false); // shift+h, no ctrl
  });

  it("should handle uppercase Emacs delete keys with ctrl", () => {
    expect(Key.asciiKey("H", false, true).isDeleteKey).toBe(false); // uppercase H
    expect(Key.asciiKey("D", false, true).isDeleteKey).toBe(false); // uppercase D
  });
});

describe("KeyFromKeyboardEvent edge cases", () => {
  it("should handle unknown key codes", () => {
    const event = {
      code: "UnknownKey",
      key: "unknown",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.UNKNOWN);
    expect(key.ascii).toBe("unknown");
    expect(key.isNumpadKey).toBe(false);
  });

  it("should handle modifier keys correctly", () => {
    const event = {
      code: "KeyA",
      key: "a",
      shiftKey: true,
      ctrlKey: true,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.shiftPressed).toBe(true);
    expect(key.ctrlPressed).toBe(true);
  });

  it("should handle regular ASCII keys", () => {
    const event = {
      code: "KeyA",
      key: "a",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.UNKNOWN); // Because it's not in the switch case
    expect(key.ascii).toBe("a");
    expect(key.isNumpadKey).toBe(false);
  });

  it("should handle ESC, SPACE, and TAB keys", () => {
    const cases = [
      { code: "Escape", key: "Escape", expected: KeyName.ESC },
      { code: "Space", key: " ", expected: KeyName.SPACE },
      { code: "Tab", key: "Tab", expected: KeyName.TAB },
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

  it("should handle numpad keys with single character", () => {
    const event = {
      code: "Numpad5",
      key: "5",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.ASCII);
    expect(key.ascii).toBe("5");
    expect(key.isNumpadKey).toBe(true);
  });

  it("should handle numpad 0 and numpad 5 with navigation functions", () => {
    // Test numpad keys that can have navigation functions when Num Lock is off
    const cases = [
      { code: "Numpad0", key: "Insert", expected: KeyName.UNKNOWN },
      { code: "Numpad5", key: "Clear", expected: KeyName.UNKNOWN },
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

  it("should preserve original key value in ascii property", () => {
    const event = {
      code: "NumpadAdd",
      key: "+",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.ascii).toBe("+");
    expect(key.name).toBe(KeyName.ASCII);
    expect(key.isNumpadKey).toBe(true);
  });
});

describe("KeyName enum coverage", () => {
  it("should handle all KeyName enum values", () => {
    const allKeyNames = [
      KeyName.ASCII,
      KeyName.LEFT,
      KeyName.RIGHT,
      KeyName.HOME,
      KeyName.END,
      KeyName.BACKSPACE,
      KeyName.RETURN,
      KeyName.UP,
      KeyName.DOWN,
      KeyName.ESC,
      KeyName.SPACE,
      KeyName.DELETE,
      KeyName.TAB,
      KeyName.PAGE_UP,
      KeyName.PAGE_DOWN,
      KeyName.UNKNOWN,
    ];

    allKeyNames.forEach((keyName) => {
      const key = Key.namedKey(keyName);
      expect(key.name).toBe(keyName);
      expect(key.ascii).toBe("");
      expect(key.shiftPressed).toBe(false);
      expect(key.ctrlPressed).toBe(false);
      expect(key.isNumpadKey).toBe(false);
    });
  });
});

describe("factory method edge cases", () => {
  it("should handle asciiKey with empty string", () => {
    const key = Key.asciiKey("");
    expect(key.ascii).toBe("");
    expect(key.name).toBe(KeyName.ASCII);
  });

  it("should handle asciiKey with special characters", () => {
    const specialChars = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "+",
      "=",
    ];
    specialChars.forEach((char) => {
      const key = Key.asciiKey(char);
      expect(key.ascii).toBe(char);
      expect(key.name).toBe(KeyName.ASCII);
    });
  });

  it("should handle Unicode characters", () => {
    const unicodeChars = ["ñ", "é", "中", "🎉"];
    unicodeChars.forEach((char) => {
      const key = Key.asciiKey(char);
      expect(key.ascii).toBe(char);
      expect(key.name).toBe(KeyName.ASCII);
    });
  });
});

describe("numpad key combinations", () => {
  it("should handle numpad keys with modifiers", () => {
    const event = {
      code: "Numpad1",
      key: "1",
      shiftKey: true,
      ctrlKey: true,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.ASCII);
    expect(key.ascii).toBe("1");
    expect(key.isNumpadKey).toBe(true);
    expect(key.shiftPressed).toBe(true);
    expect(key.ctrlPressed).toBe(true);
  });

  it("should handle all numpad digit keys", () => {
    for (let i = 0; i <= 9; i++) {
      const event = {
        code: `Numpad${i}`,
        key: i.toString(),
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const key = KeyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.ASCII);
      expect(key.ascii).toBe(i.toString());
      expect(key.isNumpadKey).toBe(true);
    }
  });
});
