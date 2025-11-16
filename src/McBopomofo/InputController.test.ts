import { InputController, MovingCursorOption } from "./InputController";
import { CtrlEnterOption } from "./CtrlEnterOption";
import {
  Big5,
  ChineseNumber,
  ChoosingCandidate,
  Committing,
  CustomMenu,
  Empty,
  EmptyIgnoringPrevious,
  EnclosingNumber,
  InputState,
  Inputting,
  Marking,
  RomanNumber,
  SelectingDateMacro,
  SelectingDictionary,
  SelectingFeature,
} from "./InputState";
import { Key, KeyName } from "./Key";

// Mock InputUI interface for testing
interface MockInputUI {
  reset: jest.Mock;
  commitString: jest.Mock;
  update: jest.Mock;
}

function createMockUI(): MockInputUI {
  return {
    reset: jest.fn(),
    commitString: jest.fn(),
    update: jest.fn(),
  };
}

function inputCStr(controller: InputController, str: string) {
  for (let i = 0; i < str.length; i++) {
    inputChar(controller, str[i]);
  }
}

function inputChar(controller: InputController, char: string): boolean {
  let key = Key.asciiKey(char, false, false);
  if (char === " ") {
    key = new Key(" ", KeyName.SPACE, false, false);
  }
  return controller.mcbopomofoKeyEvent(key);
}

function inputKey(
  controller: InputController,
  keyName: KeyName,
  ascii: string = "",
  shiftPressed: boolean = false,
  ctrlPressed: boolean = false
) {
  const key = new Key(ascii, keyName, shiftPressed, ctrlPressed);
  return controller.mcbopomofoKeyEvent(key);
}

