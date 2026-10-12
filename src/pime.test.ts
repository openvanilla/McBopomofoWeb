import { VK_Keys } from "./pime_keys";
jest.mock("fs", () => ({
  existsSync: jest.fn(() => true),
  readFile: jest.fn(),
  watch: jest.fn(),
  writeFile: jest.fn()
}));
jest.mock("child_process", () => ({
  exec: jest.fn()
}));
describe("PIME mixed composition", () => {
  let service: any;
  let consoleLogSpy: jest.SpyInstance;
  let registrations: jest.SpyInstance[];
  let seq = 0;
  let capsLock = false;
  let controller: any;
  const request = (
    method: string,
    keyCode: number,
    char = "",
    shift = false,
    ctrl = false,
    alt = false
  ) => {
    const keyStates = new Array(256).fill(0);
    keyStates[VK_Keys.VK_SHIFT] = shift ? 128 : 0;
    keyStates[VK_Keys.VK_CONTROL] = ctrl ? 128 : 0;
    keyStates[VK_Keys.VK_MENU] = alt ? 128 : 0;
    keyStates[VK_Keys.VK_CAPITAL] = capsLock ? 1 : 0;
    return service.response({
      method,
      keyCode,
      charCode: char.charCodeAt(0) || 0,
      keyStates,
      seqNum: ++seq
    }, {});
  };
  const press = (
    code: number,
    char = "",
    shift = false,
    ctrl = false,
    alt = false
  ) => {
    const filtered = request("filterKeyDown", code, char, shift, ctrl, alt);
    const result = filtered.return
      ? request("onKeyDown", code, char, shift, ctrl, alt)
      : filtered;
    request("filterKeyUp", code);
    return result;
  };
  const type = (s: string) => {
    for (const c of s) {
      press(c.toUpperCase().charCodeAt(0), c);
    }
  };
  const toggle = () => {
    request("filterKeyDown", VK_Keys.VK_SHIFT, "", true);
    return request("filterKeyUp", VK_Keys.VK_SHIFT);
  };
  const configure = (settings: object) => {
    const config = (require("fs").readFile as jest.Mock).mock.calls.find(
      (c: any[]) => String(c[0]).endsWith("config.json")
    );
    config[1](
      null,
      Buffer.from(
        JSON.stringify({
          letter_mode: "upper",
          beep_on_error: false,
          ...settings,
        })
      )
    );
  };
  beforeEach(() => {
    jest.resetModules();
    capsLock = false;
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { InputController } = require("./McBopomofo/InputController");
    const setOnPhraseChange = InputController.prototype.setOnPhraseChange;
    registrations = [
      jest.spyOn(InputController.prototype, "setOnPhraseChange"),
      jest.spyOn(InputController.prototype, "setOnExcludedPhraseChange"),
    ];
    registrations[0].mockImplementation(function (this: any, callback: any) {
      controller = this;
      setOnPhraseChange.call(this, callback);
    });
    service = require("./pime");
    configure({});
  });
  afterEach(() => {
    registrations.forEach((spy) => spy.mockRestore());
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });
  test("preserves composition, inserts literal ASCII, switches back and commits in order", () => {
    type("5j/ ");
    const switched = toggle();
    expect(switched.compositionString).toBe("中");
    expect(switched.commitString).toBe("");
    type("az19");
    press(65, "A", true);
    press(32, " ");
    press(192, String.fromCharCode(96));
    press(189, "-");
    expect(toggle().compositionString).toBe("中az19A " + String.fromCharCode(96) + "-");
    type("5j/ ");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe(
      "中az19A " + String.fromCharCode(96) + "-中"
    );
  });
  test("empty alphabet passes keys through and release toggles only once", () => {
    toggle();
    request("filterKeyUp", VK_Keys.VK_SHIFT);
    expect(press(65, "a").return).toBe(false);
    toggle();
    type("5j/ ");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中");
  });
  test("unfinished reading does not switch", () => {
    type("5");
    toggle();
    type("j/ ");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中");
  });
  test("candidate and marking states do not switch", () => {
    type("5j/ ");
    press(VK_Keys.VK_DOWN);
    expect(toggle().addButton).toBeUndefined();
    press(VK_Keys.VK_ESCAPE);
    expect(press(65, "a").compositionString).toContain("ㄇ");
    press(VK_Keys.VK_ESCAPE);
    press(VK_Keys.VK_RETURN);
    type("5j/ 5j/ ");
    press(VK_Keys.VK_LEFT, "", true);
    toggle();
    press(VK_Keys.VK_ESCAPE);
    expect(press(65, "a").compositionString).toContain("ㄇ");
  });
  test("disabled toggle retains existing behavior", () => {
    configure({
      shift_key_toggle_alphabet_mode: false
    });
    type("5j/ ");
    toggle();
    expect(press(65, "a").compositionString).toContain("ㄇ");
  });
  test("Shift chords cancel toggle and preserve Chinese letter/space handling", () => {
    type("5j/ ");
    request("filterKeyDown", 16, "", true);
    expect(press(65, "A", true).commitString).toBe("中A");
    request("filterKeyUp", 16);
    type("5j/ ");
    expect(press(32, " ", true).commitString).toBe(" ");
    expect(press(65, "a").compositionString).toContain("ㄇ");
  });
  test("edits literals at cursor and preserves Esc behavior", () => {
    type("5j/ ");
    toggle();
    type("ab");
    press(VK_Keys.VK_LEFT);
    press(88, "x");
    expect(press(VK_Keys.VK_DELETE).compositionString).toBe("中ax");
    expect(press(VK_Keys.VK_BACK).compositionString).toBe("中a");
    expect(press(VK_Keys.VK_ESCAPE).compositionString).toBe("中a");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中a");
  });
  test.each(["G", "H"])("preserves Ctrl+Shift+%s", char => {
    request("filterKeyDown", 16, "", true);
    expect(press(char.charCodeAt(0), char, true, true).return).toBe(true);
    request("filterKeyUp", 16);
    type("5j/ ");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中");
  });
  test("non-character chords and unrelated key releases never toggle mode", () => {
    type("5j/ ");
    request("filterKeyDown", 16, "", true);
    press(VK_Keys.VK_F1, "", true);
    request("filterKeyUp", 16);
    expect(press(65, "a").compositionString).toContain("ㄇ");
  });
  test("left and right Shift work as single keys", () => {
    type("5j/ ");
    request("filterKeyDown", VK_Keys.VK_LSHIFT, "", true);
    expect(request("filterKeyUp", VK_Keys.VK_LSHIFT).compositionString).toBe("中");
    expect(press(65, "a").compositionString).toBe("中a");
    request("filterKeyDown", VK_Keys.VK_RSHIFT, "", true);
    request("filterKeyUp", VK_Keys.VK_RSHIFT);
    expect(press(65, "a").compositionString).toContain("ㄇ");
  });
  test("preserves preedit after a modifier key that does not refresh the UI", () => {
    type("5j/ ");
    toggle();
    expect(press(VK_Keys.VK_MENU, "", false, false, true).return).toBe(false);
    expect(toggle().compositionString).toBe("中");
    expect(press(65, "a").compositionString).toContain("ㄇ");
  });
  test("Chinese input resumes at the saved cursor and empty English input passes through", () => {
    type("5j/ ");
    toggle();
    type("ab");
    press(VK_Keys.VK_LEFT);
    toggle();
    type("5j/ ");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中a中b");
    type("5j/ ");
    toggle();
    press(VK_Keys.VK_BACK);
    expect(press(65, "a").return).toBe(false);
  });
  test("configured Esc clears mixed composition without committing", () => {
    configure({
      esc_key_clear_entire_buffer: true
    });
    type("5j/ ");
    toggle();
    type("ab");
    const cleared = press(VK_Keys.VK_ESCAPE);
    expect(cleared.compositionString).toBe("");
    expect(cleared.commitString).toBe("");
    expect(press(65, "a").return).toBe(false);
  });
  test("mixed marking displays literal digits and never writes user phrase files", () => {
    type("5j/ ");
    toggle();
    type("23");
    press(VK_Keys.VK_LEFT, "", true);
    const selected = press(VK_Keys.VK_LEFT, "", true);
    expect(selected.showMessage.message).not.toContain("_literal_");
    expect(selected.showMessage.message).toContain("23");
    const entered = press(VK_Keys.VK_RETURN);
    expect(entered.showMessage.message).toContain("含英數字的範圍無法加入詞庫");
    expect(require("fs").writeFile).not.toHaveBeenCalled();
    expect(entered.commitString).toBe("");
  });
  test.each([0, 1])("PIME phrase writer %s filters reserved readings at the filesystem boundary", (index) => {
    const map = new Map([
      ["_literal_50", ["2"]],
      ["ㄓㄨㄥ-_literal_51", ["中3"]],
      ["ㄓㄨㄥ", ["中"]],
    ]);
    registrations[index].mock.calls[0][0](map);
    const writes = require("fs").writeFile.mock.calls;
    expect(writes).toHaveLength(1);
    expect(writes[0][1]).toBe("中 ㄓㄨㄥ\n");
    expect(writes[0][0]).toContain(index === 0 ? "data.txt" : "exclude-phrases.txt");
  });
  test.each(["b", "2", " "])("English Marking resumes literal input for %s", (character) => {
    type("5j/ ");
    toggle();
    type("a");
    press(VK_Keys.VK_LEFT, "", true);
    expect(controller.state.constructor.name).toBe("Marking");
    const result = press(character.toUpperCase().charCodeAt(0), character);
    const expected = "中" + character + "a";
    expect(result.compositionString).toBe(expected);
    expect(controller.state.constructor.name).toBe("Inputting");
    expect(controller.canHandleMixedInput).toBe(true);
    expect(toggle().compositionString).toBe(expected);
    expect(press(VK_Keys.VK_RETURN).commitString).toBe(expected);
  });
  test.each(["b", " "])("English candidate cancellation resumes literal input for %s", (character) => {
    type("5j/ ");
    toggle();
    type("a");
    press(VK_Keys.VK_DOWN);
    expect(controller.state.constructor.name).toBe("ChoosingCandidate");
    const result = press(character.toUpperCase().charCodeAt(0), character);
    expect(result.compositionString).toBe("中a" + character);
    expect(result.showCandidates).toBe(false);
    expect(controller.canHandleMixedInput).toBe(true);
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中a" + character);
  });
  test("English candidate selection keys retain their original action", () => {
    type("5j/ ");
    toggle();
    const candidates = press(VK_Keys.VK_DOWN).candidateList;
    const chosen = press(50, "2");
    expect(chosen.compositionString).toBe(candidates[1]);
    expect(chosen.showCandidates).toBe(false);
  });
  const openFeatures = () => {
    type("5j/ ");
    toggle();
    const menu = press(220, String.fromCharCode(92), false, true);
    expect(menu.return).toBe(true);
    expect(menu.commitString).toBe("中");
    expect(controller.state.constructor.name).toBe("SelectingFeature");
    return menu;
  };
  const chooseFeature = (name: string) => {
    const menu = openFeatures();
    const index = menu.candidateList.findIndex((label: string) =>
      label.includes(name)
    );
    expect(index).toBeGreaterThanOrEqual(0);
    return press(49 + index, String(index + 1));
  };
  test("English feature menu handles Escape", () => {
    openFeatures();
    expect(press(VK_Keys.VK_ESCAPE).return).toBe(true);
    expect(press(65, "a").return).toBe(false);
  });
  test("English feature menu handles arrows and Enter", () => {
    openFeatures();
    const moved = press(VK_Keys.VK_DOWN);
    expect(moved.return).toBe(true);
    expect(moved.showCandidates).toBe(true);
    const selected = press(VK_Keys.VK_RETURN);
    expect(selected.return).toBe(true);
    expect(selected.showCandidates).toBe(true);
    expect(controller.hasActiveInputState).toBe(true);
    expect(press(VK_Keys.VK_ESCAPE).return).toBe(true);
  });
  test("English number feature accepts digits and Enter", () => {
    chooseFeature("數字");
    expect(controller.state.constructor.name).toBe("NumberInput");
    expect(press(49, "1").return).toBe(true);
    expect(press(50, "2").return).toBe(true);
    expect(controller.state.number).toBe("12");
    expect(press(VK_Keys.VK_RETURN).commitString).toBeTruthy();
    expect(press(65, "a").return).toBe(false);
  });
  test("English number feature can be cancelled", () => {
    chooseFeature("數字");
    press(49, "1");
    expect(press(VK_Keys.VK_ESCAPE).return).toBe(true);
    expect(press(65, "a").return).toBe(false);
  });
  test("English Big5 feature accepts a code and cancellation", () => {
    chooseFeature("Big5");
    type("a4");
    expect(controller.state.code).toBe("a4");
    expect(press(VK_Keys.VK_ESCAPE).return).toBe(true);
    expect(press(65, "a").return).toBe(false);
  });
  test("English Iroha feature handles input and candidate selection", () => {
    chooseFeature("伊呂波");
    type("ka");
    expect(controller.state.code).toBe("ka");
    expect(press(VK_Keys.VK_SPACE).return).toBe(true);
    expect(controller.state.constructor.name).toBe("IrohaCandidate");
    expect(press(VK_Keys.VK_RETURN).commitString).toBeTruthy();
    expect(press(65, "a").return).toBe(false);
  });
  test("English Iroha feature can be cancelled", () => {
    chooseFeature("伊呂波");
    expect(press(VK_Keys.VK_ESCAPE).return).toBe(true);
    expect(press(65, "a").return).toBe(false);
  });
  test("English date feature handles navigation and cancellation", () => {
    chooseFeature("日期");
    expect(controller.state.constructor.name).toBe("SelectingDateMacro");
    expect(press(VK_Keys.VK_DOWN).return).toBe(true);
    expect(press(VK_Keys.VK_ESCAPE).return).toBe(true);
    expect(press(65, "a").return).toBe(false);
  });
  test("Directly prepared English punctuation candidates cancel before literal input", () => {
    type("5j/ ");
    toggle();
    const { Key } = require("./McBopomofo/Key");
    controller.mcbopomofoKeyEvent(Key.asciiKey(String.fromCharCode(96)));
    expect(controller.state.constructor.name).toBe("ChoosingPunctuationList");
    expect(press(66, "b").compositionString).toBe("中b");
    expect(controller.canHandleMixedInput).toBe(true);
  });
  test("Directly prepared English punctuation cancellation inserts literals when the grid becomes empty", () => {
    type("5j/ ");
    toggle();
    controller.reset();
    const { Key } = require("./McBopomofo/Key");
    controller.mcbopomofoKeyEvent(Key.asciiKey(String.fromCharCode(96)));
    expect(controller.state.constructor.name).toBe("ChoosingPunctuationList");
    expect(press(66, "b").compositionString).toBe("b");
    expect(controller.canHandleMixedInput).toBe(true);
  });
  test("Directly prepared English custom menus remain interactive", () => {
    type("5j/ jp6");
    toggle();
    press(VK_Keys.VK_DOWN);
    const { Key } = require("./McBopomofo/Key");
    controller.mcbopomofoKeyEvent(Key.asciiKey("+"));
    expect(controller.state.constructor.name).toBe("CustomMenu");
    expect(press(VK_Keys.VK_ESCAPE).return).toBe(true);
    expect(controller.state.constructor.name).toBe("ChoosingCandidate");
    expect(press(VK_Keys.VK_RETURN).return).toBe(true);
    expect(controller.state.constructor.name).toBe("Inputting");
  });
  test("English Caps Lock resumes literal input after candidate cancellation", () => {
    type("5j/ ");
    toggle();
    press(VK_Keys.VK_DOWN);
    capsLock = true;
    expect(press(66, "B").compositionString).toBe("中B");
    expect(controller.canHandleMixedInput).toBe(true);
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中B");
  });
  test("English Caps Lock preserves mixed composition and uses Caps Lock XOR Shift", () => {
    type("5j/ ");
    toggle();
    type("ip");
    capsLock = true;
    expect(press(65, "A").compositionString).toBe("中ipA");
    expect(press(66, "b", true).compositionString).toBe("中ipAb");
    capsLock = false;
    expect(press(67, "c").compositionString).toBe("中ipAbc");
    expect(press(68, "D", true).compositionString).toBe("中ipAbcD");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中ipAbcD");
  });
  test("English Caps Lock resumes literal input after Marking", () => {
    type("5j/ ");
    toggle();
    type("ip");
    press(VK_Keys.VK_LEFT, "", true);
    capsLock = true;
    expect(press(65, "A").compositionString).toBe("中iAp");
    expect(controller.canHandleMixedInput).toBe(true);
  });
  test("Chinese Caps Lock keeps upstream reset and pass-through behavior", () => {
    type("5j/ ");
    capsLock = true;
    expect(request("filterKeyDown", 65, "A").return).toBe(false);
    const keyDown = request("onKeyDown", 65, "A");
    expect(keyDown.return).toBe(false);
    expect(keyDown.commitString).toBeUndefined();
    expect(controller.state.constructor.name).toBe("Empty");
    capsLock = false;
    request("filterKeyUp", 65);
    expect(press(49, "1").compositionString).toBe("ㄅ");
  });
  test.each([false, true])("Empty keycap on the last page keeps the candidate window in alphabet mode %s", (alphabetMode) => {
    type("5j/ ");
    if (alphabetMode) {
      toggle();
    }
    press(VK_Keys.VK_DOWN);
    const candidates = controller.candidateController_;
    let page: any;
    while (candidates.currentPageIndex < candidates.totalPageCount - 1) {
      page = press(VK_Keys.VK_NEXT);
    }
    expect(page.candidateList.length).toBeLessThan(9);
    const emptyKey = String(page.candidateList.length + 1);
    const result = press(emptyKey.charCodeAt(0), emptyKey);
    expect(result.return).toBe(true);
    expect(result.compositionString).toBe("中");
    expect(result.showCandidates).toBe(true);
    expect(result.candidateList).toEqual(page.candidateList);
    expect(controller.state.constructor.name).toBe("ChoosingCandidate");
  });
  test.each([false, true])("Empty keycap 2 keeps a directly prepared single-candidate window in alphabet mode %s", (alphabetMode) => {
    type("5j/ ");
    if (alphabetMode) toggle();
    const { Key } = require("./McBopomofo/Key");
    // Prepare the same literal node directly to compare both mode flags.
    controller.mcbopomofoKeyEvent(Key.asciiKey("a"), true);
    expect(press(VK_Keys.VK_DOWN).candidateList).toEqual(["a"]);
    const result = press(50, "2");
    expect(result.compositionString).toBe("中a");
    expect(result.showCandidates).toBe(true);
    expect(controller.state.constructor.name).toBe("ChoosingCandidate");
  });
  test("Shift after English commit resumes Chinese without composition termination", () => {
    type("5j/ ");
    toggle();
    type("abc");
    expect(request("filterKeyDown", VK_Keys.VK_RETURN).return).toBe(true);
    expect(request("onKeyDown", VK_Keys.VK_RETURN).commitString).toBe("中abc");
    expect(controller.state.constructor.name).toBe("Committing");
    // Deliberately omit onCompositionTerminated and Enter's key-up event.
    expect(toggle().addButton).toBeDefined();
    expect(controller.state.constructor.name).toBe("Empty");
    type("5j/ ");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中");
  });
  test("Shift key-up normalizes a directly prepared Committing state", () => {
    type("5j/ ");
    toggle();
    type("abc");
    request("filterKeyDown", VK_Keys.VK_SHIFT, "", true);
    const { Key, KeyName } = require("./McBopomofo/Key");
    // Prepare the transition directly to isolate filterKeyUp normalization.
    controller.mcbopomofoKeyEvent(Key.namedKey(KeyName.RETURN));
    expect(controller.state.constructor.name).toBe("Committing");
    expect(request("filterKeyUp", VK_Keys.VK_SHIFT).addButton).toBeDefined();
    type("5j/ ");
    expect(press(VK_Keys.VK_RETURN).commitString).toBe("中");
  });
  test("Enter key-up after a commit is still consumed in Chinese and alphabet mode", () => {
    type("5j/ ");
    expect(request("filterKeyDown", VK_Keys.VK_RETURN).return).toBe(true);
    expect(request("onKeyDown", VK_Keys.VK_RETURN).commitString).toBe("中");
    expect(request("filterKeyUp", VK_Keys.VK_RETURN).return).toBe(true);
    expect(controller.state.constructor.name).toBe("Empty");

    type("5j/ ");
    toggle();
    type("abc");
    expect(request("filterKeyDown", VK_Keys.VK_RETURN).return).toBe(true);
    expect(request("onKeyDown", VK_Keys.VK_RETURN).commitString).toBe("中abc");
    expect(request("filterKeyUp", VK_Keys.VK_RETURN).return).toBe(true);
    expect(controller.state.constructor.name).toBe("Empty");
  });

});
