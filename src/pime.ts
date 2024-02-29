import { List } from "lodash";
import { InputController } from "./McBopomofo/InputController";
import { InputUI } from "./McBopomofo/InputUI";
import { Key, KeyName } from "./McBopomofo/Key";
import fs from "fs";
import path from "path";
import process from "process";
import child_process from "child_process";

enum VK_Keys {
  VK_LBUTTON = 0x01,
  VK_RBUTTON = 0x02,
  VK_CANCEL = 0x03,
  VK_MBUTTON = 0x04, //  NOT contiguous with L & RBUTTON
  VK_XBUTTON1 = 0x05, //  NOT contiguous with L & RBUTTON
  VK_XBUTTON2 = 0x06, //  NOT contiguous with L & RBUTTON
  //  0x07 = unassigned
  VK_BACK = 0x08,
  VK_TAB = 0x09,
  //  0x0A - = 0x0B = reserved
  VK_CLEAR = 0x0c,
  VK_RETURN = 0x0d,
  VK_SHIFT = 0x10,
  VK_CONTROL = 0x11,
  VK_MENU = 0x12,
  VK_PAUSE = 0x13,
  VK_CAPITAL = 0x14,
  VK_KANA = 0x15,
  VK_HANGEUL = 0x15, //  old name - should be here for compatibility
  VK_HANGUL = 0x15,
  VK_JUNJA = 0x17,
  VK_FINAL = 0x18,
  VK_HANJA = 0x19,
  VK_KANJI = 0x19,
  VK_ESCAPE = 0x1b,
  VK_CONVERT = 0x1c,
  VK_NONCONVERT = 0x1d,
  VK_ACCEPT = 0x1e,
  VK_MODECHANGE = 0x1f,
  VK_SPACE = 0x20,
  VK_PRIOR = 0x21,
  VK_NEXT = 0x22,
  VK_END = 0x23,
  VK_HOME = 0x24,
  VK_LEFT = 0x25,
  VK_UP = 0x26,
  VK_RIGHT = 0x27,
  VK_DOWN = 0x28,
  VK_SELECT = 0x29,
  VK_PRINT = 0x2a,
  VK_EXECUTE = 0x2b,
  VK_SNAPSHOT = 0x2c,
  VK_INSERT = 0x2d,
  VK_DELETE = 0x2e,
  VK_HELP = 0x2f,
  //  VK_0 - VK_9 are the same as ASCII '0' - '9' (0x30 - = 0x39)
  //  0x40 = unassigned
  //  VK_A - VK_Z are the same as ASCII 'A' - 'Z' (0x41 - = 0x5A)
  VK_LWIN = 0x5b,
  VK_RWIN = 0x5c,
  VK_APPS = 0x5d,
  //  0x5E = reserved
  VK_SLEEP = 0x5f,
  VK_NUMPAD0 = 0x60,
  VK_NUMPAD1 = 0x61,
  VK_NUMPAD2 = 0x62,
  VK_NUMPAD3 = 0x63,
  VK_NUMPAD4 = 0x64,
  VK_NUMPAD5 = 0x65,
  VK_NUMPAD6 = 0x66,
  VK_NUMPAD7 = 0x67,
  VK_NUMPAD8 = 0x68,
  VK_NUMPAD9 = 0x69,
  VK_MULTIPLY = 0x6a,
  VK_ADD = 0x6b,
  VK_SEPARATOR = 0x6c,
  VK_SUBTRACT = 0x6d,
  VK_DECIMAL = 0x6e,
  VK_DIVIDE = 0x6f,
  VK_F1 = 0x70,
  VK_F2 = 0x71,
  VK_F3 = 0x72,
  VK_F4 = 0x73,
  VK_F5 = 0x74,
  VK_F6 = 0x75,
  VK_F7 = 0x76,
  VK_F8 = 0x77,
  VK_F9 = 0x78,
  VK_F10 = 0x79,
  VK_F11 = 0x7a,
  VK_F12 = 0x7b,
  VK_F13 = 0x7c,
  VK_F14 = 0x7d,
  VK_F15 = 0x7e,
  VK_F16 = 0x7f,
  VK_F17 = 0x80,
  VK_F18 = 0x81,
  VK_F19 = 0x82,
  VK_F20 = 0x83,
  VK_F21 = 0x84,
  VK_F22 = 0x85,
  VK_F23 = 0x86,
  VK_F24 = 0x87,
  //  0x88 - = 0x8F = unassigned
  VK_NUMLOCK = 0x90,
  VK_SCROLL = 0x91,
  //  NEC PC-9800 kbd definitions
  VK_OEM_NEC_EQUAL = 0x92, // '=' key on numpad
  //  Fujitsu/OASYS kbd definitions
  VK_OEM_FJ_JISHO = 0x92, // 'Dictionary' key
  VK_OEM_FJ_MASSHOU = 0x93, // 'Unregister word' key
  VK_OEM_FJ_TOUROKU = 0x94, // 'Register word' key
  VK_OEM_FJ_LOYA = 0x95, // 'Left OYAYUBI' key
  VK_OEM_FJ_ROYA = 0x96, // 'Right OYAYUBI' key
  //  0x97 - = 0x9F = unassigned
  //  VK_L* & VK_R* - left and right Alt, Ctrl and Shift virtual keys.
  //  Used only as parameters to GetAsyncKeyState() and GetKeyState().
  //  No other API or message will distinguish left and right keys in this way.
  VK_LSHIFT = 0xa0,
  VK_RSHIFT = 0xa1,
  VK_LCONTROL = 0xa2,
  VK_RCONTROL = 0xa3,
  VK_LMENU = 0xa4,
  VK_RMENU = 0xa5,
  VK_BROWSER_BACK = 0xa6,
  VK_BROWSER_FORWARD = 0xa7,
  VK_BROWSER_REFRESH = 0xa8,
  VK_BROWSER_STOP = 0xa9,
  VK_BROWSER_SEARCH = 0xaa,
  VK_BROWSER_FAVORITES = 0xab,
  VK_BROWSER_HOME = 0xac,
  VK_VOLUME_MUTE = 0xad,
  VK_VOLUME_DOWN = 0xae,
  VK_VOLUME_UP = 0xaf,
  VK_MEDIA_NEXT_TRACK = 0xb0,
  VK_MEDIA_PREV_TRACK = 0xb1,
  VK_MEDIA_STOP = 0xb2,
  VK_MEDIA_PLAY_PAUSE = 0xb3,
  VK_LAUNCH_MAIL = 0xb4,
  VK_LAUNCH_MEDIA_SELECT = 0xb5,
  VK_LAUNCH_APP1 = 0xb6,
  VK_LAUNCH_APP2 = 0xb7,
  //  0xB8 - = 0xB9 = reserved
  VK_OEM_1 = 0xba, // ';=' for US
  VK_OEM_PLUS = 0xbb, // '+' any country
  VK_OEM_COMMA = 0xbc, // ',' any country
  VK_OEM_MINUS = 0xbd, // '-' any country
  VK_OEM_PERIOD = 0xbe, // '.' any country
  VK_OEM_2 = 0xbf, // '/?' for US
  VK_OEM_3 = 0xc0, // '`~' for US
  //  0xC1 - = 0xD7 = reserved
  //  0xD8 - = 0xDA = unassigned
  VK_OEM_4 = 0xdb, //  '[{' for US
  VK_OEM_5 = 0xdc, //  '\|' for US
  VK_OEM_6 = 0xdd, //  ']}' for US
  VK_OEM_7 = 0xde, //  ''"' for US
  VK_OEM_8 = 0xdf,
  //  0xE0 = reserved
  //  Various extended or enhanced keyboards
  VK_OEM_AX = 0xe1, //  'AX' key on Japanese AX kbd
  VK_OEM_102 = 0xe2, //  "<>" or "\|" on RT 102-key kbd.
  VK_ICO_HELP = 0xe3, //  Help key on ICO
  VK_ICO_00 = 0xe4, //  00 key on ICO
  VK_PROCESSKEY = 0xe5,
  VK_ICO_CLEAR = 0xe6,
  VK_PACKET = 0xe7,
  //  0xE8 = unassigned
  //  Nokia/Ericsson definitions
  VK_OEM_RESET = 0xe9,
  VK_OEM_JUMP = 0xea,
  VK_OEM_PA1 = 0xeb,
  VK_OEM_PA2 = 0xec,
  VK_OEM_PA3 = 0xed,
  VK_OEM_WSCTRL = 0xee,
  VK_OEM_CUSEL = 0xef,
  VK_OEM_ATTN = 0xf0,
  VK_OEM_FINISH = 0xf1,
  VK_OEM_COPY = 0xf2,
  VK_OEM_AUTO = 0xf3,
  VK_OEM_ENLW = 0xf4,
  VK_OEM_BACKTAB = 0xf5,
  VK_ATTN = 0xf6,
  VK_CRSEL = 0xf7,
  VK_EXSEL = 0xf8,
  VK_EREOF = 0xf9,
  VK_PLAY = 0xfa,
  VK_ZOOM = 0xfb,
  VK_NONAME = 0xfc,
  VK_PA1 = 0xfd,
  VK_OEM_CLEAR = 0xfe,
}

