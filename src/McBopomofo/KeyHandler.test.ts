import { KeyHandler } from "./KeyHandler";
import { WebLanguageModel } from "./WebLanguageModel";
import { webData } from "./WebData";
import { Empty } from "./InputState";
import { Key } from "./Key";

function asciiKey(input: string[]): Key[] {
  let keys: Key[] = [];
  for (let s of input) {
    let key = Key.asciiKey(s);
    keys.push(key);
  }
  return keys;
}

function handleKeySequence(keyHandler: KeyHandler, keys: Key[]) {
  console.log(keys);
  let currentState = new Empty();
  for (let key of keys) {
    keyHandler.handle(
      key,
      currentState,
      (state) => {
        console.log(state);
        currentState = state;
      },
      () => {}
    );
  }
  console.log(currentState);
}

describe("Test KeyHandler.test", () => {
  let keyHandler: KeyHandler;
  beforeEach(() => {
    let lm = new WebLanguageModel(webData);
    keyHandler = new KeyHandler(lm);
  });

  afterEach(() => {});

  test("Test empty key", () => {
    let empty = new Empty();
    let key = new Key();
    let stateCallbackCalled = false;
    let errorCallbackCalled = false;
    keyHandler.handle(
      key,
      empty,
      (state) => (stateCallbackCalled = true),
      () => (errorCallbackCalled = true)
    );
    expect(stateCallbackCalled).toBe(true);
    expect(errorCallbackCalled).toBe(false);
  });

  test("Test su3cl3", () => {
    let keys = asciiKey(["s", "u", "3", "c", "l", "3"]);
    handleKeySequence(keyHandler, keys);
  });
});
