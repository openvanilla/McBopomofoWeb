type InputControllerMock = {
  reset: jest.Mock;
  setLanguageCode: jest.Mock;
  setOnOpenUrl: jest.Mock;
  setOnError: jest.Mock;
  setUserVerticalCandidates: jest.Mock;
  setTraditionalMode: jest.Mock;
  setChineseConversionEnabled: jest.Mock;
  setKeyboardLayout: jest.Mock;
  setSelectPhrase: jest.Mock;
  setCandidateKeys: jest.Mock;
  setEscClearEntireBuffer: jest.Mock;
  setMoveCursorAfterSelection: jest.Mock;
  setLetterMode: jest.Mock;
  setCtrlEnterOption: jest.Mock;
  setHalfWidthPunctuationEnabled: jest.Mock;
  setCandidateKeysCount: jest.Mock;
  setMovingCursorOption: jest.Mock;
  setRepeatedPunctuationChooseCandidate: jest.Mock;
  setBopomofoFontAnnotationSupportEnabled: jest.Mock;
  setAllowChangingPriorTone: jest.Mock;
  setUserPhrases: jest.Mock;
  setExcludedPhrases: jest.Mock;
  setOnPhraseChange: jest.Mock;
  setOnExcludedPhraseChange: jest.Mock;
  deferredReset: jest.Mock;
  mcbopomofoKeyEvent: jest.Mock;
};

const createInputControllerMock = (): InputControllerMock => ({
  reset: jest.fn(),
  setLanguageCode: jest.fn(),
  setOnOpenUrl: jest.fn(),
  setOnError: jest.fn(),
  setUserVerticalCandidates: jest.fn(),
  setTraditionalMode: jest.fn(),
  setChineseConversionEnabled: jest.fn(),
  setKeyboardLayout: jest.fn(),
  setSelectPhrase: jest.fn(),
  setCandidateKeys: jest.fn(),
  setEscClearEntireBuffer: jest.fn(),
  setMoveCursorAfterSelection: jest.fn(),
  setLetterMode: jest.fn(),
  setCtrlEnterOption: jest.fn(),
  setHalfWidthPunctuationEnabled: jest.fn(),
  setCandidateKeysCount: jest.fn(),
  setMovingCursorOption: jest.fn(),
  setRepeatedPunctuationChooseCandidate: jest.fn(),
  setBopomofoFontAnnotationSupportEnabled: jest.fn(),
  setAllowChangingPriorTone: jest.fn(),
  setUserPhrases: jest.fn(),
  setExcludedPhrases: jest.fn(),
  setOnPhraseChange: jest.fn(),
  setOnExcludedPhraseChange: jest.fn(),
  deferredReset: jest.fn(),
  mcbopomofoKeyEvent: jest.fn(),
});

const mockLargeSyncGet = jest.fn();
const mockLargeSyncSet = jest.fn();

let mockInputController = createInputControllerMock();

const activateListeners: Array<(engineID: string) => void> = [];
const messageListeners: Array<
  (
    request: { command?: string },
    sender: unknown,
    sendResponse: (response: unknown) => void
  ) => void
> = [];

jest.mock("./LargeSync/LargeSync", () => ({
  LargeSync: jest.fn().mockImplementation(() => ({
    get: mockLargeSyncGet,
    set: mockLargeSyncSet,
  })),
}));

jest.mock("./McBopomofo/InputController", () => ({
  InputController: jest.fn().mockImplementation(() => mockInputController),
  MovingCursorOption: {
    Disabled: 0,
    UseJK: 1,
    UseHL: 2,
  },
}));

