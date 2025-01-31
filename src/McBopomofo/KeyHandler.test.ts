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
  ChoosingCandidate,
  Committing,
  Empty,
  EmptyIgnoringPrevious,
  InputState,
  Inputting,
  Marking,
} from "./InputState";
import { Key, KeyName } from "./Key";
import exp from "constants";
import { BopomofoKeyboardLayout } from "../Mandarin";
import { cp } from "fs";

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
      (state) => {
        currentState = state;
      },
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

  test("Test languageCode", () => {
    expect(keyHandler.languageCode).toBe("");
    keyHandler.languageCode = "zh-TW";
    expect(keyHandler.languageCode).toBe("zh-TW");
    keyHandler.languageCode = "en";
    expect(keyHandler.languageCode).toBe("en");
  });

  test("Test selectPhraseAfterCursorAsCandidate", () => {
    keyHandler.selectPhraseAfterCursorAsCandidate = true;
    expect(keyHandler.selectPhraseAfterCursorAsCandidate).toBe(true);
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let leftKey = Key.namedKey(KeyName.LEFT);
    let spaceKey = Key.namedKey(KeyName.SPACE);
    keys.push(leftKey);
    keys.push(spaceKey);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof ChoosingCandidate).toBe(true);
    let choosingCandidate = state as ChoosingCandidate;
    expect(choosingCandidate.candidates[2].value).toBe("好");
  });

  test("Test selectPhraseAfterCursorAsCandidate", () => {
    keyHandler.selectPhraseAfterCursorAsCandidate = false;
    expect(keyHandler.selectPhraseAfterCursorAsCandidate).toBe(false);
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let leftKey = Key.namedKey(KeyName.LEFT);
    let spaceKey = Key.namedKey(KeyName.SPACE);
    keys.push(leftKey);
    keys.push(spaceKey);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof ChoosingCandidate).toBe(true);
    let choosingCandidate = state as ChoosingCandidate;
    expect(choosingCandidate.candidates[2].value).toBe("你");
  });

  test("Test escKeyClearsEntireComposingBuffer", () => {
    keyHandler.escKeyClearsEntireComposingBuffer = true;
    expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(true);
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let esc = Key.namedKey(KeyName.ESC);
    keys.push(esc);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof EmptyIgnoringPrevious).toBe(true);
  });

  test("Test ESC Key 1", () => {
    keyHandler.escKeyClearsEntireComposingBuffer = false;
    expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(false);
    let keys = asciiKey(["s", "u", "3", "c", "l", "3", "c", "8"]);
    let esc = Key.namedKey(KeyName.ESC);
    keys.push(esc);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你好");
  });

  test("Test ESC Key 2", () => {
    keyHandler.escKeyClearsEntireComposingBuffer = false;
    expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(false);
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let esc = Key.namedKey(KeyName.ESC);
    keys.push(esc);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你好");
  });

  test("Test ESC Key 3", () => {
    keyHandler.escKeyClearsEntireComposingBuffer = false;
    expect(keyHandler.escKeyClearsEntireComposingBuffer).toBe(false);
    let keys = asciiKey(["s", "u"]);
    let esc = Key.namedKey(KeyName.ESC);
    keys.push(esc);
    let state = handleKeySequence(keyHandler, keys);
    console.log(state);
    expect(state instanceof EmptyIgnoringPrevious).toBe(true);
  });

  test("Test ESC key 4", () => {
    let keys = [];
    let esc = Key.namedKey(KeyName.ESC);
    keys.push(esc);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Empty).toBe(true);
  });

  test("Test keyboardLayout", () => {
    expect(keyHandler.keyboardLayout).toBe(
      BopomofoKeyboardLayout.StandardLayout
    ); // StandardLayout is 0
    keyHandler.keyboardLayout = BopomofoKeyboardLayout.ETenLayout; // ETenLayout is 1
    expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.ETenLayout);

    // Test typing with ETen layout
    let keys = asciiKey(["n", "e", "3"]); // ETen layout keys for "你"
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你");
    expect(inputting.cursorIndex).toBe(1);

    keyHandler.keyboardLayout = BopomofoKeyboardLayout.HsuLayout; // HsuLayout is 2
    expect(keyHandler.keyboardLayout).toBe(BopomofoKeyboardLayout.HsuLayout);

    // Test typing with Hsu layout
    keys = asciiKey(["n", "e", "f"]); // Hsu layout keys for "你"
    state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你你");
    expect(inputting.cursorIndex).toBe(2);
  });

  test("Test empty key", () => {
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

  test("Test su3", () => {
    let keys = asciiKey(["s", "u", "3"]);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你");
    expect(inputting.cursorIndex).toBe(1);
  });

  test("Test su3cl3", () => {
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你好");
    expect(inputting.cursorIndex).toBe(2);
    expect(keyHandler.gridLength).toBe(2);
    expect(keyHandler.cursor).toBe(2);
  });

  test("Test invalid input 1", () => {
    let keys = asciiKey(["r", "j", "3"]);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof EmptyIgnoringPrevious).toBe(true);
  });

  test("Test invalid input 1", () => {
    let keys = asciiKey(["s", "u", "3", "r", "j", "3"]);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你");
  });

  test("Test commit", () => {
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let enter = Key.namedKey(KeyName.RETURN);
    keys.push(enter);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Committing).toBe(true);
    let committing = state as Committing;
    expect(committing.text).toBe("你好");
    expect(keyHandler.gridLength).toBe(0);
    expect(keyHandler.cursor).toBe(0);
  });

  test("Test Punctuation 1", () => {
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let comma = new Key("<", KeyName.UNKNOWN, true, false, false);
    keys.push(comma);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你好，");
  });

  test("Test Punctuation 2", () => {
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let comma = new Key(",", KeyName.UNKNOWN, false, true, false);
    keys.push(comma);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("你好，");
  });

  test("Test Punctuation 2", () => {
    let keys = asciiKey(["`"]);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof ChoosingCandidate).toBe(true);
    let inputting = state as ChoosingCandidate;
    expect(inputting.composingBuffer).toBe("　");
  });

  test("Test Tab 1", () => {
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let enter = Key.namedKey(KeyName.TAB);
    keys.push(enter);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
    let inputting = state as Inputting;
    expect(inputting.composingBuffer).toBe("妳好");
  });

  test("Test Tab 2", () => {
    let keys = [];
    let tab = Key.namedKey(KeyName.TAB);
    keys.push(tab);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Empty).toBe(true);
  });

  test("Test Tab 2", () => {
    let keys = asciiKey(["s", "u"]);
    let tab = Key.namedKey(KeyName.TAB);
    keys.push(tab);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Inputting).toBe(true);
  });

  test("Test marking", () => {
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    let left = Key.namedKey(KeyName.LEFT, true, false);
    keys.push(left);
    keys.push(left);
    let state = handleKeySequence(keyHandler, keys);
    expect(state instanceof Marking).toBe(true);
    let marking = state as Marking;
    expect(marking.composingBuffer).toBe("你好");
    expect(marking.cursorIndex).toBe(0);
    expect(marking.head).toBe("");
    expect(marking.markedText).toBe("你好");
    expect(marking.tail).toBe("");
  });

  test("Test Big5", () => {
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
    console.log(currentState);
    if (commit === undefined) {
      fail("Committing state not found");
    } else {
      expect((commit as Committing).text).toBe("。");
    }
  });
});
