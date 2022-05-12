import { KeyHandler } from "./KeyHandler";
import { WebLanguageModel } from "./WebLanguageModel";
import { webData } from "./WebData";
import { Empty } from "./InputState";
import { Key } from "./Key";

// test("", () => {});

describe("Test KeyHandler.test", () => {
  let keyHandler: KeyHandler;
  beforeEach(() => {
    let lm = new WebLanguageModel(webData);
    keyHandler = new KeyHandler(lm);
  });

  afterEach(() => {});

  test("", () => {
    let empty = new Empty();
    let key = Key.asciiKey("a");
    keyHandler.handle(
      key,
      empty,
      (state) => {
        console.log(state);
      },
      () => {}
    );
  });
});
