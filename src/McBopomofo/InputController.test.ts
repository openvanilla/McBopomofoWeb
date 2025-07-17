import { InputController } from "./InputController";
import { Inputting } from "./InputState";
import { Key, KeyName } from "./Key";

function inputCStr(controller: InputController, str: string) {
  for (let i = 0; i < str.length; i++) {
    inputChar(controller, str[i]);
  }
}

function inputChar(controller: InputController, char: string) {
  let key = Key.asciiKey(char, false, false);
  if (char === " ") {
    key = new Key(" ", KeyName.SPACE, false, false);
  }
  controller.mcbopomofoKeyEvent(key);
}

describe("Test Input Controller", () => {
  it("should show correct candidate", () => {
    let lastState = "";
    let ui = {
      reset: () => {},
      commitString: (text: string) => {},
      update: (state: string) => {
        lastState = state;
      },
    };
    let controller = new InputController(ui);
    inputCStr(controller, "5j/ jp6");

    let state = controller.state;
    expect(state).toBeInstanceOf(Inputting);
    const space = new Key(" ", KeyName.SPACE, false, false);
    controller.mcbopomofoKeyEvent(space);
    controller.mcbopomofoKeyEvent(space);
    controller.mcbopomofoKeyEvent(space);
    state = controller.state;
    let psrsed = JSON.parse(lastState);
    let candidates = psrsed.candidates;
    expect(candidates.length).toBe(9);
  });
});
