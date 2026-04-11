const mockLargeSyncGet = jest.fn();
const mockLargeSyncSet = jest.fn();

const mockInputController = {
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
};

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

describe("chromeos_ime excluded phrase loading", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    activateListeners.length = 0;
    messageListeners.length = 0;

    mockLargeSyncGet.mockImplementation((keys, callback) => {
      if (Array.isArray(keys) && keys.includes("settings")) {
        callback({});
        return;
      }
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

    (global as typeof globalThis & { chrome: typeof chrome }).chrome = {
      i18n: {
        getAcceptLanguages: (callback: (langs: string[]) => void) => {
          setTimeout(() => callback(["zh-TW"]), 0);
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
          get: jest.fn((_key, callback: (value: Record<string, unknown>) => void) =>
            callback({})
          ),
          set: jest.fn(),
        },
      },
    } as unknown as typeof chrome;
  });

  it("loads excluded phrases during activation from the excluded_phrase storage key", async () => {
    await import("./chromeos_ime");

    expect(activateListeners).toHaveLength(1);

    activateListeners[0]("engine");

    expect(mockLargeSyncGet).toHaveBeenCalledWith(
      ["excluded_phrase"],
      expect.any(Function)
    );
    expect(mockInputController.setExcludedPhrases).toHaveBeenCalledWith(
      new Map([["ㄊㄚ", ["她"]]])
    );
  });

  it("reload_user_phrase also reloads excluded phrases", async () => {
    await import("./chromeos_ime");

    expect(messageListeners).toHaveLength(1);

    const sendResponse = jest.fn();
    messageListeners[0]({ command: "reload_user_phrase" }, {}, sendResponse);

    expect(mockLargeSyncGet).toHaveBeenCalledWith(
      ["excluded_phrase"],
      expect.any(Function)
    );
    expect(mockInputController.setExcludedPhrases).toHaveBeenCalledWith(
      new Map([["ㄊㄚ", ["她"]]])
    );
    expect(sendResponse).toHaveBeenCalledWith({ status: "ok" });
  });
});