function KeyFromKeyboardEvent(
  keyCode: number,
  keyStates: number[],
  ascii: string,
  charCode: number
) {
  let keyName = KeyName.UNKNOWN;
  switch (keyCode) {
    case VK_Keys.VK_LEFT:
      keyName = KeyName.LEFT;
      ascii = "ArrowLeft";
      break;
    case VK_Keys.VK_RIGHT:
      keyName = KeyName.RIGHT;
      ascii = "ArrowRight";
      break;
    case VK_Keys.VK_UP:
      keyName = KeyName.UP;
      ascii = "ArrowUp";
      break;
    case VK_Keys.VK_DOWN:
      keyName = KeyName.DOWN;
      ascii = "ArrowDown";
      break;
    case VK_Keys.VK_HOME:
      keyName = KeyName.HOME;
      ascii = "Home";
      break;
    case VK_Keys.VK_END:
      keyName = KeyName.END;
      ascii = "End";
      break;
    case VK_Keys.VK_BACK:
      keyName = KeyName.BACKSPACE;
      ascii = "Backspace";
      break;
    case VK_Keys.VK_DELETE:
      keyName = KeyName.DELETE;
      ascii = "Delete";
      break;
    case VK_Keys.VK_RETURN:
      keyName = KeyName.RETURN;
      ascii = "Enter";
      break;
    case VK_Keys.VK_ESCAPE:
      keyName = KeyName.ESC;
      ascii = "Escape";
      break;
    case VK_Keys.VK_SPACE:
      keyName = KeyName.SPACE;
      ascii = "Space";
      break;
    case VK_Keys.VK_TAB:
      keyName = KeyName.TAB;
      ascii = "Tab";
      break;
    case VK_Keys.VK_PRIOR:
      keyName = KeyName.PAGE_UP;
      ascii = "PageUp";
      break;
    case VK_Keys.VK_NEXT:
      keyName = KeyName.PAGE_DOWN;
      ascii = "PageDown";
      break;
    default:
      keyName = KeyName.ASCII;
      break;
  }
  let shiftKey = (keyStates[VK_Keys.VK_SHIFT] & (1 << 7)) != 0;
  if (charCode === 0 && keyName === KeyName.ASCII && shiftKey) {
    ascii = "Shift";
  }
  let ctrlKey = (keyStates[VK_Keys.VK_CONTROL] & (1 << 7)) != 0;
  let altKey = (keyStates[VK_Keys.VK_MENU] & (1 << 7)) != 0;
  if (charCode === 0 && keyName === KeyName.ASCII && altKey) {
    ascii = "Alt";
  }

  let key = new Key(ascii, keyName, shiftKey, ctrlKey);
  return key;
}

