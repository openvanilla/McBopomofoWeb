import { InputController } from "./McBopomofo/InputController";
import { InputUI } from "./McBopomofo/InputUI";
import { KeyFromKeyboardEvent } from "./pime_keys";
import { List } from "lodash";
import child_process from "child_process";
import fs from "fs";
import path from "path";
import process from "process";

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
  by_default_deactivated: boolean;
  beep_on_error: boolean;
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
  by_default_deactivated: false,
  beep_on_error: true,
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
  help = 8,
}

/** Wraps InputController and required states.  */
class PimeMcBopomofo {
  readonly inputController: InputController;
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
  settings: Settings = defaultSettings;
  lastRequest: any = {};
  isLastFilterKeyDownHandled: boolean = false;
  isOpened: boolean = true;
  isShiftHold: boolean = false;
  isAlphabetMode: boolean = false;

  constructor() {
    this.inputController = new InputController(this.makeUI(this));
    this.inputController.setUserVerticalCandidates(true);
    this.inputController.setOnOpenUrl((url: string) => {
      let command = `start ${url}`;
      child_process.exec(command);
    });
    // this.mcInputController.setOnPhraseChange((map: Map<string, string[]>) => {
    //   this.writeUserPhrases(map);
    // });
    this.inputController.setOnPhraseAdded((key: string, phrase: string) => {
      this.addPhrase(key, phrase);
    });
    this.inputController.setOnError(() => {
      if (this.settings.beep_on_error) {
        child_process.exec(`rundll32 user32.dll,MessageBeep`);
      }
    });
    this.loadSettings();
    this.isOpened = !this.settings.by_default_deactivated;
    this.loadUserPhrases();
  }

  public resetBeforeHandlingKey(): void {
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

  public resetController(): void {
    // console.log("resetController called");
    this.inputController.reset();
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

  public loadUserPhrases(): void {
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
        this.inputController.setUserPhrases(map);
      } catch {
        console.error("Failed to parse user phrases");
      }
    });
  }

  private addPhrase(key: string, phrase: string): void {
    if (!fs.existsSync(this.userDataPath)) {
      console.log("User data folder not found, creating " + this.userDataPath);
      console.log("Creating one");
      fs.mkdirSync(this.userDataPath);
    }

    fs.readFile(this.userPhrasesPath, (err, data) => {
      let lineToWrite = key + " " + phrase + "\n";
      if (data) {
        let string = data.toString();
        if (string[string.length - 1] !== "\n") {
          string += "\n";
        }
        string += lineToWrite;
        fs.writeFile(this.userPhrasesPath, string, (err) => {});
      }
    });
  }

  private writeUserPhrases(map: Map<string, string[]>): void {
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

  public toggleAlphabetMode(): void {
    this.isAlphabetMode = !this.isAlphabetMode;
  }

  public applySettings(): void {
    this.inputController.setKeyboardLayout(this.settings.layout);
    this.inputController.setSelectPhrase(this.settings.select_phrase);
    this.inputController.setCandidateKeys(this.settings.candidate_keys);
    this.inputController.setChineseConversionEnabled(
      this.settings.chineseConversion
    );
    this.inputController.setEscClearEntireBuffer(
      this.settings.esc_key_clear_entire_buffer
    );
    this.inputController.setMoveCursorAfterSelection(this.settings.move_cursor);
    this.inputController.setLetterMode(this.settings.letter_mode);
    this.inputController.setHalfWidthPunctuationEnabled(
      this.settings.half_width_punctuation
    );
    this.inputController.setLanguageCode("zh-TW");
  }

  /** Load settings from disk */
  public loadSettings(): void {
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
  private writeSettings() {
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

  public makeUI(instance: PimeMcBopomofo): InputUI {
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

  public customUiResponse(): any {
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
      keyboardOpen: this.isOpened,
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

  public handleCommand(id: PimeMcBopomofoCommand): void {
    switch (id) {
      case PimeMcBopomofoCommand.modeIcon:
      case PimeMcBopomofoCommand.switchLanguage:
        {
          if (this.isOpened == false) {
            return;
          }
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
      case PimeMcBopomofoCommand.help:
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
        let command = `"${python3}" "${script}" help`;
        console.log("Run " + command);
        child_process.exec(command);
        break;
      default:
        break;
    }
  }
}

const pimeMcBopomofo = new PimeMcBopomofo();

fs.watch(pimeMcBopomofo.userSettingsPath, (event, filename) => {
  if (filename) {
    pimeMcBopomofo.loadSettings();
  }
});

fs.watch(pimeMcBopomofo.userPhrasesPath, (event, filename) => {
  if (filename) {
    pimeMcBopomofo.loadUserPhrases();
  }
});

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
      // pimeMcBopomofo.loadSettings();
      // pimeMcBopomofo.loadUserPhrases();
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
      let handled = pimeMcBopomofo.inputController.mcbopomofoKeyEvent(key);
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
      pimeMcBopomofo.resetController();
      pimeMcBopomofo.loadSettings();
      // pimeMcBopomofo.loadUserPhrases();
      let customUi = pimeMcBopomofo.customUiResponse();
      let response = Object.assign({}, responseTemplate, customUi);
      return response;
    }

    if (request.method === "onCompositionTerminated") {
      pimeMcBopomofo.resetController();
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
        {
          text: "輔助說明",
          id: PimeMcBopomofoCommand.help,
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
      ];
      let response = Object.assign({}, responseTemplate, { return: menu });
      return response;
    }

    return responseTemplate;
  },
};