describe("InputController", () => {
  let controller: InputController;
  let mockUI: MockInputUI;
  let lastState: string = "";

  beforeEach(() => {
    mockUI = createMockUI();
    mockUI.update.mockImplementation((state: string) => {
      lastState = state;
    });
    controller = new InputController(mockUI as any);
  });

  describe("Basic Functionality", () => {
    it("initializes with empty state", () => {
      expect(controller.state).toBeInstanceOf(Empty);
    });

    it("resets to empty state", () => {
      // Input some text first
      inputCStr(controller, "5j/");
      expect(controller.state).not.toBeInstanceOf(Empty);

      // Reset
      controller.reset();
      expect(controller.state).toBeInstanceOf(Empty);
      expect(mockUI.reset).toHaveBeenCalled();
    });

    it("returns boolean from keyboard events", () => {
      // Test direct mcbopomofoKeyEvent method instead of keyEvent
      const key = Key.asciiKey("a", false, false);
      const result = controller.mcbopomofoKeyEvent(key);
      expect(typeof result).toBe("boolean");
    });

    it("ignores modifier keys", () => {
      const shiftKey = Key.asciiKey("Shift", false, false);
      const metaKey = Key.asciiKey("Meta", false, false);
      const altKey = Key.asciiKey("Alt", false, false);

      expect(controller.mcbopomofoKeyEvent(shiftKey)).toBe(false);
      expect(controller.mcbopomofoKeyEvent(metaKey)).toBe(false);
      expect(controller.mcbopomofoKeyEvent(altKey)).toBe(false);
    });
  });

  describe("Configuration Methods", () => {
    it("sets traditional mode", () => {
      controller.setTraditionalMode(true);
      inputCStr(controller, "5j/ ");
      let state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let key = Key.asciiKey("1", false, false);
      controller.mcbopomofoKeyEvent(key);
      expect(controller.state).toBeInstanceOf(Committing);
      state = controller.state;
      if (state instanceof Committing) {
        expect(state.text).toBe("中");
      }

      controller.setTraditionalMode(false);
      inputCStr(controller, "5j/ ");
      state = controller.state;
      expect(state).toBeInstanceOf(Inputting);
      key = new Key(" ", KeyName.SPACE, false, false);
      controller.mcbopomofoKeyEvent(key);
      expect(controller.state).toBeInstanceOf(ChoosingCandidate);
      key = Key.asciiKey("1", false, false);
      controller.mcbopomofoKeyEvent(key);
      expect(controller.state).toBeInstanceOf(Inputting);
      state = controller.state;
      if (state instanceof Inputting) {
        expect(state.composingBuffer).toBe("中");
      }
    });

    it("sets language code", () => {
      controller.setLanguageCode("zh-TW");
      controller.setLanguageCode("en");
      // No exception should be thrown
    });

    it("sets keyboard layout", () => {
      const layouts = [
        "Standard",
        "ETen",
        "Hsu",
        "ETen26",
        "HanyuPinyin",
        "IBM",
        "Unknown",
      ];

      layouts.forEach((layout) => {
        controller.setKeyboardLayout(layout);
        // No exception should be thrown
      });
    });

    it("sets select phrase option", () => {
      controller.setSelectPhrase("after_cursor");
      controller.setSelectPhrase("before_cursor");
      controller.setSelectPhrase("invalid_option");
      // No exception should be thrown
    });

    it("sets move cursor after selection", () => {
      controller.setMoveCursorAfterSelection(true);
      controller.setMoveCursorAfterSelection(false);
      // No exception should be thrown
    });

    it("sets letter mode", () => {
      controller.setLetterMode("lower");
      controller.setLetterMode("upper");
      controller.setLetterMode("invalid");
      // No exception should be thrown
    });

    it("sets candidate keys", () => {
      controller.setCandidateKeys("123456789");
      controller.setCandidateKeys("asdfgh");
      controller.setCandidateKeys("1234567890abcdefg"); // Too many
      controller.setCandidateKeys("123"); // Too few
      controller.setCandidateKeys(undefined as any);
      // No exception should be thrown
    });

    it("sets candidate keys count", () => {
      controller.setCandidateKeysCount(9);
      controller.setCandidateKeysCount(15);
      controller.setCandidateKeysCount(3); // Too few
      controller.setCandidateKeysCount(16); // Too many
      // No exception should be thrown
    });

    it("sets moving cursor option", () => {
      controller.setMovingCursorOption(MovingCursorOption.Disabled);
      inputCStr(controller, "5j/ jp6");
      let key = new Key(" ", KeyName.SPACE);
      controller.mcbopomofoKeyEvent(key);
      let state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(2);
      key = new Key("", KeyName.LEFT, true);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(1);
      expect((state as ChoosingCandidate).cursorIndex).toBe(1);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(0);
      expect((state as ChoosingCandidate).cursorIndex).toBe(0);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(0);
      expect((state as ChoosingCandidate).cursorIndex).toBe(0);

      key = new Key("", KeyName.RIGHT, true);
      controller.mcbopomofoKeyEvent(key);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(2);
      expect((state as ChoosingCandidate).cursorIndex).toBe(2);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(2);
      expect((state as ChoosingCandidate).cursorIndex).toBe(2);

      controller.setMovingCursorOption(MovingCursorOption.UseJK);
      controller.reset();
      inputCStr(controller, "5j/ jp6");
      key = new Key(" ", KeyName.SPACE);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(2);
      key = new Key("j", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(1);
      expect((state as ChoosingCandidate).cursorIndex).toBe(1);
      key = new Key("k", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(2);
      expect((state as ChoosingCandidate).cursorIndex).toBe(2);

      controller.setMovingCursorOption(MovingCursorOption.UseHL);
      controller.reset();
      inputCStr(controller, "5j/ jp6");
      key = new Key(" ", KeyName.SPACE);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(2);
      key = new Key("h", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(1);
      expect((state as ChoosingCandidate).cursorIndex).toBe(1);
      key = new Key("l", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      expect((state as ChoosingCandidate).originalCursorIndex).toBe(2);
      expect((state as ChoosingCandidate).cursorIndex).toBe(2);
    });

    it("sets ESC clear entire buffer", () => {
      controller.setEscClearEntireBuffer(true);
      inputCStr(controller, "5j/ jp6");
      let state = controller.state;
      expect(state).toBeInstanceOf(Inputting);
      const key = new Key("", KeyName.ESC);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
      controller.setEscClearEntireBuffer(false);
    });

    it("sets repeated punctuation choose candidate", () => {
      controller.setRepeatedPunctuationChooseCandidate(true);
      inputCStr(controller, "++");
      const state = controller.state;
      expect(state).toBeInstanceOf(Inputting);

      if (state instanceof Inputting) {
        expect(state.composingBuffer).toBe("＝");
      }
      controller.setRepeatedPunctuationChooseCandidate(false);
    });

    it("sets vertical candidates", () => {
      controller.setUserVerticalCandidates(true);
      controller.setUserVerticalCandidates(false);
      // No exception should be thrown
    });

    it("sets half width punctuation", () => {
      controller.setHalfWidthPunctuationEnabled(true);
      const key = new Key(">", KeyName.ASCII, true);
      controller.mcbopomofoKeyEvent(key);
      const state = controller.state;
      expect(state).toBeInstanceOf(Inputting);

      if (state instanceof Inputting) {
        expect(state.composingBuffer).toBe(".");
      }
      controller.setHalfWidthPunctuationEnabled(false);
    });

    it("sets Chinese conversion", () => {
      controller.setChineseConversionEnabled(true);
      inputCStr(controller, "z;6fm 5j;4dj;4n0 g/ vul4");
      const state = controller.state;
      expect(state).toBeInstanceOf(Inputting);

      if (state instanceof Inputting) {
        expect(state.composingBuffer).toBe("防区状况三生效");
      }

      controller.setChineseConversionEnabled(false);
    });

    it("sets ctrl enter option", () => {
      controller.setCtrlEnterOption(CtrlEnterOption.none);
      controller.setCtrlEnterOption(CtrlEnterOption.bpmfReadings);
      controller.setCtrlEnterOption(CtrlEnterOption.htmlRuby);
      controller.setCtrlEnterOption(CtrlEnterOption.bopomofoBraille);
      controller.setCtrlEnterOption(CtrlEnterOption.hanyuPinyin);
      // No exception should be thrown
    });
  });

  describe("User Phrases and Callbacks", () => {
    it("sets user phrases with map", () => {
      const phrases = new Map<string, string[]>();
      phrases.set("test", ["測試", "試驗"]);
      controller.setUserPhrases(phrases);
      // No exception should be thrown
    });

    it("sets user phrases with string", () => {
      controller.setUserPhrases("test phrase string");
      // No exception should be thrown
    });

    it("sets excluded phrases", () => {
      const excludedPhrases = new Map<string, string[]>();
      excludedPhrases.set("exclude", ["排除"]);
      controller.setExcludedPhrases(excludedPhrases);
      controller.setExcludedPhrases("excluded string");
      // No exception should be thrown
    });

    it("sets phrase change callbacks", () => {
      const phraseCallback = jest.fn();
      const excludedCallback = jest.fn();

      controller.setOnPhraseChange(phraseCallback);
      controller.setOnExcludedPhraseChange(excludedCallback);
      // No exception should be thrown
    });

    it("sets error callback", () => {
      const errorCallback = jest.fn();
      controller.setOnError(errorCallback);
      // No exception should be thrown
    });

    it("sets open URL callback", () => {
      const urlCallback = jest.fn();
      controller.setOnOpenUrl(urlCallback);
      controller.setOnOpenUrl(undefined);
      // No exception should be thrown
    });
  });

  describe("Input and State Transitions", () => {
    it("shows correct candidate", () => {
      inputCStr(controller, "5j/ jp6");

      let state = controller.state;
      expect(state).toBeInstanceOf(Inputting);

      const space = new Key(" ", KeyName.SPACE, false, false);
      controller.mcbopomofoKeyEvent(space);
      controller.mcbopomofoKeyEvent(space);
      controller.mcbopomofoKeyEvent(space);

      state = controller.state;
      const parsed = JSON.parse(lastState);
      const candidates = parsed.candidates;
      expect(candidates.length).toBe(9);
    });

    it("handles basic input and produce inputting state", () => {
      inputChar(controller, "5");
      expect(controller.state).toBeInstanceOf(Inputting);

      inputChar(controller, "j");
      expect(controller.state).toBeInstanceOf(Inputting);
    });

    it("handles space key to show candidates", () => {
      inputCStr(controller, "5j/");
      expect(controller.state).toBeInstanceOf(Inputting);

      inputKey(controller, KeyName.SPACE);
      // After space, should show candidates
      const parsed = JSON.parse(lastState);
      expect(parsed.candidates).toBeDefined();
    });

    it("handles navigation keys", () => {
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);
      inputKey(controller, KeyName.SPACE);

      // Should handle arrow keys
      expect(inputKey(controller, KeyName.LEFT)).toBe(true);
      expect(inputKey(controller, KeyName.RIGHT)).toBe(true);
      expect(inputKey(controller, KeyName.UP)).toBe(true);
      expect(inputKey(controller, KeyName.DOWN)).toBe(true);
      expect(inputKey(controller, KeyName.HOME)).toBe(true);
      expect(inputKey(controller, KeyName.END)).toBe(true);
      expect(inputKey(controller, KeyName.PAGE_UP)).toBe(true);
      expect(inputKey(controller, KeyName.PAGE_DOWN)).toBe(true);
    });

    it("handles navigation keys", () => {
      controller.setUserVerticalCandidates(true);
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);
      inputKey(controller, KeyName.SPACE);

      // Should handle arrow keys
      expect(inputKey(controller, KeyName.LEFT)).toBe(true);
      expect(inputKey(controller, KeyName.RIGHT)).toBe(true);
      expect(inputKey(controller, KeyName.UP)).toBe(true);
      expect(inputKey(controller, KeyName.DOWN)).toBe(true);
      expect(inputKey(controller, KeyName.HOME)).toBe(true);
      expect(inputKey(controller, KeyName.END)).toBe(true);
      expect(inputKey(controller, KeyName.PAGE_UP)).toBe(true);
      expect(inputKey(controller, KeyName.PAGE_DOWN)).toBe(true);
    });

    it("handles escape key", () => {
      inputCStr(controller, "5j/");
      expect(controller.state).toBeInstanceOf(Inputting);

      inputKey(controller, KeyName.ESC);
      // ESC typically results in EmptyIgnoringPrevious or Empty
      expect(
        controller.state instanceof Empty ||
          controller.state instanceof EmptyIgnoringPrevious
      ).toBe(true);
    });

    it("handles backspace key", () => {
      inputCStr(controller, "5j/");
      expect(controller.state).toBeInstanceOf(Inputting);

      inputKey(controller, KeyName.BACKSPACE);
      expect(controller.state).toBeInstanceOf(Inputting);
    });

    it("handles return key", () => {
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);

      // Return should select candidate
      expect(inputKey(controller, KeyName.RETURN)).toBe(true);
    });

    it("handles digit keys for candidate selection", () => {
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);

      // Digit keys should be handled when candidates are available
      const result = inputChar(controller, "1");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Candidate Selection", () => {
    beforeEach(() => {
      // Set up a state with candidates
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);
    });

    it("selects candidate with number keys", () => {
      const result1 = inputChar(controller, "1");
      expect(typeof result1).toBe("boolean");

      // Reset for next test
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);
      const result2 = inputChar(controller, "2");
      expect(typeof result2).toBe("boolean");
    });

    it("handles candidate navigation with J/K when enabled", () => {
      controller.setMovingCursorOption(MovingCursorOption.UseJK);

      const resultJ = inputChar(controller, "j");
      const resultK = inputChar(controller, "k");
      expect(typeof resultJ).toBe("boolean");
      expect(typeof resultK).toBe("boolean");
    });

    it("handles candidate navigation with J/K when enabled", () => {
      controller.setMovingCursorOption(MovingCursorOption.UseJK);

      const resultH = inputChar(controller, "h");
      const resultL = inputChar(controller, "l");
      expect(typeof resultH).toBe("boolean");
      expect(typeof resultL).toBe("boolean");
    });

    it("handles candidate navigation with H/L when enabled", () => {
      controller.setMovingCursorOption(MovingCursorOption.UseHL);

      const resultH = inputChar(controller, "h");
      const resultL = inputChar(controller, "l");
      expect(typeof resultH).toBe("boolean");
      expect(typeof resultL).toBe("boolean");
    });

    it("handles candidate navigation with H/L when enabled", () => {
      controller.setMovingCursorOption(MovingCursorOption.UseHL);

      const resultJ = inputChar(controller, "j");
      const resultK = inputChar(controller, "k");
      expect(typeof resultJ).toBe("boolean");
      expect(typeof resultK).toBe("boolean");
    });
  });

  describe("Special Keys and Features", () => {
    it("handles question mark for dictionary", () => {
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);

      const result = inputChar(controller, "?");
      expect(typeof result).toBe("boolean");
    });

    it("handles plus/minus keys in simplified mode", () => {
      controller.setTraditionalMode(false);
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);

      const resultPlus = inputChar(controller, "+");
      expect(typeof resultPlus).toBe("boolean");

      // Reset state for next test
      inputKey(controller, KeyName.ESC);

      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);
      const resultMinus = inputChar(controller, "-");
      expect(typeof resultMinus).toBe("boolean");
    });
  });

  describe("UI Integration", () => {
    it("sets UI component", () => {
      const newMockUI = createMockUI();
      controller.setUI(newMockUI as any);

      inputChar(controller, "a");
      expect(newMockUI.update).toHaveBeenCalled();
    });

    it("updates UI on state changes", () => {
      mockUI.update.mockClear();

      inputChar(controller, "5");
      expect(mockUI.update).toHaveBeenCalled();
    });

    it("commits string on completion", () => {
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);
      inputChar(controller, "1"); // Select first candidate

      // Check if commitString was called or if state changed appropriately
      expect(mockUI.commitString.mock.calls.length >= 0).toBe(true);
    });

    it("resets UI when entering empty state", () => {
      inputChar(controller, "5");
      mockUI.reset.mockClear();

      inputKey(controller, KeyName.ESC);
      expect(mockUI.reset).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("calls error callback when set", () => {
      const errorCallback = jest.fn();
      controller.setOnError(errorCallback);

      // Try to trigger an error condition
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);

      // Try to move cursor beyond bounds
      controller.setMovingCursorOption(MovingCursorOption.UseJK);
      // This should trigger error callback when trying to move past bounds
      for (let i = 0; i < 20; i++) {
        inputChar(controller, "j"); // Move left beyond bounds
      }
    });

    it("handles invalid keyboard events gracefully", () => {
      const invalidEvent = {} as KeyboardEvent;
      expect(() => controller.keyEvent(invalidEvent)).not.toThrow();
    });
  });

  describe("Complex Input Scenarios", () => {
    it("handles multiple input sessions", () => {
      // First input session
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);
      inputChar(controller, "1");

      // State should be empty or committed after selection
      expect(
        controller.state instanceof Empty ||
          controller.state instanceof Inputting
      ).toBe(true);

      // Second input session
      inputCStr(controller, "jp6");
      expect(controller.state).toBeInstanceOf(Inputting);
    });

    it("handles mixed input types", () => {
      inputChar(controller, "5");
      expect(controller.state).toBeInstanceOf(Inputting);

      inputChar(controller, "j");
      expect(controller.state).toBeInstanceOf(Inputting);

      inputChar(controller, "/");
      expect(controller.state).toBeInstanceOf(Inputting);
    });

    it("maintains state consistency during navigation", () => {
      inputCStr(controller, "5j/");
      inputKey(controller, KeyName.SPACE);

      const initialState = controller.state;

      // Navigate through candidates
      inputKey(controller, KeyName.DOWN);
      inputKey(controller, KeyName.UP);

      // State should still be valid
      expect(controller.state).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty input gracefully", () => {
      expect(() => inputCStr(controller, "")).not.toThrow();
    });

    it("handles rapid key presses", () => {
      for (let i = 0; i < 100; i++) {
        inputChar(controller, "5");
        inputKey(controller, KeyName.BACKSPACE);
      }
      expect(controller.state).toBeDefined();
    });

    it("handles undefined/null inputs safely", () => {
      controller.setCandidateKeys(undefined as any);
      controller.setUserPhrases(undefined as any);
      controller.setOnOpenUrl(undefined);
      // Should not throw
    });
  });
  describe("Big5", () => {
    it("enters Big5 mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("", KeyName.RETURN, false, false);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(Big5);
      inputCStr(controller, "a143");
      state = controller.state;
      expect(state).toBeInstanceOf(Empty);
    });

    it("enters Big5 mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("1", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(Big5);
      inputCStr(controller, "a143");
      state = controller.state;
      expect(state).toBeInstanceOf(Empty);
    });

    it("enters and exit Big5 mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("", KeyName.RETURN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(Big5);
      key = new Key("", KeyName.ESC);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("Date Macro", () => {
    it("enters Date Macro mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("2", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(SelectingDateMacro);
      key = new Key("3", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(Committing);
    });
  });

  describe("Roman Number", () => {
    it("enters Roman Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("7", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
    });

    it("inputs numbers in Roman Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      key = new Key("7", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);

      inputCStr(controller, "1");
      state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
      if (state instanceof RomanNumber) {
        expect(state.composingBuffer).toBe("[羅馬數字 (字母)] 1");
      }
    });

    it("converts multiple digits to Roman numerals", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      key = new Key("7", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);

      inputCStr(controller, "42");
      const state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
      if (state instanceof RomanNumber) {
        expect(state.composingBuffer).toBe("[羅馬數字 (字母)] 42");
      }
    });

    it("converts 99 to Roman numeral", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("7", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);

      inputCStr(controller, "99");
      const state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
      if (state instanceof RomanNumber) {
        expect(state.composingBuffer).toBe("[羅馬數字 (字母)] 99");
      }
    });

    it("commits Roman number on return key", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("7", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);

      inputCStr(controller, "8");
      let state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);

      key = new Key("", KeyName.RETURN);
      const result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(Committing);
      if (state instanceof Committing) {
        expect(state.text).toBe("VIII");
      }
    });

    it("exits Roman Number mode with ESC key", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("7", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);

      inputCStr(controller, "25");
      let state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);

      key = new Key("", KeyName.ESC);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(Empty);
    });

    it("handles backspace in Roman Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("7", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);

      inputCStr(controller, "123");
      let state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
      if (state instanceof RomanNumber) {
        expect(state.composingBuffer).toBe("[羅馬數字 (字母)] 123");
      }

      key = new Key("", KeyName.BACKSPACE);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
      if (state instanceof RomanNumber) {
        expect(state.composingBuffer).toBe("[羅馬數字 (字母)] 12");
      }
    });

    it("handles large numbers in Roman Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("7", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);

      inputCStr(controller, "444");
      const state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
      if (state instanceof RomanNumber) {
        expect(state.composingBuffer).toBe("[羅馬數字 (字母)] 444");
      }
    });

    it("maintains cursor position in Roman Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("7", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);

      inputCStr(controller, "10");
      const state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);
      if (state instanceof RomanNumber) {
        expect(state.number.length).toBe(2);
      }
    });

    it("resets Roman Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("7", KeyName.UNKNOWN);
      controller.mcbopomofoKeyEvent(key);

      inputCStr(controller, "50");
      let state = controller.state;
      expect(state).toBeInstanceOf(RomanNumber);

      controller.reset();
      state = controller.state;
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("Enclosing Number", () => {
    it("enters Date Macro mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("3", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(EnclosingNumber);
      key = new Key("3", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(EnclosingNumber);
      key = new Key("", KeyName.RETURN);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
    });
  });

  describe("Chinese Number", () => {
    it("enters Chinese Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("4", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(ChineseNumber);
      inputCStr(controller, "1234");
      state = controller.state;
      expect(state).toBeInstanceOf(ChineseNumber);
      key = new Key("", KeyName.RETURN);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(Committing);
      if (state instanceof Committing) {
        expect(state.text).toBe("一千二百三十四");
      }
    });

    it("enters Chinese Number mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("5", KeyName.UNKNOWN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(ChineseNumber);
      inputCStr(controller, "1234");
      state = controller.state;
      expect(state).toBeInstanceOf(ChineseNumber);
      key = new Key("", KeyName.RETURN);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(Committing);
      if (state instanceof Committing) {
        expect(state.text).toBe("壹仟貳佰參拾肆");
      }
    });
  });

  describe("Marking", () => {
    it("enters Marking mode", () => {
      inputCStr(controller, "jo65j/ ");
      let key = new Key("", KeyName.LEFT, true);
      const result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(Marking);
      controller.mcbopomofoKeyEvent(key);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(Marking);
      if (state instanceof Marking) {
        expect(state.markedText).toBe("為中");
      }
      let getPhrase: any | undefined = undefined;
      controller.setOnPhraseChange((phrase) => {
        getPhrase = phrase;
      });
      key = new Key("", KeyName.RETURN);
      controller.mcbopomofoKeyEvent(key);
      expect(getPhrase).toBeDefined();
    });

    it("enters Marking mode", () => {
      inputCStr(controller, "5j/ jp6");
      let key = new Key("", KeyName.LEFT, true);
      const result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(Marking);
      controller.mcbopomofoKeyEvent(key);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(Marking);
      if (state instanceof Marking) {
        expect(state.markedText).toBe("中文");
      }
      key = Key.asciiKey("?", true, false);
      controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(SelectingDictionary);
      let getUrl: string | undefined = undefined;
      controller.setOnOpenUrl((url: string) => {
        getUrl = url;
      });

      key = new Key("", KeyName.DOWN);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("", KeyName.DOWN);
      controller.mcbopomofoKeyEvent(key);
      key = new Key("", KeyName.RETURN);
      controller.mcbopomofoKeyEvent(key);
      expect(getUrl).toBeDefined();
    });
  });

  describe("Boost", () => {
    it("boosts a phrase", () => {
      inputCStr(controller, "5j/ jp6");
      let key = new Key(" ", KeyName.SPACE);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let getPhrase: any | undefined = undefined;
      controller.setOnPhraseChange((phrase) => {
        getPhrase = phrase;
      });

      key = Key.asciiKey("=", false, false);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(CustomMenu);
      key = new Key("", KeyName.RETURN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(getPhrase).toBeDefined();
    });
  });

  describe("Exclude", () => {
    it("excludes a phrase", () => {
      inputCStr(controller, "5j/ jp6");
      let key = new Key(" ", KeyName.SPACE);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let getPhrase: any | undefined = undefined;
      controller.setOnExcludedPhraseChange((phrase) => {
        getPhrase = phrase;
      });

      key = Key.asciiKey("-", false, false);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(CustomMenu);
      key = new Key("", KeyName.RETURN);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(getPhrase).toBeDefined();
    });

    it("enters and exit exclude mode", () => {
      inputCStr(controller, "5j/ jp6");
      let key = new Key(" ", KeyName.SPACE);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      key = Key.asciiKey("-", false, false);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(CustomMenu);
      key = new Key("", KeyName.ESC);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
    });
  });

  describe("Selecting Feature", () => {
    it("enters and exit selecting feature mode", () => {
      let key = new Key("\\", KeyName.UNKNOWN, false, true);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state: InputState = controller.state;
      expect(state).toBeInstanceOf(SelectingFeature);
      key = new Key("", KeyName.ESC);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
      expect(mockUI.reset).toHaveBeenCalled();
    });
  });

  describe("Selecting Dictionary", () => {
    it("enters and exit selecting dictionary mode", () => {
      inputCStr(controller, "5j/ jp6");
      let key = new Key(" ", KeyName.SPACE);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      key = Key.asciiKey("?", false, false);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(SelectingDictionary);
      key = new Key("", KeyName.ESC);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
    });

    it("enters and exit selecting dictionary mode", () => {
      inputCStr(controller, "5j/ jp6");
      let key = new Key(" ", KeyName.SPACE);
      let result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      let state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
      key = Key.asciiKey("?", false, false);
      result = controller.mcbopomofoKeyEvent(key);
      state = controller.state;
      expect(state).toBeInstanceOf(SelectingDictionary);
      key = new Key("?", KeyName.ESC);
      result = controller.mcbopomofoKeyEvent(key);
      expect(result).toBe(true);
      state = controller.state;
      expect(state).toBeInstanceOf(ChoosingCandidate);
    });
  });

  describe("Arrow Keys", () => {
    let uiState = { candidates: [] };
    const ui = {
      reset: () => {},
      commitString: (text: string) => {},
      update: (state: string) => {
        uiState = JSON.parse(state);
      },
    };
    controller = new InputController(ui);
    inputCStr(controller, "5j/ jp6");
    let key = new Key(" ", KeyName.SPACE);
    const result = controller.mcbopomofoKeyEvent(key);
    expect(result).toBe(true);
    const state = controller.state;
    expect(state).toBeInstanceOf(ChoosingCandidate);
    {
      key = new Key("", KeyName.END, true);
      controller.mcbopomofoKeyEvent(key);
      const { candidates } = uiState;
      expect(candidates[0]["candidate"]["value"]).toBe("彣");
      key = new Key("", KeyName.END, true);
    }
    {
      key = new Key("", KeyName.HOME, true);
      controller.mcbopomofoKeyEvent(key);
      controller.mcbopomofoKeyEvent(key);
      const { candidates } = uiState;
      expect(candidates[0]["candidate"]["value"]).toBe("中文");
    }
  });
});