/** The McBopomofo Settings. */
interface Settings {
  layout: string;
  select_phrase: string;
  candidate_keys: string;
  esc_key_clear_entire_buffer: boolean;
  shift_key_toggle_alphabet_mode: boolean;
  chineseConversion: boolean;
  move_cursor: boolean;
  letter_mode: string;
  half_width_punctuation: boolean;
}

/** A middle data structure between McBopomofo input controller and PIME. */
interface UiState {
  commitString: string;
  compositionString: string;
  compositionCursor: number;
  showCandidates: boolean;
  candidateList: List<string>;
  candidateCursor: number;
  showMessage: any;
  hideMessage: boolean;
}

/**  The default settings. */
const defaultSettings: Settings = {
  layout: "standard",
  select_phrase: "before_cursor",
  candidate_keys: "123456789",
  esc_key_clear_entire_buffer: false,
  shift_key_toggle_alphabet_mode: true,
  chineseConversion: false,
  move_cursor: true,
  letter_mode: "upper",
  half_width_punctuation: false,
};

enum PimeMcBopomofoCommand {
  modeIcon = 0,
  switchLanguage = 1,
  homepage = 2,
  bugReport = 3,
  options = 4,
  userPhrase = 5,
  chineseConvert = 6,
  halfWidthPunctuation = 7,
  reloadUserPhrase = 8,
}