jest.mock("./McBopomofo/Service", () => ({
  Service: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("chinese_convert", () => ({}));

const installChromeMock = (): void => {
  (global as typeof globalThis & { chrome: typeof chrome }).chrome = {
    i18n: {
      getAcceptLanguages: (callback: (langs: string[]) => void) => {
        queueMicrotask(() => callback(["zh-TW"]));
      },
      getMessage: jest.fn((key: string) => key),
    },
    input: {
      ime: {
        onActivate: {
          addListener: jest.fn((listener: (engineID: string) => void) => {
            activateListeners.push(listener);
          }),
        },
        onBlur: { addListener: jest.fn() },
        onFocus: { addListener: jest.fn() },
        onKeyEvent: { addListener: jest.fn() },
        onReset: { addListener: jest.fn() },
        onDeactivated: { addListener: jest.fn() },
        onMenuItemActivated: { addListener: jest.fn() },
        onCandidateClicked: { addListener: jest.fn() },
        setMenuItems: jest.fn(),
        clearComposition: jest.fn(),
        commitText: jest.fn(),
        setCandidates: jest.fn(),
        setCandidateWindowProperties: jest.fn(),
        setComposition: jest.fn(),
        setCursorPosition: jest.fn(),
      },
    },
    runtime: {
      onMessage: {
        addListener: jest.fn(
          (
            listener: (
              request: { command?: string },
              sender: unknown,
              sendResponse: (response: unknown) => void
            ) => void
          ) => {
            messageListeners.push(listener);
          }
        ),
      },
      onConnect: { addListener: jest.fn() },
      connect: jest.fn(),
      getURL: jest.fn((path: string) => path),
    },
    scripting: {
      executeScript: jest.fn().mockResolvedValue(undefined),
    },
    tabs: {
      query: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      sendMessage: jest.fn(),
      onUpdated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
    commands: {
      onCommand: { addListener: jest.fn() },
    },
    contextMenus: {
      onClicked: { addListener: jest.fn() },
      create: jest.fn(),
    },
    notifications: {
      clear: jest.fn(),
      create: jest.fn(),
    },
    storage: {
      sync: {
        get: jest.fn(
          (_key, callback: (value: Record<string, unknown>) => void) =>
            callback({})
        ),
        set: jest.fn(),
      },
    },
  } as unknown as typeof chrome;
};

const installLargeSyncFixtures = (): void => {
  mockLargeSyncGet.mockImplementation((keys, callback) => {
    if (Array.isArray(keys) && keys.includes("user_phrase")) {
      callback({ user_phrase: JSON.stringify({ ㄊㄚ: ["他"] }) });
      return;
    }
    if (Array.isArray(keys) && keys.includes("excluded_phrase")) {
      callback({ excluded_phrase: JSON.stringify({ ㄊㄚ: ["她"] }) });
      return;
    }
    callback({});
  });
};

const importChromeOsIme = async (): Promise<void> => {
  await import("./chromeos_ime");
  await Promise.resolve();
};

const activateIme = (): void => {
  expect(activateListeners).toHaveLength(1);
  activateListeners[0]("engine");
};

describe("chromeos_ime", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    mockInputController = createInputControllerMock();
    activateListeners.length = 0;
    messageListeners.length = 0;

    installLargeSyncFixtures();
    installChromeMock();
  });

  test("loads both user and excluded phrases during activation", async () => {
    await importChromeOsIme();

    activateIme();

    expect(mockLargeSyncGet).toHaveBeenCalledWith(
      ["user_phrase"],
      expect.any(Function)
    );
    expect(mockLargeSyncGet).toHaveBeenCalledWith(
      ["excluded_phrase"],
      expect.any(Function)
    );
    expect(mockInputController.setUserPhrases).toHaveBeenCalledWith(
      new Map([["ㄊㄚ", ["他"]]])
    );
    expect(mockInputController.setExcludedPhrases).toHaveBeenCalledWith(
      new Map([["ㄊㄚ", ["她"]]])
    );
  });

  test("persists user and excluded phrase updates to their own storage keys", async () => {
    await importChromeOsIme();

    activateIme();

    const onPhraseChange =
      mockInputController.setOnPhraseChange.mock.calls[0][0];
    const onExcludedPhraseChange =
      mockInputController.setOnExcludedPhraseChange.mock.calls[0][0];

    onPhraseChange(new Map([["ㄘㄜˋ", ["測"]]]));
    onExcludedPhraseChange(new Map([["ㄕˋ", ["試"]]]));

    expect(mockLargeSyncSet).toHaveBeenCalledWith(
      { user_phrase: JSON.stringify({ ㄘㄜˋ: ["測"] }) },
      expect.any(Function)
    );
    expect(mockLargeSyncSet).toHaveBeenCalledWith(
      { excluded_phrase: JSON.stringify({ ㄕˋ: ["試"] }) },
      expect.any(Function)
    );
  });

  test("reload_user_phrase reloads both user and excluded phrases", async () => {
    await importChromeOsIme();

    expect(messageListeners).toHaveLength(1);

    const sendResponse = jest.fn();
    messageListeners[0]({ command: "reload_user_phrase" }, {}, sendResponse);

    expect(mockLargeSyncGet).toHaveBeenCalledWith(
      ["user_phrase"],
      expect.any(Function)
    );
    expect(mockInputController.setUserPhrases).toHaveBeenCalledWith(
      new Map([["ㄊㄚ", ["他"]]])
    );
    expect(mockInputController.setExcludedPhrases).not.toHaveBeenCalled();
    expect(sendResponse).toHaveBeenCalledWith({ status: "ok" });
  });

  test("reload_excluded_phrase reloads excluded phrases only", async () => {
    await importChromeOsIme();

    expect(messageListeners).toHaveLength(1);

    const sendResponse = jest.fn();
    messageListeners[0](
      { command: "reload_excluded_phrase" },
      {},
      sendResponse
    );

    expect(mockLargeSyncGet).toHaveBeenCalledWith(
      ["excluded_phrase"],
      expect.any(Function)
    );
    expect(mockInputController.setUserPhrases).not.toHaveBeenCalled();
    expect(mockInputController.setExcludedPhrases).toHaveBeenCalledWith(
      new Map([["ㄊㄚ", ["她"]]])
    );
    expect(sendResponse).toHaveBeenCalledWith({ status: "ok" });
  });
});
