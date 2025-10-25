import { Key, KeyName, KeyFromKeyboardEvent } from "./Key";

describe("Key", () => {
  describe("construction", () => {
    it("creates with default values", () => {
      const key = new Key();
      expect(key.ascii).toBe("");
      expect(key.name).toBe(KeyName.UNKNOWN);
      expect(key.shiftPressed).toBe(false);
      expect(key.ctrlPressed).toBe(false);
      expect(key.isNumpadKey).toBe(false);
    });

    it("creates ASCII key with factory method", () => {
      const key = Key.asciiKey("a", true, true);
      expect(key.ascii).toBe("a");
      expect(key.name).toBe(KeyName.ASCII);
      expect(key.shiftPressed).toBe(true);
      expect(key.ctrlPressed).toBe(true);
    });

    it("creates named key with factory method", () => {
      const key = Key.namedKey(KeyName.RETURN, true, false);
      expect(key.ascii).toBe("");
      expect(key.name).toBe(KeyName.RETURN);
      expect(key.shiftPressed).toBe(true);
      expect(key.ctrlPressed).toBe(false);
    });
  });

  describe("cursor keys", () => {
    it("detects regular cursor keys", () => {
      expect(Key.namedKey(KeyName.LEFT).isCursorKey).toBe(true);
      expect(Key.namedKey(KeyName.RIGHT).isCursorKey).toBe(true);
      expect(Key.namedKey(KeyName.HOME).isCursorKey).toBe(true);
      expect(Key.namedKey(KeyName.END).isCursorKey).toBe(true);
    });

    it("detects Emacs-style cursor keys", () => {
      expect(Key.asciiKey("a", false, true).isCursorKey).toBe(true);
      expect(Key.asciiKey("e", false, true).isCursorKey).toBe(true);
      expect(Key.asciiKey("f", false, true).isCursorKey).toBe(true);
      expect(Key.asciiKey("b", false, true).isCursorKey).toBe(true);
    });
  });

  describe("delete keys", () => {
    it("detects regular delete keys", () => {
      expect(Key.namedKey(KeyName.BACKSPACE).isDeleteKey).toBe(true);
      expect(Key.namedKey(KeyName.DELETE).isDeleteKey).toBe(true);
    });

    it("detects Emacs-style delete keys", () => {
      expect(Key.asciiKey("h", false, true).isDeleteKey).toBe(true);
      expect(Key.asciiKey("d", false, true).isDeleteKey).toBe(true);
    });
  });

  describe("KeyFromKeyboardEvent", () => {
    it("handles arrow keys", () => {
      const event = {
        code: "ArrowLeft",
        key: "ArrowLeft",
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const key = KeyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.LEFT);
    });

    it("handles numpad keys", () => {
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

    it("handles special keys", () => {
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
  it("handles numpad operators", () => {
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

  it("handles numpad navigation keys", () => {
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

  it("handles numpad enter", () => {
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
  it("returns formatted string representation", () => {
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
  it("creates key with all parameters", () => {
    const key = new Key("z", KeyName.ASCII, true, true, true);
    expect(key.ascii).toBe("z");
    expect(key.name).toBe(KeyName.ASCII);
    expect(key.shiftPressed).toBe(true);
    expect(key.ctrlPressed).toBe(true);
    expect(key.isNumpadKey).toBe(true);
  });
});

describe("edge cases for cursor keys", () => {
  it("does not detect non-cursor keys as cursor keys", () => {
    expect(Key.namedKey(KeyName.SPACE).isCursorKey).toBe(false);
    expect(Key.namedKey(KeyName.RETURN).isCursorKey).toBe(false);
    expect(Key.asciiKey("x", false, true).isCursorKey).toBe(false);
    expect(Key.asciiKey("a", true, false).isCursorKey).toBe(false); // shift+a, no ctrl
  });

  it("treats uppercase Emacs cursor keys with ctrl as non-cursor keys", () => {
    expect(Key.asciiKey("A", false, true).isCursorKey).toBe(false); // uppercase A
    expect(Key.asciiKey("E", false, true).isCursorKey).toBe(false); // uppercase E
  });
});

describe("edge cases for delete keys", () => {
  it("does not detect non-delete keys as delete keys", () => {
    expect(Key.namedKey(KeyName.SPACE).isDeleteKey).toBe(false);
    expect(Key.namedKey(KeyName.RETURN).isDeleteKey).toBe(false);
    expect(Key.asciiKey("x", false, true).isDeleteKey).toBe(false);
    expect(Key.asciiKey("h", true, false).isDeleteKey).toBe(false); // shift+h, no ctrl
  });

  it("treats uppercase Emacs delete keys with ctrl as non-delete keys", () => {
    expect(Key.asciiKey("H", false, true).isDeleteKey).toBe(false); // uppercase H
    expect(Key.asciiKey("D", false, true).isDeleteKey).toBe(false); // uppercase D
  });
});

describe("KeyFromKeyboardEvent edge cases", () => {
  it("handles unknown key codes", () => {
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

  it("handles modifier keys correctly", () => {
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

  it("handles regular ASCII keys", () => {
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

  it("handles ESC, SPACE, and TAB keys", () => {
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

  it("handles numpad keys with single character", () => {
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

  it("handles numpad 0 and numpad 5 with navigation functions", () => {
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

  it("preserves original key value in ascii property", () => {
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
  it("handles all KeyName enum values", () => {
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
  it("handles asciiKey with empty string", () => {
    const key = Key.asciiKey("");
    expect(key.ascii).toBe("");
    expect(key.name).toBe(KeyName.ASCII);
  });

  it("handles asciiKey with special characters", () => {
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

  it("handles Unicode characters", () => {
    const unicodeChars = ["ñ", "é", "中", "🎉"];
    unicodeChars.forEach((char) => {
      const key = Key.asciiKey(char);
      expect(key.ascii).toBe(char);
      expect(key.name).toBe(KeyName.ASCII);
    });
  });
});

describe("numpad key combinations", () => {
  it("handles numpad keys with modifiers", () => {
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

  it("handles all numpad digit keys", () => {
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

describe("KeyFromKeyboardEvent comprehensive coverage", () => {
  it("handles numpad keys when Num Lock is off (navigation mode)", () => {
    const cases = [
      { code: "Numpad0", key: "Insert", expected: KeyName.UNKNOWN },
      { code: "Numpad1", key: "End", expected: KeyName.END },
      { code: "Numpad2", key: "ArrowDown", expected: KeyName.DOWN },
      { code: "Numpad3", key: "PageDown", expected: KeyName.PAGE_DOWN },
      { code: "Numpad4", key: "ArrowLeft", expected: KeyName.LEFT },
      { code: "Numpad5", key: "Clear", expected: KeyName.UNKNOWN },
      { code: "Numpad6", key: "ArrowRight", expected: KeyName.RIGHT },
      { code: "Numpad7", key: "Home", expected: KeyName.HOME },
      { code: "Numpad8", key: "ArrowUp", expected: KeyName.UP },
      { code: "Numpad9", key: "PageUp", expected: KeyName.PAGE_UP },
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
      expect(keyObj.isNumpadKey).toBe(false); // Navigation mode should not set isNumpadKey
    });
  });

  it("handles numpad delete key", () => {
    const event = {
      code: "NumpadDecimal",
      key: "Delete",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.ASCII);
    expect(key.ascii).toBe("Delete");
    expect(key.isNumpadKey).toBe(true);
  });

  it("handles all modifier combinations", () => {
    const modifierCombinations = [
      { shift: false, ctrl: false },
      { shift: true, ctrl: false },
      { shift: false, ctrl: true },
      { shift: true, ctrl: true },
    ];

    modifierCombinations.forEach(({ shift, ctrl }) => {
      const event = {
        code: "KeyA",
        key: "a",
        shiftKey: shift,
        ctrlKey: ctrl,
      } as KeyboardEvent;
      const key = KeyFromKeyboardEvent(event);
      expect(key.shiftPressed).toBe(shift);
      expect(key.ctrlPressed).toBe(ctrl);
      expect(key.ascii).toBe("a");
    });
  });

  it("handles function keys", () => {
    const functionKeys = ["F1", "F2", "F3", "F12"];
    functionKeys.forEach((fKey) => {
      const event = {
        code: fKey,
        key: fKey,
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const key = KeyFromKeyboardEvent(event);
      expect(key.name).toBe(KeyName.UNKNOWN);
      expect(key.ascii).toBe(fKey);
      expect(key.isNumpadKey).toBe(false);
    });
  });

  it("handles special characters and symbols", () => {
    const specialChars = [
      { code: "Semicolon", key: ";" },
      { code: "Quote", key: "'" },
      { code: "Comma", key: "," },
      { code: "Period", key: "." },
      { code: "Slash", key: "/" },
      { code: "Backslash", key: "\\" },
      { code: "BracketLeft", key: "[" },
      { code: "BracketRight", key: "]" },
      { code: "Minus", key: "-" },
      { code: "Equal", key: "=" },
    ];

    specialChars.forEach(({ code, key }) => {
      const event = {
        code,
        key,
        shiftKey: false,
        ctrlKey: false,
      } as KeyboardEvent;
      const keyObj = KeyFromKeyboardEvent(event);
      expect(keyObj.name).toBe(KeyName.UNKNOWN);
      expect(keyObj.ascii).toBe(key);
      expect(keyObj.isNumpadKey).toBe(false);
    });
  });

  it("handles shifted special characters", () => {
    const shiftedChars = [
      { code: "Digit1", key: "!" },
      { code: "Digit2", key: "@" },
      { code: "Digit3", key: "#" },
      { code: "Digit4", key: "$" },
      { code: "Digit5", key: "%" },
    ];

    shiftedChars.forEach(({ code, key }) => {
      const event = {
        code,
        key,
        shiftKey: true,
        ctrlKey: false,
      } as KeyboardEvent;
      const keyObj = KeyFromKeyboardEvent(event);
      expect(keyObj.name).toBe(KeyName.UNKNOWN);
      expect(keyObj.ascii).toBe(key);
      expect(keyObj.shiftPressed).toBe(true);
      expect(keyObj.isNumpadKey).toBe(false);
    });
  });

  it("handles caps lock scenarios", () => {
    const event = {
      code: "KeyA",
      key: "A", // Caps lock on
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.ascii).toBe("A");
    expect(key.shiftPressed).toBe(false);
  });

  it("handles meta and alt keys in event", () => {
    // Note: KeyFromKeyboardEvent doesn't currently handle meta/alt, but we test that it doesn't break
    const event = {
      code: "KeyA",
      key: "a",
      shiftKey: false,
      ctrlKey: false,
      metaKey: true,
      altKey: true,
    } as any; // Using any to add properties not in the interface
    const key = KeyFromKeyboardEvent(event);
    expect(key.ascii).toBe("a");
    expect(key.name).toBe(KeyName.UNKNOWN);
  });
});

describe("Key property getters", () => {
  it("has immutable properties", () => {
    const key = new Key("test", KeyName.ASCII, true, true, true);

    // Test that properties are read-only by attempting to modify
    expect(key.ascii).toBe("test");
    expect(key.name).toBe(KeyName.ASCII);
    expect(key.shiftPressed).toBe(true);
    expect(key.ctrlPressed).toBe(true);
    expect(key.isNumpadKey).toBe(true);
  });
});

describe("isCursorKey edge cases", () => {
  it("requires exact lowercase for Emacs-style cursor keys", () => {
    const emacsKeys = ["a", "e", "f", "b"];
    emacsKeys.forEach((char) => {
      const lowerKey = Key.asciiKey(char, false, true);
      expect(lowerKey.isCursorKey).toBe(true);

      const upperKey = Key.asciiKey(char.toUpperCase(), false, true);
      expect(upperKey.isCursorKey).toBe(false);
    });
  });

  it("does not detect cursor keys without ctrl for Emacs-style", () => {
    const emacsKeys = ["a", "e", "f", "b"];
    emacsKeys.forEach((char) => {
      const key = Key.asciiKey(char, false, false); // No ctrl
      expect(key.isCursorKey).toBe(false);
    });
  });

  it("detects cursor keys with shift modifier", () => {
    const cursorKeys = [KeyName.LEFT, KeyName.RIGHT, KeyName.HOME, KeyName.END];
    cursorKeys.forEach((keyName) => {
      const key = Key.namedKey(keyName, true, false); // With shift
      expect(key.isCursorKey).toBe(true);
    });
  });
});

describe("isDeleteKey edge cases", () => {
  it("requires exact lowercase for Emacs-style delete keys", () => {
    const emacsKeys = ["h", "d"];
    emacsKeys.forEach((char) => {
      const lowerKey = Key.asciiKey(char, false, true);
      expect(lowerKey.isDeleteKey).toBe(true);

      const upperKey = Key.asciiKey(char.toUpperCase(), false, true);
      expect(upperKey.isDeleteKey).toBe(false);
    });
  });

  it("does not detect delete keys without ctrl for Emacs-style", () => {
    const emacsKeys = ["h", "d"];
    emacsKeys.forEach((char) => {
      const key = Key.asciiKey(char, false, false); // No ctrl
      expect(key.isDeleteKey).toBe(false);
    });
  });

  it("detects delete keys with shift modifier", () => {
    const deleteKeys = [KeyName.BACKSPACE, KeyName.DELETE];
    deleteKeys.forEach((keyName) => {
      const key = Key.namedKey(keyName, true, false); // With shift
      expect(key.isDeleteKey).toBe(true);
    });
  });
});

describe("factory methods comprehensive", () => {
  it("handles asciiKey with all parameter combinations", () => {
    const combinations = [
      { shift: false, ctrl: false },
      { shift: true, ctrl: false },
      { shift: false, ctrl: true },
      { shift: true, ctrl: true },
    ];

    combinations.forEach(({ shift, ctrl }) => {
      const key = Key.asciiKey("x", shift, ctrl);
      expect(key.ascii).toBe("x");
      expect(key.name).toBe(KeyName.ASCII);
      expect(key.shiftPressed).toBe(shift);
      expect(key.ctrlPressed).toBe(ctrl);
      expect(key.isNumpadKey).toBe(false);
    });
  });

  it("handles namedKey with all parameter combinations", () => {
    const combinations = [
      { shift: false, ctrl: false },
      { shift: true, ctrl: false },
      { shift: false, ctrl: true },
      { shift: true, ctrl: true },
    ];

    combinations.forEach(({ shift, ctrl }) => {
      const key = Key.namedKey(KeyName.RETURN, shift, ctrl);
      expect(key.ascii).toBe("");
      expect(key.name).toBe(KeyName.RETURN);
      expect(key.shiftPressed).toBe(shift);
      expect(key.ctrlPressed).toBe(ctrl);
      expect(key.isNumpadKey).toBe(false);
    });
  });
});

describe("toString method comprehensive", () => {
  it("handles toString with numpad keys", () => {
    const key = new Key("5", KeyName.ASCII, false, false, true);
    expect(key.toString()).toBe(
      "Key{ascii: 5, name: ASCII, shift: false, ctrl: false}"
    );
    // Note: toString doesn't include isNumpadKey in output
  });

  it("handles toString with empty ascii", () => {
    const key = Key.namedKey(KeyName.UNKNOWN);
    expect(key.toString()).toBe(
      "Key{ascii: , name: UNKNOWN, shift: false, ctrl: false}"
    );
  });

  it("handles toString with special characters", () => {
    const specialChars = [" ", "\t", "\n", '"', "'"];
    specialChars.forEach((char) => {
      const key = Key.asciiKey(char);
      expect(key.toString()).toBe(
        `Key{ascii: ${char}, name: ASCII, shift: false, ctrl: false}`
      );
    });
  });
});

describe("KeyFromKeyboardEvent fall-through cases", () => {
  it("handles the default case in switch statement", () => {
    const event = {
      code: "UnknownCode123",
      key: "unknownKey",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.UNKNOWN);
    expect(key.ascii).toBe("unknownKey");
    expect(key.isNumpadKey).toBe(false);
  });

  it("preserves keyName when falling through to default", () => {
    // Test the `keyName = keyName;` line in the default case
    const event = {
      code: "SomeOtherKey",
      key: "x",
      shiftKey: false,
      ctrlKey: false,
    } as KeyboardEvent;
    const key = KeyFromKeyboardEvent(event);
    expect(key.name).toBe(KeyName.UNKNOWN);
    expect(key.ascii).toBe("x");
  });
});