/** Wraps InputController and required states.  */
class PimeMcBopomofo {
  readonly mcInputController: InputController;
  uiState: UiState = {
    commitString: "",
    compositionString: "",
    compositionCursor: 0,
    showCandidates: false,
    candidateList: [],
    candidateCursor: 0,
    showMessage: {},
    hideMessage: true,
  };
  isLastFilterKeyDownHandled: boolean = false;
  settings: Settings = defaultSettings;
  isOpened: boolean = true;
  isShiftHold: boolean = false;
  isAlphabetMode: boolean = false;
  lastRequest: any = {};

  constructor() {
    this.mcInputController = new InputController(this.makeUI(this));
    this.mcInputController.setUserVerticalCandidates(true);
    this.mcInputController.setOnOpenUrl((url: string) => {
      let command = `start ${url}`;
      // console.log("Run " + command);
      child_process.exec(command);
    });
    this.mcInputController.setOnPhraseChange((map: Map<string, string[]>) => {
      this.writeUserPhrases(map);
    });
    this.loadSettings();
    this.loadUserPhrases();
  }

  resetBeforeHandlingKey() {
    // console.log("resetAfterHandlingKey called");
    this.isLastFilterKeyDownHandled = false;
    this.uiState = {
      commitString: "",
      compositionString: "",
      compositionCursor: 0,
      showCandidates: false,
      candidateList: [],
      candidateCursor: 0,
      showMessage: {},
      hideMessage: true,
    };
  }

  resetController() {
    // console.log("resetController called");
    this.mcInputController.reset();
  }

  readonly userDataPath: string = path.join(
    process.env.APPDATA || "",
    "PIME",
    "mcbopomofo"
  );

  readonly userPhrasesPath: string = path.join(this.userDataPath, "data.json");
  readonly userSettingsPath: string = path.join(
    this.userDataPath,
    "config.json"
  );

  loadUserPhrases() {
    fs.readFile(this.userPhrasesPath, (err, data) => {
      if (err) {
        console.error(
          "Unable to read user phrases from " + this.userPhrasesPath
        );
        return;
      }
      try {
        let map = new Map<string, string[]>();

        let string = data.toString();
        let lines = string.split("\n");
        for (let line in lines) {
          let components = line.split(" ");
          if (components.length >= 2) {
            let key = components[0];
            let phrase = components[1];
            let phrases = map.get(key);
            if (phrases === undefined) {
              phrases = [];
            }
            phrases.push(phrase);
            map.set(key, phrases);
          }
        }
        this.mcInputController.setUserPhrases(map);
      } catch {
        console.error("Failed to parse user phrases");
      }
    });
  }

  writeUserPhrases(map: Map<string, string[]>) {
    if (!fs.existsSync(this.userDataPath)) {
      console.log("User data folder not found, creating " + this.userDataPath);
      console.log("Creating one");
      fs.mkdirSync(this.userDataPath);
    }

    let string = "";
    for (let key of map.keys()) {
      let phrases = map.get(key);
      if (phrases === undefined) {
        continue;
      }
      for (let phrase of phrases) {
        string += key + " " + phrase + "\n";
      }
    }

    console.log("Writing user phrases to " + this.userPhrasesPath);
    fs.writeFile(this.userPhrasesPath, string, (err) => {
      if (err) {
        console.error("Failed to write user phrases");
        console.error(err);
      }
    });
  }

  toggleAlphabetMode() {
    this.isAlphabetMode = !this.isAlphabetMode;
  }

