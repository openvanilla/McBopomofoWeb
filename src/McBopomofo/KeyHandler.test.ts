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
  ChineseNumberStyle,
  ChoosingCandidate,
  Committing,
  Empty,
  EmptyIgnoringPrevious,
  EnclosingNumber,
  InputState,
  Inputting,
  Marking,
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

describe("Test KeyHandler.test", () => {
  let keyHandler: KeyHandler = new KeyHandler(new WebLanguageModel(webData));
  beforeEach(() => {
    let lm = new WebLanguageModel(webData);
    keyHandler = new KeyHandler(lm);
  });

  afterEach(() => {});

  describe("Basic configuration", () => {
    test("Language code property management", () => {
      expect(keyHandler.languageCode).toBe("");
      keyHandler.languageCode = "zh-TW";
      expect(keyHandler.languageCode).toBe("zh-TW");
      keyHandler.languageCode = "en";
      expect(keyHandler.languageCode).toBe("en");
    });

    test("Selecting phrase after cursor as candidate (enabled)", () => {
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

    test("Selecting phrase after cursor as candidate (disabled)", () => {
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
    test("Enter", () => {
      let keys = [Key.namedKey(KeyName.RETURN)];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("Tab", () => {
      let keys = [Key.namedKey(KeyName.TAB)];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("Esc", () => {
      let keys = [Key.namedKey(KeyName.ESC)];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("Keyboard layouts", () => {
    test("Keyboard layout changes", () => {
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

      keyHandler.keyboardLayout = BopomofoKeyboardLayout.HsuLayout; // HsuLayout is 2
      expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.HsuLayout);

      // Test typing with Hsu layout
      keys = asciiKey(["n", "e", "f"]); // Hsu layout keys for "你"
      state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你你");
      expect(inputting.cursorIndex).toBe(2);
    });

    describe("Hanyu Pinyin", () => {
      test("Hanyu Pinyin 1", () => {
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

      test("Hanyu Pinyin 2", () => {
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

      test("Hanyu Pinyin 3", () => {
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
    test("Normal letter", () => {
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

    test("Test putLowercaseLettersToComposingBuffer", () => {
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
    test("Choosing candidate from list", () => {
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

    test("Choosing candidate from list with moveCursorAfterSelection", () => {
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

    test("Cancelling candidate selection", () => {
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

    test("Traditional Mode #1", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let choosingCandidate = state as ChoosingCandidate;
      let candidate = choosingCandidate.candidates[0];
      keyHandler.candidateSelected(candidate, 0, (newState) => {
        state = newState;
      });
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe("你");
    });

    test("Traditional Mode #2", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let keys = asciiKey(["x", "u"]);
      keys.push(Key.namedKey(KeyName.SPACE));
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("ESC key behavior", () => {
    test("Esc key clears entire buffer", () => {
      keyHandler.escKeyClearsEntireComposingBuffer = true;
      expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(true);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("ESC Key scenario #1", () => {
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

    test("ESC Key scenario #2", () => {
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

    test("ESC Key scenario #3", () => {
      keyHandler.escKeyClearsEntireComposingBuffer = false;
      expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(false);
      let keys = asciiKey(["s", "u"]);
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("ESC Key scenario #4", () => {
      let keys = [];
      let esc = Key.namedKey(KeyName.ESC);
      keys.push(esc);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });
  });

  describe("Basic input handling", () => {
    test("Handling empty key input", () => {
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

    test("Typing su3 leads to '你'", () => {
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你");
      expect(inputting.cursorIndex).toBe(1);
    });

    test("Typing su3 leads to '你' in Traditional mode", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let keys = asciiKey(["s", "u", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
    });

    test("Typing su3cl3 leads to '你好'", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好");
      expect(inputting.cursorIndex).toBe(2);
      expect(keyHandler.gridLength).toBe(2);
      expect(keyHandler.cursor).toBe(2);
    });

    test("Discard invalid input #1", () => {
      let keys = asciiKey(["r", "j", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("Discard invalid input #2", () => {
      let keys = asciiKey(["s", "u", "3", "r", "j", "3"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你");
    });

    test("Commit input upon pressing Enter", () => {
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
    test("Test Shift + Space #1", () => {
      let shiftSpace = new Key(" ", KeyName.SPACE, true, false, false);
      let keys = [shiftSpace];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("Test Shift + Space #2", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let shiftSpace = new Key(" ", KeyName.SPACE, true, false, false);
      keys.push(shiftSpace);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe(" ");
    });

    test("Test Shift + Space #3", () => {
      keyHandler.putLowercaseLettersToComposingBuffer = true;
      expect(keyHandler.putLowercaseLettersToComposingBuffer).toBe(true);
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let shiftSpace = new Key(" ", KeyName.SPACE, true, false, false);
      keys.push(shiftSpace);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      console.log(inputting);
      expect(inputting.composingBuffer).toBe("你好 ");
    });
  });

  describe("Punctuation handling", () => {
    test("Typing punctuation #1", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      keys.push(comma);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好，");
    });

    test("Typing punctuation #2", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let comma = new Key(",", KeyName.UNKNOWN, false, true, false);
      keys.push(comma);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好，");
    });

    test("Typing punctuation #3", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let comma = new Key("!", KeyName.UNKNOWN, true, false, false);
      keys.push(comma);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("你好！");
    });

    test("Typing punctuation in Traditional Mode #1", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let comma = new Key("!", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Committing);
      let committing = state as Committing;
      expect(committing.text).toBe("！");
    });

    test("Typing punctuation in Traditional Mode #2", () => {
      keyHandler.traditionalMode = true;
      expect(keyHandler.traditionalMode).toBe(true);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      keyHandler.candidatePanelCancelled(0, (newState) => (state = newState));
      expect(state).toBeInstanceOf(EmptyIgnoringPrevious);
    });

    test("Typing punctuation in Traditional Mode #3", () => {
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

    test("Typing punctuation in Traditional Mode #4", () => {
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

    test("Typing punctuation with Hanyu Pinyin", () => {
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

    test("Typing punctuation with Hsu", () => {
      keyHandler.keyboardLayout = BopomofoKeyboardLayout.HsuLayout;
      expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.HsuLayout);
      let comma = new Key(",", KeyName.UNKNOWN, false, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("，");
    });

    test("Typing punctuation with Half-width #1", () => {
      keyHandler.halfWidthPunctuation = true;
      expect(keyHandler.halfWidthPunctuation).toBe(true);
      let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
      let keys = [comma];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe(",");
    });

    test("Typing punctuation with Half-width #2", () => {
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
    test("Typing backtick triggers candidate list", () => {
      let keys = asciiKey(["`"]);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(ChoosingCandidate);
      let inputting = state as ChoosingCandidate;
      expect(inputting.composingBuffer).toBe("　");
    });

    test("Tab key #1", () => {
      let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
      let enter = Key.namedKey(KeyName.TAB);
      keys.push(enter);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
      let inputting = state as Inputting;
      expect(inputting.composingBuffer).toBe("妳好");
    });

    test("Tab key #2", () => {
      let keys = [];
      let tab = Key.namedKey(KeyName.TAB);
      keys.push(tab);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Empty);
    });

    test("Tab key #3", () => {
      let keys = asciiKey(["s", "u"]);
      let tab = Key.namedKey(KeyName.TAB);
      keys.push(tab);
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(Inputting);
    });
  });

  describe("State transitions", () => {
    test("Marking state transition #1", () => {
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
      let right = Key.namedKey(KeyName.RIGHT, true, false);
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

    test("Marking state transition #2", () => {
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
    test("Big5 code input #1", () => {
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

    test("Big5 code input #2", () => {
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

    test("Big5 code input #2", () => {
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

    test("Big5 code input #3", () => {
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
    test("Chinese number conversion #1", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumberStyle.Lowercase
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

    test("Chinese number conversion #2", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumberStyle.Lowercase
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

    test("Chinese number conversion #3", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumberStyle.Uppercase
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

    test("Chinese number conversion #4", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumberStyle.Suzhou
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

    test("Chinese number conversion #4", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumberStyle.Suzhou
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

    test("Chinese number conversion #5", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumberStyle.Suzhou
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

    test("Chinese number conversion #6", () => {
      let currentState: InputState = new ChineseNumber(
        "",
        ChineseNumberStyle.Suzhou
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
    test("Enclosing number #1", () => {
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

    test("Enclosing number #2", () => {
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

    test("Enclosing number #2", () => {
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

    test("Enclosing number #2", () => {
      let currentState: InputState = new EnclosingNumber();
      let keys = asciiKey(["3", "0"]);
      let escapeKey = Key.namedKey(KeyName.ESC);
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
    test("Test features", () => {
      let tab = new Key("\\", KeyName.UNKNOWN, false, true, false);
      let keys = [tab];
      let state = handleKeySequence(keyHandler, keys);
      expect(state).toBeInstanceOf(SelectingFeature);
    });
  });

  describe("Ctrl + Enter", () => {
    test("Typing Option 1", () => {
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

    test("Typing Option 2", () => {
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

    test("Typing Option 3", () => {
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

    test("Typing Option 4", () => {
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
});
