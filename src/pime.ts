import { InputController } from "./McBopomofo/InputController";
import { InputUI } from "./McBopomofo/InputUI";
import { KeyFromKeyboardEvent, VK_Keys } from "./pime_keys";
import { List } from "lodash";
import child_process from "child_process";
import fs from "fs";
import path from "path";
import process from "process";

/** The McBopomofo Settings. */
interface Settings {
  /** The keyboard layout. Valid options: "Standard", "Hsu", "ETen", "ETen26",
   * "IBM", "HanyuPinyin" */
  layout: string;
  /** "before_cursor" and "after_cursor". */
  select_phrase: string;
  /** The candidate keys like "123456789", "asdfghjkl" and so on. */
  candidate_keys: string;
  /** Whether ESC key clears all of the composing buffer. */
  esc_key_clear_entire_buffer: boolean;
  /** Whether Shift key toggles the BPMF/Alphabet mode. */
  shift_key_toggle_alphabet_mode: boolean;
  /** Whether Traditional/Simplified Chinese conversion is on. */
  chineseConversion: boolean;
  /** Whether the input method moves the cursor to the place of the end of the
   * selected candidate. Only works when select_phrase is "after_cursor" */
  move_cursor: boolean;
  /** Inputs upper case or lower case letters when shift key is pressed. */
  letter_mode: string;
  /** Whether input half width punctuation instead of default full width
   * punctuation. */
  half_width_punctuation: boolean;
  /** Whether the input method is deactivated on Windows 8 and above. */
  by_default_deactivated: boolean;
  /** Whether prompts sound alerts when a user inputs invalid keys. */
  beep_on_error: boolean;
  ctrl_enter_option: number;
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
  ctrl_enter_option: 0,
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
  mcBopomofoUserDataFolder = 9,
  reloadUserPhrase = 10,
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

  readonly pimeUserDataPath: string = path.join(
    process.env.APPDATA || "",
    "PIME"
  );

  readonly mcBopomofoUserDataPath: string = path.join(
    this.pimeUserDataPath,
    "mcbopomofo"
  );