  applySettings() {
    this.mcInputController.setKeyboardLayout(this.settings.layout);
    this.mcInputController.setSelectPhrase(this.settings.select_phrase);
    this.mcInputController.setCandidateKeys(this.settings.candidate_keys);
    this.mcInputController.setChineseConversionEnabled(
      this.settings.chineseConversion
    );
    this.mcInputController.setEscClearEntireBuffer(
      this.settings.esc_key_clear_entire_buffer
    );
    this.mcInputController.setMoveCursorAfterSelection(
      this.settings.move_cursor
    );
    this.mcInputController.setLetterMode(this.settings.letter_mode);
    this.mcInputController.setHalfWidthPunctuationEnabled(
      this.settings.half_width_punctuation
    );
    this.mcInputController.setLanguageCode("zh-TW");
  }

  /** Load settings from disk */
  loadSettings() {
    fs.readFile(this.userSettingsPath, (err, data) => {
      if (err) {
        console.log(
          "Unable to read user settings from " + this.userSettingsPath
        );
        this.writeSettings();
        return;
      }
      console.log(data);
      try {
        console.log("Try to load settings");
        let newSettings = JSON.parse(data.toString());
        this.settings = Object.assign({}, defaultSettings, newSettings);
        console.log(
          "Loaded settings: " + JSON.stringify(this.settings, null, 2)
        );
        this.applySettings();
      } catch {
        console.error("Failed to parse settings");
        this.writeSettings();
      }
    });
  }

  /** Write settings to disk */
  writeSettings() {
    if (!fs.existsSync(this.userDataPath)) {
      console.log("User data folder not found, creating " + this.userDataPath);
      console.log("Creating one");
      fs.mkdirSync(this.userDataPath);
    }

    console.log("Writing user settings to " + this.userSettingsPath);
    let string = JSON.stringify(this.settings, null, 2);
    fs.writeFile(this.userSettingsPath, string, (err) => {
      if (err) {
        console.error("Failed to write settings");
        console.error(err);
      }
    });
  }

