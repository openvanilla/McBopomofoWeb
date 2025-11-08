/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { KeyHandler } from "./KeyHandler";
import { WebLanguageModel } from "./WebLanguageModel";
import { webData } from "./WebData";
import {
  Big5,
  ChineseNumber,
  ChineseNumbersStateStyle,
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
  RomanNumberStateStyle,
  SelectingFeature,
} from "./InputState";
import { Key, KeyName } from "./Key";
import { BopomofoKeyboardLayout } from "../Mandarin";

function asciiKey(input: string[]): Key[] {
  let keys: Key[] = [];
  for (let s of input) {
    let key = Key.asciiKey(s);
    keys.push(key);
  }
  return keys;
}

function handleKeySequence(keyHandler: KeyHandler, keys: Key[]): InputState {
  let currentState = new Empty();
  for (let key of keys) {
    keyHandler.handle(
      key,
      currentState,
      (state) => (currentState = state),
      () => {}
    );
  }
  return currentState;
}

describe("KeyHandler", () => {
  let keyHandler: KeyHandler = new KeyHandler(new WebLanguageModel(webData));
  beforeEach(() => {
    const lm = new WebLanguageModel(webData);
    keyHandler = new KeyHandler(lm);
  });

  afterEach(() => {});

  describe("Basic configuration", () => {
    test("manages languageCode property", () => {
      expect(keyHandler.languageCode).toBe("");
      keyHandler.languageCode = "zh-TW";
      expect(keyHandler.languageCode).toBe("zh-TW");
      keyHandler.languageCode = "en";
      expect(keyHandler.languageCode).toBe("en");
    });

    test("selects phrase after cursor when feature is enabled", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = true;
      expect(keyHandler.selectPhraseAfterCursorAsCandidate).toBe(true);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let leftKey = Key.namedKey(KeyName.LEFT);
      let spaceKey = Key.namedKey(KeyName.SPACE);
      keys.push(leftKey);
      keys.push(spaceKey);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let choosingCandidate = state as ChoosingCandidate;
      expect(choosingCandidate.candidates[2].value).toBe("好");
    });

    test("skips phrase after cursor when feature is disabled", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = false;
      expect(keyHandler.selectPhraseAfterCursorAsCandidate).toBe(false);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let leftKey = Key.namedKey(KeyName.LEFT);
      let spaceKey = Key.namedKey(KeyName.SPACE);
      keys.push(leftKey);
      keys.push(spaceKey);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let choosingCandidate = state as ChoosingCandidate;
      expect(choosingCandidate.candidates[2].value).toBe("你");
    });
  });

  describe("Empty State", () => {
    test("keeps empty state when pressing Enter", () => {
      let keys = [Key.namedKey(KeyName.RETURN)];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("ignores Shift+Tab in empty state", () => {
      let keys = [Key.namedKey(KeyName.TAB, true, false)];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("ignores Tab in empty state", () => {
      let keys = [Key.namedKey(KeyName.TAB)];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("ignores Esc in empty state", () => {
      let keys = [Key.namedKey(KeyName.ESC)];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("Keyboard layouts", () => {
    test("applies different keyboard layouts", () => {
      expect(keyHandler.keyboardLayout).toBe(
        BopomofoKeyboardLayout.StandardLayout
      ); // StandardLayout is 0
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.ETenLayout; // ETenLayout is 1
      expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.ETenLayout);

      // Test typing with ETen layout
      let keys = asciiKey(["n", "e", "3"]); // ETen layout keys for "你"
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你");
      expect(inputting.cursorIndex).toBe(1);

      keyHandler.keyboardLayout = BopomofoKeyboardLayout.ETen26Layout; // ETenLayout is 1
      expect(keyHandler.keyboardLayout).toBe(
        BopomofoKeyboardLayout.ETen26Layout
      );

      keys = asciiKey(["n", "e", "j"]); // ETen26 layout keys for "你"
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你你");
      expect(inputting.cursorIndex).toBe(2);

      keyHandler.keyboardLayout = BopomofoKeyboardLayout.HsuLayout;
      expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.HsuLayout);

      // Test typing with Hsu layout
      keys = asciiKey(["n", "e", "f"]); // Hsu layout keys for "你"
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你你你");
      expect(inputting.cursorIndex).toBe(3);

      keyHandler.keyboardLayout = BopomofoKeyboardLayout.IBMLayout;
      expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.IBMLayout);

      keys = asciiKey(["7", "a", ","]); // Hsu layout keys for "你"
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你你你你");
      expect(inputting.cursorIndex).toBe(4);
    });

    test("switching keyboard layout preserves punctuation mapping", () => {
      // First test with standard layout
      let keys = asciiKey([">"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。");

      // Now change to ETen layout and test the same punctuation
      keyHandler.reset();
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.ETenLayout;
      keys = asciiKey([">"]);
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。");

      keyHandler.reset();
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.ETen26Layout;
      keys = asciiKey(["."]);
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。");

      // Test another punctuation mark with different layout
      keyHandler.reset();
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.HsuLayout;
      keys = asciiKey([";"]);
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("；");

      // Test another punctuation mark with different layout
      keyHandler.reset();
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.IBMLayout;
      keys = asciiKey([">"]);
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。");
    });

    describe("Hanyu Pinyin", () => {
      test("types ni3 with Hanyu Pinyin layout", () => {
        expect(keyHandler.keyboardLayout).toBe(
          BopomofoKeyboardLayout.StandardLayout
        ); // StandardLayout is 0
        keyHandler.keyboardLayout = BopomofoKeyboardLayout.HanyuPinyinLayout; // ETenLayout is 1
        expect(keyHandler.keyboardLayout).toBe(
          BopomofoKeyboardLayout.HanyuPinyinLayout
        );

        // Test typing with ETen layout
        let keys = asciiKey(["n", "i", "3"]); // ETen layout keys for "你"
        let state = handleKeySequence(keyHandler, keys);
        expect(state).toBeInstanceOf(Inputting);
        let inputting = state as Inputting;
        expect(inputting.composingBuffer).toBe("你");
        expect(inputting.cursorIndex).toBe(1);
      });

      test("types yang2 with Hanyu Pinyin layout", () => {
        expect(keyHandler.keyboardLayout).toBe(
          BopomofoKeyboardLayout.StandardLayout
        ); // StandardLayout is 0
        keyHandler.keyboardLayout = BopomofoKeyboardLayout.HanyuPinyinLayout; // ETenLayout is 1
        expect(keyHandler.keyboardLayout).toBe(
          BopomofoKeyboardLayout.HanyuPinyinLayout
        );

        // Test typing with ETen layout
        let keys = asciiKey(["y", "a", "n", "g", "2"]);
        let state = handleKeySequence(keyHandler, keys);
        expect(state).toBeInstanceOf(Inputting);
        let inputting = state as Inputting;
        expect(inputting.composingBuffer).toBe("陽");
        expect(inputting.cursorIndex).toBe(1);
      });

      test("supports deletion within Hanyu Pinyin layout", () => {
        expect(keyHandler.keyboardLayout).toBe(
          BopomofoKeyboardLayout.StandardLayout
        ); // StandardLayout is 0
        keyHandler.keyboardLayout = BopomofoKeyboardLayout.HanyuPinyinLayout;
        expect(keyHandler.keyboardLayout).toBe(
          BopomofoKeyboardLayout.HanyuPinyinLayout
        );

        // Test typing with ETen layout
        let keys = asciiKey(["y", "a", "n", "g"]);
        let deleteKey = Key.namedKey(KeyName.BACKSPACE);
        keys.push(deleteKey);
        let state = handleKeySequence(keyHandler, keys);
        expect(state).toBeInstanceOf(Inputting);
        let inputting = state as Inputting;
        expect(inputting.composingBuffer).toBe("yan");
        expect(inputting.cursorIndex).toBe(3);
      });
    });
  });

  describe("Letters", () => {
    test("ignores uppercase letters by default", () => {
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.StandardLayout;
      let currentState: InputState = new Empty();
      let key = new Key("A", KeyName.UNKNOWN, true, false, false);
      let result = keyHandler.handle(
        key,
        currentState,
        (state) => (currentState = state),
        () => {}
      );
      expect(result).toBe(false);
      expect(currentState).toBeInstanceOf(Empty);
    });

    test("appends lowercase letters when feature enabled", () => {
      keyHandler.putLowercaseLettersToComposingBuffer = true;
      expect(keyHandler.putLowercaseLettersToComposingBuffer).toBe(true);
      let currentState: InputState = new Empty();
      let key = new Key("A", KeyName.UNKNOWN, true, false, false);
      let result = keyHandler.handle(
        key,
        currentState,
        (state) => (currentState = state),
        () => {}
      );
      expect(result).toBe(true);
      expect(currentState).toBeInstanceOf(Inputting);
      let inputting = currentState as Inputting;
      expect(inputting.composingBuffer).toBe("a");
    });
  });

  describe("Candidate selection", () => {
    test("selects candidate from displayed list", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = false;
      expect(keyHandler.selectPhraseAfterCursorAsCandidate).toBe(false);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let leftKey = Key.namedKey(KeyName.LEFT);
      let spaceKey = Key.namedKey(KeyName.SPACE);
      keys.push(leftKey);
      keys.push(spaceKey);
      let state = handleKeySequence(keyHandler, keys);
      let choosingCandidate = state as ChoosingCandidate;
      keyHandler.candidateSelected(
        choosingCandidate.candidates[4],
        1,
        (newState) => {
          state = newState;
        }
      );
      expect(state).toBeInstanceOf(Inputting);
      let buffer = (state as Inputting).composingBuffer;
      expect(buffer).toBe("擬好");
    });

    test("selects candidate and moves cursor when configured", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = true;
      expect(keyHandler.selectPhraseAfterCursorAsCandidate).toBe(true);
      keyHandler.moveCursorAfterSelection = true;
      expect(keyHandler.moveCursorAfterSelection).toBe(true);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let leftKey = Key.namedKey(KeyName.LEFT);
      let spaceKey = Key.namedKey(KeyName.SPACE);
      keys.push(leftKey);
      keys.push(leftKey);
      keys.push(spaceKey);
      let state = handleKeySequence(keyHandler, keys);
      let choosingCandidate = state as ChoosingCandidate;
      keyHandler.candidateSelected(
        choosingCandidate.candidates[0],
        1,
        (newState) => {
          state = newState;
        }
      );
      expect(state).toBeInstanceOf(Inputting);
      let buffer = (state as Inputting).composingBuffer;
      expect(buffer).toBe("你好");
      expect(keyHandler.cursor).toBe(2);
    });

    test("restores buffer after cancelling candidate panel", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = false;
      expect(keyHandler.selectPhraseAfterCursorAsCandidate).toBe(false);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let leftKey = Key.namedKey(KeyName.LEFT);
      let spaceKey = Key.namedKey(KeyName.SPACE);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(leftKey);
      keys.push(spaceKey);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      keyHandler.candidatePanelCancelled(1, (newState) => {
        state = newState;
      });
      expect(state).toBeInstanceOf(Inputting);
      let buffer = (state as Inputting).composingBuffer;
      expect(buffer).toBe("你好");
    });

    test("commits candidate while in traditional mode", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let choosingCandidate = state as ChoosingCandidate;
      const candidate = choosingCandidate.candidates[0];
      keyHandler.candidateSelected(candidate, 0, (newState) => {
        state = newState;
      });
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe("你");
    });

    test("keeps empty state for incomplete syllable in traditional mode", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let keys = asciiKey(["x", "u"]);
      keys.push(Key.namedKey(KeyName.SPACE));
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Committing);
    });
  });

  describe("ESC key behavior", () => {
    test("clears buffer when ESC clearing is enabled", () => {
      keyHandler.escKeyClearsEntireComposingBuffer = true;
      expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(true);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("retains composing buffer when ESC clearing is disabled", () => {
      keyHandler.escKeyClearsEntireComposingBuffer = false;
      expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(false);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3", "c", "8"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好");
    });

    test("leaves composed text intact when ESC clearing is disabled", () => {
      keyHandler.escKeyClearsEntireComposingBuffer = false;
      expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(false);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好");
    });

    test("clears buffer when ESC pressed during partial syllable", () => {
      keyHandler.escKeyClearsEntireComposingBuffer = false;
      expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(false);
      let keys = asciiKey(["s", "u"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("ignores ESC when buffer is already empty", () => {
      let keys = [];
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("Basic input handling", () => {
    test("ignores empty key events", () => {
      let stateCallbackCalled = false;
      let errorCallbackCalled = false;
      keyHandler.handle(
        new Key(),
        new Empty(),
        (state) => (stateCallbackCalled = true),
        () => (errorCallbackCalled = true)
      );
      expect(stateCallbackCalled).toBe(false);
      expect(errorCallbackCalled).toBe(false);
    });

    test("composes character for su3 input", () => {
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你");
      expect(inputting.cursorIndex).toBe(1);
    });

    test("opens candidate list for su3 in traditional mode", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
    });

    test("composes phrase for su3cl3 input", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好");
      expect(inputting.cursorIndex).toBe(2);
      expect(keyHandler.gridLength).toBe(2);
      expect(keyHandler.cursor).toBe(2);
    });

    test("clears state when typing invalid reading", () => {
      let keys = asciiKey(["r", "j", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("ignores trailing invalid reading", () => {
      let keys = asciiKey(["s", "u", "3", "r", "j", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你");
    });

    test("commits composing buffer on Enter", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe("你好");
      expect(keyHandler.gridLength).toBe(0);
      expect(keyHandler.cursor).toBe(0);
    });
  });

  describe("Shift + Space", () => {
    test("keeps empty state when pressing Shift+Space", () => {
      let shiftSpace = new Key(" ", KeyName.SPACE, true, false, false);
      let keys = [shiftSpace];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("commits space when Shift+Space in composing state", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let shiftSpace = new Key(" ", KeyName.SPACE, true, false, false);
      keys.push(shiftSpace);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe(" ");
    });

    test("appends space when Shift+Space with lowercase option", () => {
      keyHandler.putLowercaseLettersToComposingBuffer = true;
      expect(keyHandler.putLowercaseLettersToComposingBuffer).toBe(true);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let shiftSpace = new Key(" ", KeyName.SPACE, true, false, false);
      keys.push(shiftSpace);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好 ");
    });
  });

  describe("Punctuation handling", () => {
    test("appends full-width comma with shift modifier", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      keys.push(comma);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好，");
    });

    test("appends full-width comma with ctrl modifier", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let comma = new Key(",", KeyName.UNKNOWN, false, true, false);
      keys.push(comma);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好，");
    });

    test("appends full-width exclamation mark", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let comma = new Key("!", KeyName.UNKNOWN, true, false, false);
      keys.push(comma);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好！");
    });

    test("commits punctuation while in traditional mode", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let comma = new Key("!", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe("！");
    });

    test("cancels punctuation candidate in traditional mode", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      keyHandler.candidatePanelCancelled(0, (newState) => (state = newState));
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("keeps candidate panel open when reusing punctuation key", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      keyHandler.handlePunctuationKeyInCandidatePanelForTraditionalMode(
        comma,
        "，",
        (newState) => (state = newState),
        () => {}
      );
      expect(state).toBeInstanceOf(ChoosingCandidate);
    });

    test("commits punctuation from candidate panel in traditional mode", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      keyHandler.handlePunctuationKeyInCandidatePanelForTraditionalMode(
        new Key("A", KeyName.UNKNOWN, true, false, false),
        "，",
        (newState) => (state = newState),
        () => {}
      );
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe("，");
    });

    test("produces punctuation using Hanyu Pinyin layout", () => {
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.HanyuPinyinLayout;
      expect(keyHandler.keyboardLayout).toBe(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
      let comma = new Key(",", KeyName.UNKNOWN, false, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("，");
    });

    test("produces punctuation using Hsu layout", () => {
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.HsuLayout;
      expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.HsuLayout);
      let comma = new Key(",", KeyName.UNKNOWN, false, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("，");
    });

    test("produces half-width punctuation when enabled", () => {
      keyHandler.halfWidthPunctuation = true;
      expect(keyHandler.halfWidthPunctuation).toBe(true);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe(",");
    });

    test("returns to full-width punctuation when toggled off", () => {
      keyHandler.halfWidthPunctuation = true;
      expect(keyHandler.halfWidthPunctuation).toBe(true);
      let comma = new Key(",", KeyName.UNKNOWN, false, true, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("，");
    });
  });

  describe("Special keys", () => {
    test("opens punctuation candidate list with backtick", () => {
      let keys = asciiKey(["`"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let inputting = state as ChoosingCandidate;
      expect(inputting.composingBuffer).toBe("　");
    });

    test("cycles candidates backward with Shift+Tab", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = false;
      let keys = asciiKey(["s", "u", "3"]); // Type "你"
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // Use tab a few times to cycle forward
      let tab = Key.namedKey(KeyName.TAB);
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Now use Shift+Tab to cycle backwards
      let shiftTab = Key.namedKey(KeyName.TAB, true, false);
      keyHandler.handle(
        shiftTab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("妳");

      // One more Shift+Tab should go back to original
      keyHandler.handle(
        shiftTab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你");
    });

    test("cycles candidates backward with multi-character buffer", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]); // Type "你好"
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // Move cursor to first character
      let leftKey = Key.namedKey(KeyName.LEFT);
      keyHandler.handle(
        leftKey,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // First tab to change to another candidate
      let tab = Key.namedKey(KeyName.TAB);
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect((state as Inputting).composingBuffer).toBe("妳好");

      // Now Shift+Tab to go back
      let shiftTab = Key.namedKey(KeyName.TAB, true, false);
      keyHandler.handle(
        shiftTab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect(state).toBeInstanceOf(Inputting);
      expect((state as Inputting).composingBuffer).toBe("你好");
    });

    test("leaves state unchanged when no previous candidate", () => {
      let keys = asciiKey(["j", "7", "2"]); // Type a character with limited candidates
      let state = handleKeySequence(keyHandler, keys);

      // Shift+Tab should do nothing if there are no previous candidates
      let initialState = state;
      let shiftTab = Key.namedKey(KeyName.TAB, true, false);
      let errorCalled = false;
      keyHandler.handle(
        shiftTab,
        state,
        (newState) => {
          state = newState;
        },
        () => {
          errorCalled = true;
        }
      );

      // Expect either same state or error callback was called
      if (!errorCalled) {
        expect(state).toBe(initialState);
      } else {
        expect(errorCalled).toBe(true);
      }
    });

    test("ignores Shift+Tab after clearing reading buffer", () => {
      let keys = asciiKey(["s", "u", "3"]); // Type "你"
      let state = handleKeySequence(keyHandler, keys);

      // Delete the reading buffer
      let backspace = Key.namedKey(KeyName.BACKSPACE);
      keyHandler.handle(
        backspace,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Now try Shift+Tab
      let shiftTab = Key.namedKey(KeyName.TAB, true, false);
      keyHandler.handle(
        shiftTab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Should still be in the same state type
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("handles Shift+Tab during long composition", () => {
      // Type a longer sequence
      let keys = asciiKey([
        "s",
        "u",
        "3",
        "c",
        "l",
        "3",
        "w",
        "4",
        "m",
        "3",
        "s",
        "4",
      ]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // Move cursor to middle
      let leftKey = Key.namedKey(KeyName.LEFT);
      keyHandler.handle(
        leftKey,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      keyHandler.handle(
        leftKey,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Use tab to change a candidate
      let tab = Key.namedKey(KeyName.TAB);
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Now use Shift+Tab to go back
      let shiftTab = Key.namedKey(KeyName.TAB, true, false);
      keyHandler.handle(
        shiftTab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Verify we're still in Inputting state
      expect(state).toBeInstanceOf(Inputting);
    });

    test("cycles candidate with Tab key", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let enter = Key.namedKey(KeyName.TAB);
      keys.push(enter);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("妳好");
    });

    test("ignores Tab when no composition exists", () => {
      let keys = [];
      let tab = Key.namedKey(KeyName.TAB);
      keys.push(tab);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("continues composing when Tab pressed mid-syllable", () => {
      let keys = asciiKey(["s", "u"]);
      let tab = Key.namedKey(KeyName.TAB);
      keys.push(tab);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
    });
  });

  describe("State transitions", () => {
    test("enters marking state with shift selection", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let shiftLeft = Key.namedKey(KeyName.LEFT, true, false);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Marking);
      let marking = state as Marking;
      expect(marking.composingBuffer).toBe("你好");
      expect(marking.cursorIndex).toBe(0);
      expect(marking.head).toBe("");
      expect(marking.markedText).toBe("你好");
      expect(marking.tail).toBe("");
      const right = Key.namedKey(KeyName.RIGHT, true, false);
      keys = [right, right];

      for (let key of keys) {
        keyHandler.handle(
          key,
          state,
          (newState) => (state = newState),
          () => {}
        );
      }
      expect(state).toBeInstanceOf(Inputting);
    });

    test("limits marking selection size", () => {
      let keys = asciiKey([
        "s",
        "u",
        "3",
        "c",
        "l",
        "3",
        "s",
        "u",
        "3",
        "c",
        "l",
        "3",
        "s",
        "u",
        "3",
        "c",
        "l",
        "3",
        "s",
        "u",
        "3",
        "c",
        "l",
        "3",
        "s",
        "u",
        "3",
        "c",
        "l",
        "3",
      ]);
      let shiftLeft = Key.namedKey(KeyName.LEFT, true, false);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      keys.push(shiftLeft);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Marking);
      let marking = state as Marking;
      expect(marking.composingBuffer).toBe("你好你好你好你好你好");
      expect(marking.cursorIndex).toBe(0);
      expect(marking.acceptable).toBe(false);
    });
  });

  describe("Big5 input", () => {
    test("commits Big5 character after entering full code", () => {
      let currentState: InputState = new Big5();
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["a", "1", "4", "3"]);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("。");
      }
    });

    test("updates Big5 code when deleting digits", () => {
      let currentState: InputState = new Big5();
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["a", "1", "4"]);
      let deleteKey = Key.namedKey(KeyName.DELETE);
      keys.push(deleteKey);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Big5);
      let big5 = currentState as Big5;
      expect(big5.code).toBe("a1");
    });

    test("preserves Big5 state after delete", () => {
      let currentState: InputState = new Big5();
      let keys = asciiKey(["a", "1", "4"]);
      let deleteKey = Key.namedKey(KeyName.DELETE);
      keys.push(deleteKey);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Big5);
      let big5 = currentState as Big5;
      expect(big5.code).toBe("a1");
    });

    test("clears Big5 state with ESC", () => {
      let currentState: InputState = new Big5();

      let keys = asciiKey(["a", "1", "4"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Empty);
    });
  });

  describe("Chinese number conversion", () => {
    test("converts lowercase Chinese number on Enter", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Lowercase
      );
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["1", "2", "3", "5"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("一千二百三十五");
      }
    });

    test("converts decimal lowercase Chinese number", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Lowercase
      );
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["8", "0", "0", "5", "3", ".", "4"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("八萬〇五十三點四");
      }
    });

    test("converts uppercase Chinese number on Enter", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Uppercase
      );
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["0", "0", "5", "3", ".", "4", "0"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("伍拾參點肆");
      }
    });
    describe("Roman number conversion", () => {
      test("produces lowercase full-width Roman numeral", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.FullWidthLower
        );
        let commit: Committing | undefined = undefined;
        let keys = asciiKey(["1", "2", "3"]);
        let enter = Key.namedKey(KeyName.RETURN);
        keys.push(enter);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              if (state instanceof Committing) {
                commit = state;
              }
              currentState = state;
            },
            () => {}
          );
        }
        if (commit === undefined) {
          fail("Committing state not found");
        } else {
          expect((commit as Committing).text).toBe("ⅽⅹⅹⅲ");
        }
      });

      test("produces uppercase ASCII Roman numeral", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let commit: Committing | undefined = undefined;
        let keys = asciiKey(["4", "4"]);
        let enter = Key.namedKey(KeyName.RETURN);
        keys.push(enter);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              if (state instanceof Committing) {
                commit = state;
              }
              currentState = state;
            },
            () => {}
          );
        }
        if (commit === undefined) {
          fail("Committing state not found");
        } else {
          expect((commit as Committing).text).toBe("XLIV");
        }
      });

      test("produces full-width Roman numeral for ninety-nine", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.FullWidthLower
        );
        let commit: Committing | undefined = undefined;
        let keys = asciiKey(["9", "9"]);
        let enter = Key.namedKey(KeyName.RETURN);
        keys.push(enter);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              if (state instanceof Committing) {
                commit = state;
              }
              currentState = state;
            },
            () => {}
          );
        }
        if (commit === undefined) {
          fail("Committing state not found");
        } else {
          expect((commit as Committing).text).toBe("ⅹⅽⅸ");
        }
      });

      test("removes last digit with backspace in Roman mode", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let keys = asciiKey(["1", "2", "3"]);
        let deleteKey = Key.namedKey(KeyName.BACKSPACE);
        keys.push(deleteKey);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              currentState = state;
            },
            () => {}
          );
        }
        expect(currentState).toBeInstanceOf(RomanNumber);
        let romanNumber = currentState as RomanNumber;
        expect(romanNumber.number).toBe("12");
      });

      test("removes last digit with delete in Roman mode", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let keys = asciiKey(["5", "0"]);
        let deleteKey = Key.namedKey(KeyName.DELETE);
        keys.push(deleteKey);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              currentState = state;
            },
            () => {}
          );
        }
        expect(currentState).toBeInstanceOf(RomanNumber);
        let romanNumber = currentState as RomanNumber;
        expect(romanNumber.number).toBe("5");
      });

      test("exits Roman mode with ESC", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let keys = asciiKey(["2", "5", "0"]);
        let esc = Key.namedKey(KeyName.ESC);
        keys.push(esc);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              currentState = state;
            },
            () => {}
          );
        }
        expect(currentState).toBeInstanceOf(Empty);
      });

      test("commits single-digit Roman numeral", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.FullWidthLower
        );
        let commit: Committing | undefined = undefined;
        let keys = asciiKey(["5"]);
        let enter = Key.namedKey(KeyName.RETURN);
        keys.push(enter);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              if (state instanceof Committing) {
                commit = state;
              }
              currentState = state;
            },
            () => {}
          );
        }
        if (commit === undefined) {
          fail("Committing state not found");
        } else {
          expect((commit as Committing).text).toBe("ⅴ");
        }
      });

      test("retains zero input in Roman mode", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let keys = asciiKey(["0"]);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              currentState = state;
            },
            () => {}
          );
        }
        expect(currentState).toBeInstanceOf(RomanNumber);
        let romanNumber = currentState as RomanNumber;
        expect(romanNumber.number).toBe("0");
      });

      test("handles large Arabic numbers in Roman mode", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let commit: Committing | undefined = undefined;
        let keys = asciiKey(["2", "0", "2", "4"]);
        let enter = Key.namedKey(KeyName.RETURN);
        keys.push(enter);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              if (state instanceof Committing) {
                commit = state;
              }
              currentState = state;
            },
            () => {}
          );
        }
        expect(commit).toBeDefined();
        expect(commit).toBeInstanceOf(Committing);
      });

      test("commits uppercase Roman numeral", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let commit: Committing | undefined = undefined;
        let keys = asciiKey(["1", "0"]);
        let enter = Key.namedKey(KeyName.RETURN);
        keys.push(enter);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              if (state instanceof Committing) {
                commit = state;
              }
              currentState = state;
            },
            () => {}
          );
        }
        if (commit === undefined) {
          fail("Committing state not found");
        } else {
          expect((commit as Committing).text).toBe("X");
        }
      });

      test("supports multiple backspaces in Roman mode", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let keys = asciiKey(["1", "5", "0"]);
        let backspace = Key.namedKey(KeyName.BACKSPACE);
        keys.push(backspace);
        keys.push(backspace);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              currentState = state;
            },
            () => {}
          );
        }
        expect(currentState).toBeInstanceOf(RomanNumber);
        let romanNumber = currentState as RomanNumber;
        expect(romanNumber.number).toBe("1");
      });

      test("clears Roman buffer with repeated deletes", () => {
        let currentState: InputState = new RomanNumber(
          "",
          RomanNumberStateStyle.Alphabets
        );
        let keys = asciiKey(["2", "5"]);
        let deleteKey = Key.namedKey(KeyName.DELETE);
        keys.push(deleteKey);
        keys.push(deleteKey);
        keys.push(deleteKey);
        for (let key of keys) {
          keyHandler.handle(
            key,
            currentState,
            (state) => {
              currentState = state;
            },
            () => {}
          );
        }
        expect(currentState).toBeInstanceOf(RomanNumber);
        let romanNumber = currentState as RomanNumber;
        expect(romanNumber.number).toBe("");
      });
    });
    test("converts Suzhou numerals on Enter", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Suzhou
      );
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["1", "2", "3", "4"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("〡二〣〤\n千單位");
      }
    });

    test("clears Suzhou numeral with delete", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Suzhou
      );
      // let commit: Committing | undefined = undefined;
      let keys = asciiKey(["1"]);
      let deleteKey = Key.namedKey(KeyName.DELETE);
      keys.push(deleteKey);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(ChineseNumber);
      let chineseNumber = currentState as ChineseNumber;
      expect(chineseNumber.number).toBe("");
    });

    test("ignores extra deletes in Suzhou mode", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Suzhou
      );
      // let commit: Committing | undefined = undefined;
      let keys = asciiKey(["1"]);
      let deleteKey = Key.namedKey(KeyName.DELETE);
      keys.push(deleteKey);
      keys.push(deleteKey);
      keys.push(deleteKey);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(ChineseNumber);
      let chineseNumber = currentState as ChineseNumber;
      expect(chineseNumber.number).toBe("");
    });

    test("exits Suzhou mode with ESC", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Suzhou
      );
      let keys = asciiKey(["1"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Empty);
    });
  });

  describe("Enclosing numbers", () => {
    test("shows enclosing number candidates on Enter", () => {
      let currentState: InputState = new EnclosingNumber();
      let keys = asciiKey(["1"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(ChoosingCandidate);
    });

    test("rejects out-of-range enclosing numbers", () => {
      let currentState: InputState = new EnclosingNumber();
      let keys = asciiKey(["3", "0"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Empty);
    });

    test("retains enclosing number after delete", () => {
      let currentState: InputState = new EnclosingNumber();
      let keys = asciiKey(["3", "0"]);
      let deleteKey = Key.namedKey(KeyName.DELETE);
      keys.push(deleteKey);
      keys.push(deleteKey);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(EnclosingNumber);
    });

    test("cancels enclosing number mode with ESC", () => {
      let currentState: InputState = new EnclosingNumber();
      let keys = asciiKey(["3", "0"]);
      const escapeKey = Key.namedKey(KeyName.ESC);
      keys.push(escapeKey);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Empty);
    });
  });

  describe("Feature selection", () => {
    test("enters feature selection with Ctrl+\\", () => {
      let tab = new Key("\\", KeyName.UNKNOWN, false, true, false);
      let keys = [tab];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(SelectingFeature);
    });
  });

  describe("Ctrl + Enter", () => {
    test("outputs bopomofo syllables when option 1", () => {
      keyHandler.ctrlEnterOption = 1;
      expect(keyHandler.ctrlEnterOption).toBe(1);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      keys.push(new Key("", KeyName.RETURN, false, true, false));
      let currentState: InputState = new Empty();
      let commit: Committing | undefined = undefined;

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("ㄋㄧˇ-ㄏㄠˇ");
      }
    });

    test("outputs ruby markup when option 2", () => {
      keyHandler.ctrlEnterOption = 2;
      expect(keyHandler.ctrlEnterOption).toBe(2);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      keys.push(new Key("", KeyName.RETURN, false, true, false));
      let currentState: InputState = new Empty();
      let commit: Committing | undefined = undefined;

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe(
          "<ruby>你好<rp>(</rp><rt>ㄋㄧˇ ㄏㄠˇ</rt><rp>)</rp></ruby>"
        );
      }
    });

    test("outputs Braille conversion when option 3", () => {
      keyHandler.ctrlEnterOption = 3;
      expect(keyHandler.ctrlEnterOption).toBe(3);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      keys.push(new Key("", KeyName.RETURN, false, true, false));
      let currentState: InputState = new Empty();
      let commit: Committing | undefined = undefined;

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("⠝⠡⠈⠗⠩⠈");
      }
    });

    test("outputs ASCII pinyin when option 4", () => {
      keyHandler.ctrlEnterOption = 4;
      expect(keyHandler.ctrlEnterOption).toBe(4);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      keys.push(new Key("", KeyName.RETURN, false, true, false));
      let currentState: InputState = new Empty();
      let commit: Committing | undefined = undefined;

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      if (commit === undefined) {
        fail("Committing state not found");
      } else {
        expect((commit as Committing).text).toBe("ni hao");
      }
    });
  });

  describe("Tab key handling in Inputting state", () => {
    test("keeps empty state when pressing Tab with no composition", () => {
      let tab = Key.namedKey(KeyName.TAB);
      let keys = [tab];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("inserts reading when Tab pressed mid syllable", () => {
      let keys = asciiKey(["s", "u"]);
      let tab = Key.namedKey(KeyName.TAB);
      keys.push(tab);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("ㄋㄧ");
    });

    test("cycles forward through candidates with Tab", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = false;
      let keys = asciiKey(["s", "u", "3"]); // Type "你"
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // First tab should change to the next candidate
      let tab = Key.namedKey(KeyName.TAB);
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("妳");

      // Second tab should change to another candidate
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("擬");
    });

    test("cycles backward through candidates with Shift+Tab", () => {
      keyHandler.selectPhraseAfterCursorAsCandidate = false;
      let keys = asciiKey(["s", "u", "3"]); // Type "你"
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // Use tab multiple times to get to a known position
      let tab = Key.namedKey(KeyName.TAB);
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Now use shift+tab to go back
      let shiftTab = Key.namedKey(KeyName.TAB, true, false);
      keyHandler.handle(
        shiftTab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("妳");
    });

    test("cycles candidate at current cursor position", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]); // Type "你好"
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // Move cursor to first character
      let leftKey = Key.namedKey(KeyName.LEFT);
      keyHandler.handle(
        leftKey,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Tab should cycle the candidate at cursor position
      let tab = Key.namedKey(KeyName.TAB);
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("妳好");
    });

    test("cycles candidate at end of composing buffer", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]); // Type "你好"
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      let tab = Key.namedKey(KeyName.TAB);
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("妳好");
    });

    test("ignores Tab when no additional candidates", () => {
      let keys = asciiKey(["j", "7", "2"]); // Type a character with limited candidates
      let state = handleKeySequence(keyHandler, keys);

      // Tab should do nothing if there are no more candidates
      let initialState = state;
      let tab = Key.namedKey(KeyName.TAB);
      let errorCalled = false;
      keyHandler.handle(
        tab,
        state,
        (newState) => {
          state = newState;
        },
        () => {
          errorCalled = true;
        }
      );

      // Expect that either we're still in the same state or error callback was called
      if (!errorCalled) {
        expect(state).toBe(initialState);
      } else {
        expect(errorCalled).toBe(true);
      }
    });
  });

  describe("Repeated punctuation to select candidate", () => {
    test("cycles punctuation candidates when feature enabled", () => {
      keyHandler.repeatedPunctuationToSelectCandidateEnabled = true;
      expect(keyHandler.repeatedPunctuationToSelectCandidateEnabled).toBe(true);

      // Type > once to get "。"
      let keys = asciiKey([">"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。");

      // Type > again to get "．"
      let secondPunctuation = Key.asciiKey(">");
      keyHandler.handle(
        secondPunctuation,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("．");
    });

    test("appends identical punctuation when feature disabled", () => {
      keyHandler.repeatedPunctuationToSelectCandidateEnabled = false;
      expect(keyHandler.repeatedPunctuationToSelectCandidateEnabled).toBe(
        false
      );

      // Type > once to get "。"
      let keys = asciiKey([">"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。");

      // Type > again should just add another "。"
      let secondPunctuation = Key.asciiKey(">");
      keyHandler.handle(
        secondPunctuation,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。。");
    });

    test("cycles punctuation candidates for different symbols", () => {
      keyHandler.repeatedPunctuationToSelectCandidateEnabled = true;
      expect(keyHandler.repeatedPunctuationToSelectCandidateEnabled).toBe(true);

      // Type < once to get "，"
      let keys = asciiKey(["<"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("，");

      // Type < again to cycle to the next candidate
      let secondPunctuation = Key.asciiKey("<");
      keyHandler.handle(
        secondPunctuation,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      // The exact character might depend on the model, but it should be different
      expect(inputting.composingBuffer).not.toBe("，");
    });

    test("cycles through multiple punctuation candidates", () => {
      keyHandler.repeatedPunctuationToSelectCandidateEnabled = true;

      // Type > once to get "。"
      let keys = asciiKey([">"]);
      let state = handleKeySequence(keyHandler, keys);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("。");

      // Type > multiple times to cycle through candidates
      let secondPunctuation = Key.asciiKey(">");
      keyHandler.handle(
        secondPunctuation,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect((state as Inputting).composingBuffer).toBe("．");

      // Another press should cycle to the next candidate or back to the first
      keyHandler.handle(
        secondPunctuation,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Either we get a new candidate or we cycle back to the first
      const thirdPunctuationResult = (state as Inputting).composingBuffer;
      expect(
        thirdPunctuationResult === "。" || thirdPunctuationResult !== "．"
      ).toBeTruthy();
    });

    test("supports different punctuation after repeated selection", () => {
      keyHandler.repeatedPunctuationToSelectCandidateEnabled = true;

      // Type > once to get "。"
      let keys = asciiKey([">"]);
      let state = handleKeySequence(keyHandler, keys);

      // Type > again to get "．"
      let secondPunctuation = Key.asciiKey(">");
      keyHandler.handle(
        secondPunctuation,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );
      expect((state as Inputting).composingBuffer).toBe("．");

      // Now type a different punctuation
      const differentPunctuation = Key.asciiKey("<");
      keyHandler.handle(
        differentPunctuation,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("．，");
    });
  });

  describe("Ctrl + \\ feature selection", () => {
    test("enters SelectingFeature state with Ctrl+\\", () => {
      const ctrlBackslash = new Key("\\", KeyName.UNKNOWN, false, true, false);
      let state = handleKeySequence(keyHandler, [ctrlBackslash]);
      expect(state).toBeInstanceOf(SelectingFeature);
    });
  });

  describe("Big5 state handling", () => {
    test("commits Big5 code with valid hexadecimal input", () => {
      let currentState: InputState = new Big5();
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["a", "4", "e", "1"]);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      expect(commit).toBeDefined();
      expect(commit).toBeInstanceOf(Committing);
    });

    test("ignores invalid hexadecimal Big5 input", () => {
      let currentState: InputState = new Big5();
      let keys = asciiKey(["g", "h", "i", "j"]);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Big5);
      let big5 = currentState as Big5;
      expect(big5.code).toBe("");
    });

    test("keeps Big5 mode when code entry incomplete", () => {
      let currentState: InputState = new Big5();
      let keys = asciiKey(["a", "4"]);
      let enter = Key.namedKey(KeyName.RETURN);
      keys.push(enter);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }
      expect(currentState).toBeInstanceOf(Big5);
    });

    test("commits Big5 code when input complete", () => {
      let currentState: InputState = new Big5();
      let commit: Committing | undefined = undefined;
      let keys = asciiKey(["b", "9", "4", "3"]);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      expect(commit).toBeDefined();
    });

    test("returns to empty after multiple Big5 backspaces", () => {
      let currentState: InputState = new Big5();
      let keys = asciiKey(["c", "1", "2", "3"]);
      let backspace = Key.namedKey(KeyName.BACKSPACE);
      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      // Press backspace multiple times
      for (let i = 0; i < 5; i++) {
        keyHandler.handle(
          backspace,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      expect(currentState).toBeInstanceOf(Empty);
    });

    test("cancels Big5 mode with ESC", () => {
      let currentState: InputState = new Big5();
      let keys = asciiKey(["f", "f", "1", "2"]);
      let esc = Key.namedKey(KeyName.ESC);

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      keyHandler.handle(
        esc,
        currentState,
        (state) => {
          currentState = state;
        },
        () => {}
      );

      expect(currentState).toBeInstanceOf(Empty);
    });

    test("ignores uppercase hexadecimal letters in Big5 mode", () => {
      let currentState: InputState = new Big5();
      let commit: Committing | undefined = undefined;

      // Test with uppercase hex digits
      let keys = [
        new Key("A", KeyName.UNKNOWN, true, false, false),
        new Key("B", KeyName.UNKNOWN, true, false, false),
        new Key("C", KeyName.UNKNOWN, true, false, false),
        new Key("D", KeyName.UNKNOWN, true, false, false),
      ];

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }
      expect(commit).toBeUndefined();
    });
  });

  describe("Space and Tab handling in Empty state", () => {
    test("keeps empty state when pressing Space", () => {
      let spaceKey = Key.namedKey(KeyName.SPACE);
      let state = handleKeySequence(keyHandler, [spaceKey]);
      expect(state).toBeInstanceOf(Empty);
    });

    test("keeps empty state when pressing Tab", () => {
      const tabKey = Key.namedKey(KeyName.TAB);
      let state = handleKeySequence(keyHandler, [tabKey]);
      expect(state).toBeInstanceOf(Empty);
    });

    test("keeps empty state when pressing Shift+Space", () => {
      let shiftSpace = new Key(" ", KeyName.SPACE, true, false, false);
      let state = handleKeySequence(keyHandler, [shiftSpace]);
      expect(state).toBeInstanceOf(Empty);
    });

    test("keeps empty state when pressing Shift+Tab", () => {
      let shiftTab = Key.namedKey(KeyName.TAB, true, false);
      let state = handleKeySequence(keyHandler, [shiftTab]);
      expect(state).toBeInstanceOf(Empty);
    });

    test("keeps empty state when pressing Ctrl+Space", () => {
      const ctrlSpace = new Key(" ", KeyName.SPACE, false, true, false);
      let state = handleKeySequence(keyHandler, [ctrlSpace]);
      expect(state).toBeInstanceOf(Empty);
    });

    test("keeps empty state when pressing Alt+Space", () => {
      const altSpace = new Key(" ", KeyName.SPACE, false, false, true);
      let state = handleKeySequence(keyHandler, [altSpace]);
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("Numpad handling", () => {
    test("appends numerals with numpad in Chinese number mode", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Lowercase
      );

      // Simulate numpad keys 1, 2, 3
      let keys = [
        new Key("1", KeyName.UNKNOWN, false, false, true),
        new Key("2", KeyName.UNKNOWN, false, false, true),
        new Key("3", KeyName.UNKNOWN, false, false, true),
      ];

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      expect(currentState).toBeInstanceOf(ChineseNumber);
      let chineseNumber = currentState as ChineseNumber;
      expect(chineseNumber.number).toBe("123");
    });

    test("accepts numpad decimal point in Chinese number mode", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Lowercase
      );

      let keys = [
        new Key("1", KeyName.UNKNOWN, false, false, true),
        new Key(".", KeyName.UNKNOWN, false, false, true), // Numpad decimal point
        new Key("5", KeyName.UNKNOWN, false, false, true),
      ];

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      expect(currentState).toBeInstanceOf(ChineseNumber);
      let chineseNumber = currentState as ChineseNumber;
      expect(chineseNumber.number).toBe("1.5");
    });

    test("commits Chinese number with numpad Enter", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Lowercase
      );
      let commit: Committing | undefined = undefined;

      let keys = [
        new Key("4", KeyName.UNKNOWN, false, false, true),
        new Key("2", KeyName.UNKNOWN, false, false, true),
        new Key("", KeyName.RETURN, false, false, true), // Numpad Enter
      ];

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            if (state instanceof Committing) {
              commit = state;
            }
            currentState = state;
          },
          () => {}
        );
      }

      expect(commit).toBeDefined();
      expect(commit).toBeInstanceOf(Committing);
    });

    test("ignores numpad digit in empty state", () => {
      let currentState: InputState = new Empty();

      const numpad7 = new Key("7", KeyName.UNKNOWN, false, false, true);
      keyHandler.handle(
        numpad7,
        currentState,
        (state) => {
          currentState = state;
        },
        () => {}
      );

      // Should remain in empty state
      expect(currentState).toBeInstanceOf(Empty);
    });

    test("appends digits to Big5 code using numpad", () => {
      let currentState: InputState = new Big5();

      let keys = [
        new Key("a", KeyName.UNKNOWN, false, false, false), // Normal key for "a"
        new Key("1", KeyName.UNKNOWN, false, false, true), // Numpad 1
        new Key("2", KeyName.UNKNOWN, false, false, true), // Numpad 2
      ];

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      expect(currentState).toBeInstanceOf(Big5);
      let big5 = currentState as Big5;
      expect(big5.code).toBe("a12");
    });

    test("appends digits to EnclosingNumber using numpad", () => {
      let currentState: InputState = new EnclosingNumber();

      let keys = [
        new Key("2", KeyName.UNKNOWN, false, false, true), // Numpad 2
        new Key("0", KeyName.UNKNOWN, false, false, true), // Numpad 0
      ];

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      expect(currentState).toBeInstanceOf(EnclosingNumber);
      const enclosingNumber = currentState as EnclosingNumber;
      expect(enclosingNumber.number).toBe("20");
    });

    test("opens enclosing candidates with numpad Enter", () => {
      let currentState: InputState = new EnclosingNumber();

      let keys = [
        new Key("1", KeyName.UNKNOWN, false, false, true), // Numpad 1
        new Key("", KeyName.RETURN, false, false, true), // Numpad Enter
      ];

      for (let key of keys) {
        keyHandler.handle(
          key,
          currentState,
          (state) => {
            currentState = state;
          },
          () => {}
        );
      }

      // Should transition to ChoosingCandidate state with enclosing number options
      expect(currentState).toBeInstanceOf(ChoosingCandidate);
    });

    test("commits composition when numpad digit pressed", () => {
      // Reset keyHandler
      keyHandler.reset();

      // First type a regular character
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // Then add a numpad key
      const numpad5 = new Key("5", KeyName.UNKNOWN, false, false, true);
      keyHandler.handle(
        numpad5,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Check that numpad 5 was treated like regular 5
      expect(state).toBeInstanceOf(Committing);
    });

    test("commits composition after numpad operators", () => {
      // Reset keyHandler
      keyHandler.reset();

      // First type a regular character
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);

      // Then add numpad operators
      const numpadPlus = new Key("+", KeyName.UNKNOWN, false, false, true);
      keyHandler.handle(
        numpadPlus,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      const numpadMinus = new Key("-", KeyName.UNKNOWN, false, false, true);
      keyHandler.handle(
        numpadMinus,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Check that operators were handled
      expect(state).toBeInstanceOf(Committing);
    });

    test("commits composition with numpad Enter", () => {
      // First type regular characters
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);

      // Press numpad Enter
      const numpadEnter = new Key("", KeyName.RETURN, false, false, true);
      keyHandler.handle(
        numpadEnter,
        state,
        (newState) => {
          state = newState;
        },
        () => {}
      );

      // Should commit the text
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe("你好");
    });
  });
});