  readonly userPhrasesPath: string = path.join(
    this.mcBopomofoUserDataPath,
    "data.txt"
  );
  readonly userSettingsPath: string = path.join(
    this.mcBopomofoUserDataPath,
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

        let string = data.toString("utf8");
        let lines = string.split("\n");
        // console.log("load user phrases");
        for (let line of lines) {
          console.log(line);
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
        // console.log("load user phrases");
        // console.log(map);
        this.inputController.setUserPhrases(map);
      } catch {
        console.error("Failed to parse user phrases");
      }
    });
  }

  private addPhrase(key: string, phrase: string): void {
    if (!fs.existsSync(this.mcBopomofoUserDataPath)) {
      console.log(
        "User data folder not found, creating " + this.mcBopomofoUserDataPath
      );
      console.log("Creating one");
      fs.mkdirSync(this.mcBopomofoUserDataPath);
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
    if (!fs.existsSync(this.mcBopomofoUserDataPath)) {
      console.log(
        "User data folder not found, creating " + this.mcBopomofoUserDataPath
      );
      console.log("Creating one");
      fs.mkdirSync(this.mcBopomofoUserDataPath);
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
    this.inputController.setCtrlEnterOption(this.settings.ctrl_enter_option);
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
    if (!fs.existsSync(this.mcBopomofoUserDataPath)) {
      console.log(
        "User data folder not found, creating " + this.mcBopomofoUserDataPath
      );
      console.log("Creating one");
      fs.mkdirSync(this.mcBopomofoUserDataPath);
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

  alreadyAddButton: boolean = false;

  public buttonUiResponse(isWindows8Above: boolean = false): any {
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
    let settingsIconPath = path.join(__dirname, "icons", "config.ico");
    let object: any = {};
    let changeButton: any[] = [];
    if (isWindows8Above) {
      changeButton.push({ icon: windowsModeIconPath, id: "windows-mode-icon" });
    }
    changeButton.push({ icon: windowsModeIconPath, id: "switch-lang" });
    object.changeButton = changeButton;

    if (!this.alreadyAddButton) {
      let addButton: any[] = [];
      if (isWindows8Above) {
        addButton.push({
          id: "windows-mode-icon",
          icon: windowsModeIconPath,
          commandId: PimeMcBopomofoCommand.modeIcon,
          tooltip: "中英文切換",
        });
      }

      addButton.push({
        id: "switch-lang",
        icon: windowsModeIconPath,
        commandId: PimeMcBopomofoCommand.switchLanguage,
        tooltip: "中英文切換",
      });
      addButton.push({
        id: "settings",
        icon: settingsIconPath,
        type: "menu",
        tooltip: "設定",
      });
      object.addButton = addButton;
      this.alreadyAddButton = true;
    }
    return object;
  }

  public customUiResponse(): any {
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
        break;
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
          let command = `"${python3}" "${script}" help`;
          console.log("Run " + command);
          child_process.exec(command);
        }
        break;
      case PimeMcBopomofoCommand.mcBopomofoUserDataFolder: {
        if (!fs.existsSync(pimeMcBopomofo.mcBopomofoUserDataPath)) {
          fs.mkdirSync(pimeMcBopomofo.mcBopomofoUserDataPath);
        }
        let url = pimeMcBopomofo.mcBopomofoUserDataPath;
        let command = `start ${url}`;
        console.log("Run " + command);
        child_process.exec(command);
        break;
      }
      case PimeMcBopomofoCommand.reloadUserPhrase:
        {
          pimeMcBopomofo.loadUserPhrases();
        }
        break;
      default:
        break;
    }
  }
}

const pimeMcBopomofo = new PimeMcBopomofo();

try {
  if (!fs.existsSync(pimeMcBopomofo.pimeUserDataPath)) {
    fs.mkdirSync(pimeMcBopomofo.pimeUserDataPath);
  }

  if (!fs.existsSync(pimeMcBopomofo.mcBopomofoUserDataPath)) {
    fs.mkdirSync(pimeMcBopomofo.mcBopomofoUserDataPath);
  }

  if (!fs.existsSync(pimeMcBopomofo.userSettingsPath)) {
    fs.writeFileSync(
      pimeMcBopomofo.userSettingsPath,
      JSON.stringify(defaultSettings)
    );
  }

  fs.watch(pimeMcBopomofo.userSettingsPath, (event, filename) => {
    if (filename) {
      pimeMcBopomofo.loadSettings();
    }
  });

  if (!fs.existsSync(pimeMcBopomofo.userPhrasesPath)) {
    fs.writeFileSync(pimeMcBopomofo.userPhrasesPath, "");
  }

  fs.watch(pimeMcBopomofo.userPhrasesPath, (event, filename) => {
    if (filename) {
      pimeMcBopomofo.loadUserPhrases();
    }
  });
} catch (e) {
  console.error(e);
}

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
    if (request.method === "close") {
      let response = Object.assign({}, responseTemplate, {
        removeButton: ["windows-mode-icon", "switch-lang", "settings"],
      });
      pimeMcBopomofo.alreadyAddButton = false;
      return response;
    }

    if (request.method === "onActivate") {
      let { isWindows8Above } = request;
      let customUi = pimeMcBopomofo.customUiResponse();
      let buttonUi = pimeMcBopomofo.buttonUiResponse(isWindows8Above);
      let response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === "onDeactivate") {
      let response = Object.assign({}, responseTemplate, {
        removeButton: ["windows-mode-icon", "switch-lang", "settings"],
      });
      pimeMcBopomofo.alreadyAddButton = false;
      return response;
    }

    if (request.method === "filterKeyUp") {
      if (
        lastRequest &&
        lastRequest.method === "filterKeyUp" &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }
      if (pimeMcBopomofo.isShiftHold) {
        pimeMcBopomofo.toggleAlphabetMode();
        pimeMcBopomofo.resetController();
        let uiState = pimeMcBopomofo.uiState;
        let customUi = pimeMcBopomofo.customUiResponse();
        let buttonUi = pimeMcBopomofo.buttonUiResponse(true);
        let response = Object.assign(
          {},
          responseTemplate,
          uiState,
          customUi,
          buttonUi
        );
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
        // NOTE: Some app, like MS Word, may send repeated key down event.
        // We should ignore such events.
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }
      pimeMcBopomofo.resetBeforeHandlingKey();

      let { keyCode, charCode, keyStates } = request;
      // Ignores caps lock.
      if ((keyStates[VK_Keys.VK_CAPITAL] & (1 << 7)) != 0) {
        pimeMcBopomofo.resetController();
        return false;
      }

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
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
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
      let customUi = pimeMcBopomofo.customUiResponse();
      let buttonUi = pimeMcBopomofo.buttonUiResponse(true);
      let response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === "onCompositionTerminated") {
      pimeMcBopomofo.resetController();
      let uiState = pimeMcBopomofo.uiState;
      let customUi = pimeMcBopomofo.customUiResponse();
      let buttonUi = pimeMcBopomofo.buttonUiResponse(true);
      let response = Object.assign(
        {},
        responseTemplate,
        uiState,
        customUi,
        buttonUi
      );
      pimeMcBopomofo.resetBeforeHandlingKey();
      return response;
    }

    if (request.method === "onCommand") {
      let { id } = request;
      pimeMcBopomofo.handleCommand(id);
      let uiState = pimeMcBopomofo.uiState;
      let customUi = pimeMcBopomofo.customUiResponse();
      let buttonUi = pimeMcBopomofo.buttonUiResponse(true);
      let response = Object.assign(
        {},
        responseTemplate,
        uiState,
        customUi,
        buttonUi
      );
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
          text: "輸入簡體中文",
          id: PimeMcBopomofoCommand.chineseConvert,
          checked: pimeMcBopomofo.settings.chineseConversion,
        },
        {
          text: "輸入半形標點",
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
        // {
        //   text: "重新載入使用者詞庫 (&U)",
        //   id: PimeMcBopomofoCommand.reloadUserPhrase,
        // },
        {
          text: "打開使用者資料夾",
          id: PimeMcBopomofoCommand.mcBopomofoUserDataFolder,
        },
      ];
      let response = Object.assign({}, responseTemplate, { return: menu });
      return response;
    }

    return responseTemplate;
  },
};