  makeUI(instance: PimeMcBopomofo): InputUI {
    let that: InputUI = {
      reset: () => {
        instance.uiState = {
          commitString: "",
          compositionString: "",
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      commitString(text: string) {
        console.log("commitString: " + text);
        let joinedCommitString = instance.uiState.compositionString + text;
        console.log("joinedCommitString: " + joinedCommitString);
        instance.uiState = {
          commitString: joinedCommitString,
          compositionString: "",
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      update(stateString: string) {
        let state = JSON.parse(stateString);
        let composingBuffer = state.composingBuffer;
        let candidates = state.candidates;
        let selectedIndex = 0;
        let index = 0;
        let candidateList = [];
        for (let candidate of state.candidates) {
          if (candidate.selected) {
            selectedIndex = index;
          }
          candidateList.push(candidate.candidate.displayedText);
          index++;
        }

        // Note: McBopomofo's composing buffer are composed by segments so
        // it allows an input method framework to draw underlines
        let compositionString = "";
        for (let item of composingBuffer) {
          compositionString += item.text;
        }

        let tooltip = state.tooltip;
        let showMessage = {};
        let hideMessage = true;
        if (tooltip) {
          showMessage = { message: tooltip, duration: 3 };
          hideMessage = false;
        }
        let commitString = instance.uiState.commitString;
        instance.uiState = {
          commitString: commitString,
          compositionString: compositionString,
          compositionCursor: state.cursorIndex,
          showCandidates: candidates.length > 0,
          candidateList: candidateList,
          candidateCursor: selectedIndex,
          showMessage: showMessage,
          hideMessage: hideMessage,
        };
      },
    };
    return that;
  }

  customUiResponse(): any {
    let windowsModeIcon = "close.ico";
    if (this.isOpened) {
      if (this.isAlphabetMode) {
        windowsModeIcon = "eng.ico";
      } else {
        if (this.settings.chineseConversion) {
          windowsModeIcon = "simC.ico";
        } else {
          windowsModeIcon = "traC.ico";
        }
      }
    }

    let windowsModeIconPath = path.join(__dirname, "icons", windowsModeIcon);
    return {
      openKeyboard: this.isOpened,
      customizeUI: {
        candPerRow: 1,
        candFontSize: 16,
        // candFontName: "MingLiu",
        candFontName: "Microsoft YaHei",
        candUseCursor: true,
      },
      setSelKeys: this.settings.candidate_keys,
      changeButton: [
        {
          icon: windowsModeIconPath,
          id: "windows-mode-icon",
        },
        {
          icon: windowsModeIconPath,
          id: "switch-lang",
        },
      ],
      addButton: [
        {
          id: "windows-mode-icon",
          icon: path.join(__dirname, "icons", windowsModeIcon),
          commandId: PimeMcBopomofoCommand.modeIcon,
          tooltip: "中英文切換",
        },
        {
          id: "switch-lang",
          icon: path.join(__dirname, "icons", windowsModeIcon),
          commandId: PimeMcBopomofoCommand.switchLanguage,
          tooltip: "中英文切換",
        },
      ],
    };
  }

  public handleCommand(id: PimeMcBopomofoCommand) {
    switch (id) {
      case PimeMcBopomofoCommand.modeIcon:
      case PimeMcBopomofoCommand.switchLanguage:
        {
          this.toggleAlphabetMode();
        }
        break;
      case PimeMcBopomofoCommand.homepage:
        {
          let url = "https://mcbopomofo.openvanilla.org/";
          let command = `start ${url}`;
          console.log("Run " + command);
          child_process.exec(command);
        }
        break;
      case PimeMcBopomofoCommand.bugReport:
        {
          let url = "https://github.com/openvanilla/McBopomofoWeb/issues";
          let command = `start ${url}`;
          console.log("Run " + command);
          child_process.exec(command);
        }
        break;
      case PimeMcBopomofoCommand.options:
        {
          let python3 = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "python",
            "python3",
            "python.exe"
          );
          let script = path.join(__dirname, "config_tool.py");
          let command = `"${python3}" "${script}"`;
          console.log("Run " + command);
          child_process.exec(command);
        }
        break;
      case PimeMcBopomofoCommand.userPhrase: {
        let url = pimeMcBopomofo.userPhrasesPath;
        let command = `start ${url}`;
        console.log("Run " + command);
        child_process.exec(command);
      }
      case PimeMcBopomofoCommand.chineseConvert:
        pimeMcBopomofo.settings.chineseConversion =
          !pimeMcBopomofo.settings.chineseConversion;
        pimeMcBopomofo.applySettings();
        pimeMcBopomofo.writeSettings();
        break;
      case PimeMcBopomofoCommand.halfWidthPunctuation:
        pimeMcBopomofo.settings.half_width_punctuation =
          !pimeMcBopomofo.settings.half_width_punctuation;
        pimeMcBopomofo.applySettings();
        pimeMcBopomofo.writeSettings();
        break;
      case PimeMcBopomofoCommand.reloadUserPhrase:
        pimeMcBopomofo.loadUserPhrases();
      default:
        break;
    }
  }
}

// https://hackmd.io/@SYkYaRqjTQm-oj2WqaWhUQ/BJ0xsY5A?type=slide#/
const pimeMcBopomofo = new PimeMcBopomofo();

module.exports = {
  textReducer(_: any, preState: any) {
    // Note: textReducer and response are the pattern of NIME. Actually, PIME
    // only care about the response. Since we let pimeMcBopomofo to do
    // everything, we just left textReducer as an empty implementation to let
    // NIME to call it.
    return preState;
  },
  response(request: any, _: any) {
    let lastRequest = pimeMcBopomofo.lastRequest;
    pimeMcBopomofo.lastRequest = request;
    const responseTemplate = {
      return: false,
      success: true,
      seqNum: request.seqNum,
    };
    if (request.method === "init") {
      let customUi = pimeMcBopomofo.customUiResponse();
      let response = Object.assign({}, responseTemplate, customUi);
      return response;
    }

    if (request.method === "onActivate") {
      pimeMcBopomofo.loadSettings();
      pimeMcBopomofo.loadUserPhrases();
      let customUi = pimeMcBopomofo.customUiResponse();
      let response = Object.assign({}, responseTemplate, customUi);
      return response;
    }

    if (request.method === "onDeactivate") {
      let response = Object.assign({}, responseTemplate, {
        removeButton: ["windows-mode-icon"],
      });
      return response;
    }

    if (request.method === "filterKeyUp") {
      if (
        lastRequest &&
        lastRequest.method === "filterKeyUp" &&
        lastRequest.keyCode === request.keyCode
      ) {
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }
      if (pimeMcBopomofo.isShiftHold) {
        pimeMcBopomofo.toggleAlphabetMode();
        pimeMcBopomofo.resetController();
        let uiState = pimeMcBopomofo.uiState;
        let customui = pimeMcBopomofo.customUiResponse();
        let response = Object.assign({}, responseTemplate, uiState, customui);
        return response;
      }

      let response = Object.assign({}, responseTemplate, { return: true });
      return response;
    }

    if (request.method === "filterKeyDown") {
      if (
        lastRequest &&
        lastRequest.method === "filterKeyDown" &&
        lastRequest.keyCode === request.keyCode
      ) {
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }
      pimeMcBopomofo.resetBeforeHandlingKey();

      let { keyCode, charCode, keyStates } = request;
      let key = KeyFromKeyboardEvent(
        keyCode,
        keyStates,
        String.fromCharCode(charCode),
        charCode
      );

      let shouldHandleShift =
        pimeMcBopomofo.settings.shift_key_toggle_alphabet_mode === true;

      if (shouldHandleShift) {
        pimeMcBopomofo.isShiftHold = key.ascii === "Shift";
      }

      if (pimeMcBopomofo.isAlphabetMode) {
        let response = Object.assign({}, responseTemplate, { return: false });
        return response;
      }

      // console.log(key.toString());
      let handled = pimeMcBopomofo.mcInputController.mcbopomofoKeyEvent(key);
      pimeMcBopomofo.isLastFilterKeyDownHandled = handled;
      let response = Object.assign({}, responseTemplate, {
        return: handled,
      });
      return response;
    }

    if (request.method === "onKeyDown") {
      if (
        lastRequest &&
        lastRequest.method === "onKeyDown" &&
        lastRequest.keyCode === request.keyCode
      ) {
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }

      let uiState: any = pimeMcBopomofo.uiState;
      let response = Object.assign({}, responseTemplate, uiState, {
        return: pimeMcBopomofo.isLastFilterKeyDownHandled,
      });
      return response;
    }

    if (request.method === "onKeyboardStatusChanged") {
      let { opened } = request;
      pimeMcBopomofo.isOpened = opened;
      pimeMcBopomofo.loadSettings();
      // pimeMcBopomofo.loadUserPhrases();
      let customUi = pimeMcBopomofo.customUiResponse();
      let response = Object.assign({}, responseTemplate, customUi);
      return response;
    }

    if (request.method === "onCompositionTerminated") {
      let { forced } = request;
      if (forced) {
        pimeMcBopomofo.resetController();
      }
      let uiState = pimeMcBopomofo.uiState;
      let customUi = pimeMcBopomofo.customUiResponse();
      let response = Object.assign({}, responseTemplate, uiState, customUi);
      pimeMcBopomofo.resetBeforeHandlingKey();
      return response;
    }

    if (request.method === "onCommand") {
      let { id } = request;
      pimeMcBopomofo.handleCommand(id);
      let uiState = pimeMcBopomofo.uiState;
      let customUi = pimeMcBopomofo.customUiResponse();
      let response = Object.assign({}, responseTemplate, uiState, customUi);
      return response;
    }

    if (request.method === "onMenu") {
      // console.log(request);
      let menu = [
        {
          text: "小麥注音輸入法網站",
          id: PimeMcBopomofoCommand.homepage,
        },
        {
          text: "問題回報",
          id: PimeMcBopomofoCommand.bugReport,
        },
        {},
        {
          text: "使用簡體中文",
          id: PimeMcBopomofoCommand.chineseConvert,
          checked: pimeMcBopomofo.settings.chineseConversion,
        },
        {
          text: "使用半形標點",
          id: PimeMcBopomofoCommand.halfWidthPunctuation,
          checked: pimeMcBopomofo.settings.half_width_punctuation,
        },
        {},
        {
          text: "偏好設定 (&O)",
          id: PimeMcBopomofoCommand.options,
        },
        {
          text: "編輯使用者詞庫 (&U)",
          id: PimeMcBopomofoCommand.userPhrase,
        },
        {
          text: "重新載入使用者詞庫",
          id: PimeMcBopomofoCommand.reloadUserPhrase,
        },
      ];
      let response = Object.assign({}, responseTemplate, { return: menu });
      return response;
    }

    return responseTemplate;
  },
};
