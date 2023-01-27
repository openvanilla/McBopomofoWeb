/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { KeyHandler } from "./KeyHandler";
import { WebLanguageModel } from "./WebLanguageModel";
import { webData } from "./WebData";
import { Empty, InputState, Inputting } from "./InputState";
import { Key } from "./Key";

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
  });
});
