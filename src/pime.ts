/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import { InputController } from "./McBopomofo/InputController";
import { InputUI } from "./McBopomofo/InputUI";
import { KeyFromKeyboardEvent, VK_Keys } from "./pime_keys";
import { List } from "lodash";
import child_process from "child_process";
import fs from "fs";
import path from "path";
import process from "process";
import { Empty } from "./McBopomofo/InputState";

/** The McBopomofo Settings. */
interface Settings {
  candidate_font_size: number;
  /** The keyboard layout. Valid options: "Standard", "Hsu", "ETen", "ETen26",
   * "IBM", "HanyuPinyin" */
  layout: string;
  /** "before_cursor" and "after_cursor". */
  select_phrase: string;
  /** The candidate keys like "123456789", "asdfghjkl" and so on. */
  candidate_keys: string;
  /** The number of candidate keys. */
  candidate_keys_count: number;
  /** Whether ESC key clears all of the composing buffer. */
  esc_key_clear_entire_buffer: boolean;
  /** Whether to use jk key to move cursor. */
  use_jk_key_to_move_cursor: boolean;
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
  /** The behavior for handling Ctrl+ Enter key. */
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
  candidate_font_size: 16,
  layout: "standard",
  select_phrase: "before_cursor",
  candidate_keys: "123456789",
  candidate_keys_count: 9,
  esc_key_clear_entire_buffer: false,
  shift_key_toggle_alphabet_mode: true,
  chineseConversion: false,
  move_cursor: true,
  letter_mode: "upper",
  half_width_punctuation: false,
  by_default_deactivated: false,
  beep_on_error: true,
  ctrl_enter_option: 0,
  use_jk_key_to_move_cursor: false,
};

enum PimeMcBopomofoCommand {
  ModeIcon = 0,
  SwitchLanguage = 1,
  OpenHomepage = 2,
  OpenBugReport = 3,
  OpenOptions = 4,
  EditUserPhrase = 5,
  ToggleChineseConversion = 6,
  ToggleHalfWidthPunctuation = 7,
  Help = 8,
  OpenMcBopomofoUserDataFolder = 9,
  ReloadUserPhrase = 10,
}

/** Wraps InputController and required states.  */
class PimeMcBopomofo {
  /** The input controller. */
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
  /** The settings in memory. */
  settings: Settings = defaultSettings;
  /**  Whether the input method is in Alphabet mode or Chinese mode. True for
   * Alphabet mode, false for Chinese mode. */
  isAlphabetMode: boolean = false;
  lastRequest: any = {};
  isLastFilterKeyDownHandled: boolean = false;
  isOpened: boolean = true;
  /** Helps to remember if Shift key is pressed on when key down event is
   * triggered. It would be reset on key on. */
  isShiftHold: boolean = false;
  /** Helps to remember if Caps Lock is on when key down event is triggered. It
   * would be reset on key on. */
  isCapsLockHold: boolean = false;
  // isScheduledToToggleAlphabetModeOnKeyUp: boolean = false;
  /** If the user presses a shortcut key, such as the key to toggle
   * Traditional/Simplifies Chinese, the flag should be set to true and then
   * update the input UI. */
  isScheduledToUpdateUi = false;

  constructor() {
    this.inputController = new InputController(this.makeUI(this));
    this.inputController.setUserVerticalCandidates(true);
    this.inputController.setOnOpenUrl((url: string) => {
      let command = `start "" "${url}"`;
      child_process.exec(command);
    });
    this.inputController.setOnPhraseAdded((key: string, phrase: string) => {
      this.addPhrase(key, phrase);
    });
    this.inputController.setOnError(() => {
      if (this.settings.beep_on_error) {
        child_process.exec(`rundll32 user32.dll,MessageBeep`);
      }
    });
    this.loadSettings(() => {
      this.isOpened = !this.settings.by_default_deactivated;
    });

    this.loadUserPhrases();
  }

  public resetBeforeHandlingKey(): void {
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
        let string = data.toString("utf8");
        this.inputController.setUserPhrases(string);
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
    // Changes the alphabet mode, also commits current composing buffer.
    this.isAlphabetMode = !this.isAlphabetMode;
    this.resetController();
  }

  public applySettings(): void {
    this.inputController.setKeyboardLayout(this.settings.layout);
    this.inputController.setSelectPhrase(this.settings.select_phrase);
    this.inputController.setCandidateKeys(this.settings.candidate_keys);
    this.inputController.setCandidateKeysCount(
      this.settings.candidate_keys_count
    );
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
    this.inputController.setUseJKToMoveCursor(
      this.settings.use_jk_key_to_move_cursor
    );
    this.inputController.setLanguageCode("zh-TW");
  }

  /** Load settings from disk */
  public loadSettings(callback: () => void): void {
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
  public writeSettings() {
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
  isWindows8Above: boolean = false;

  public buttonUiResponse(): any {
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
    if (this.isWindows8Above) {
      changeButton.push({ icon: windowsModeIconPath, id: "windows-mode-icon" });
    }
    changeButton.push({ icon: windowsModeIconPath, id: "switch-lang" });
    object.changeButton = changeButton;

    if (!this.alreadyAddButton) {
      let addButton: any[] = [];
      if (this.isWindows8Above) {
        addButton.push({
          id: "windows-mode-icon",
          icon: windowsModeIconPath,
          commandId: PimeMcBopomofoCommand.ModeIcon,
          tooltip: "中英文切換",
        });
      }

      addButton.push({
        id: "switch-lang",
        icon: windowsModeIconPath,
        commandId: PimeMcBopomofoCommand.SwitchLanguage,
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
    let fontSize = this.settings.candidate_font_size;
    if (fontSize == undefined) {
      fontSize = 16;
    } else if (fontSize < 10) {
      fontSize = 10;
    } else if (fontSize > 32) {
      fontSize = 32;
    }

    return {
      openKeyboard: this.isOpened,
      customizeUI: {
        candPerRow: 1,
        candFontSize: fontSize,
        candFontName: "Microsoft YaHei",
        candUseCursor: true,
      },
      setSelKeys: this.settings.candidate_keys,
      keyboardOpen: this.isOpened,
    };
  }

  public handleCommand(id: PimeMcBopomofoCommand): void {
    switch (id) {
      case PimeMcBopomofoCommand.ModeIcon:
      case PimeMcBopomofoCommand.SwitchLanguage:
        {
          if (this.isOpened === false) {
            return;
          }
          this.toggleAlphabetMode();
        }
        break;
      case PimeMcBopomofoCommand.OpenHomepage:
        {
          let url = "https://mcbopomofo.openvanilla.org/";
          let command = `start ${url}`;
          console.log("Run " + command);
          child_process.exec(command);
        }
        break;
      case PimeMcBopomofoCommand.OpenBugReport:
        {
          let url = "https://github.com/openvanilla/McBopomofoWeb/issues";
          let command = `start ${url}`;
          console.log("Run " + command);
          child_process.exec(command);
        }
        break;
      case PimeMcBopomofoCommand.OpenOptions:
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
      case PimeMcBopomofoCommand.EditUserPhrase: {
        let url = pimeMcBopomofo.userPhrasesPath;
        let command = `start ${url}`;
        console.log("Run " + command);
        child_process.exec(command);
        break;
      }
      case PimeMcBopomofoCommand.ToggleChineseConversion:
        pimeMcBopomofo.settings.chineseConversion =
          !pimeMcBopomofo.settings.chineseConversion;
        pimeMcBopomofo.applySettings();
        pimeMcBopomofo.writeSettings();
        break;
      case PimeMcBopomofoCommand.ToggleHalfWidthPunctuation:
        pimeMcBopomofo.settings.half_width_punctuation =
          !pimeMcBopomofo.settings.half_width_punctuation;
        pimeMcBopomofo.applySettings();
        pimeMcBopomofo.writeSettings();
        break;
      case PimeMcBopomofoCommand.Help:
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
      case PimeMcBopomofoCommand.OpenMcBopomofoUserDataFolder: {
        if (!fs.existsSync(pimeMcBopomofo.mcBopomofoUserDataPath)) {
          fs.mkdirSync(pimeMcBopomofo.mcBopomofoUserDataPath);
        }
        let url = pimeMcBopomofo.mcBopomofoUserDataPath;
        let command = `start ${url}`;
        console.log("Run " + command);
        child_process.exec(command);
        break;
      }
      case PimeMcBopomofoCommand.ReloadUserPhrase:
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
      pimeMcBopomofo.loadSettings(() => {});
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
      // console.log(
      //   "init ======================================================================================"
      // );

      let { isWindows8Above } = request;
      pimeMcBopomofo.isWindows8Above = isWindows8Above;
      let customUi = pimeMcBopomofo.customUiResponse();
      let response = Object.assign({}, responseTemplate, customUi, {
        removeButton: ["windows-mode-icon", "switch-lang", "settings"],
      });
      return response;
    }
    if (request.method === "close") {
      // console.log(
      //   "Close ======================================================================================"
      // );
      let response = Object.assign({}, responseTemplate, {
        removeButton: ["windows-mode-icon", "switch-lang", "settings"],
      });
      pimeMcBopomofo.alreadyAddButton = false;
      return response;
    }

    if (request.method === "onActivate") {
      let customUi = pimeMcBopomofo.customUiResponse();
      let buttonUi = pimeMcBopomofo.buttonUiResponse();
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

    if (request.method === "onPreservedKey") {
      console.log(request);
      let response = Object.assign({}, responseTemplate);
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
      // Single Shift to toggle alphabet mode.
      if (pimeMcBopomofo.isShiftHold) {
        pimeMcBopomofo.isScheduledToUpdateUi = true;
        pimeMcBopomofo.toggleAlphabetMode();
      }
      let response = Object.assign({}, responseTemplate, { return: true });
      return response;
    }

    if (request.method === "onKeyUp") {
      if (pimeMcBopomofo.isScheduledToUpdateUi) {
        pimeMcBopomofo.isScheduledToUpdateUi = false;
        let state = pimeMcBopomofo.inputController.state;
        let handled = state instanceof Empty === false;

        let uiState = pimeMcBopomofo.uiState;
        let customUi = pimeMcBopomofo.customUiResponse();
        let buttonUi = pimeMcBopomofo.buttonUiResponse();
        let response = Object.assign(
          responseTemplate,
          uiState,
          customUi,
          buttonUi,
          { return: handled }
        );
        return response;
      }
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

      let { keyCode, charCode, keyStates } = request;

      let key = KeyFromKeyboardEvent(
        keyCode,
        keyStates,
        String.fromCharCode(charCode),
        charCode
      );

      // console.log(key);
      if (
        key.ctrlPressed &&
        key.shiftPressed &&
        key.ascii >= "A" &&
        key.ascii <= "Z"
      ) {
        pimeMcBopomofo.isShiftHold = false;
        if (key.ascii === "G") {
          pimeMcBopomofo.settings.chineseConversion =
            !pimeMcBopomofo.settings.chineseConversion;
          pimeMcBopomofo.applySettings();
          pimeMcBopomofo.writeSettings();
        } else if (key.ascii === "H") {
          pimeMcBopomofo.settings.half_width_punctuation =
            !pimeMcBopomofo.settings.half_width_punctuation;
          pimeMcBopomofo.applySettings();
          pimeMcBopomofo.writeSettings();
        }
        pimeMcBopomofo.resetController();
        pimeMcBopomofo.isLastFilterKeyDownHandled = true;
        pimeMcBopomofo.isScheduledToUpdateUi = true;
        let response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }

      let shouldHandleShift =
        pimeMcBopomofo.settings.shift_key_toggle_alphabet_mode === true;

      var isPressingShiftOnly = key.ascii === "Shift";

      // Note: The way we detect if a user is trying to press a single Shift key
      // to toggle Alphabet/Chinese mode, is to check if there is any key other
      // than the Shift key is received before the key up event.
      //
      // We set isShiftHold to true here. It means the user is pressing Shift
      // key only. Then, if there is any other key coming, we will reset
      // isShiftHold. Finally, if isShiftHold is still true in the key up event,
      // we will toggle Alphabet/Chinese.
      if (shouldHandleShift) {
        pimeMcBopomofo.isShiftHold = isPressingShiftOnly;
      }
      if (isPressingShiftOnly) {
        let state = pimeMcBopomofo.inputController.state;
        let handled = state instanceof Empty === false;
        pimeMcBopomofo.isLastFilterKeyDownHandled = handled;
        let response = Object.assign({}, responseTemplate, {
          return: handled,
        });
        return response;
      } else {
        pimeMcBopomofo.isShiftHold = false;
      }

      pimeMcBopomofo.resetBeforeHandlingKey();

      if ((keyStates[VK_Keys.VK_CAPITAL] & 1) != 0) {
        // Ignores caps lock.
        pimeMcBopomofo.resetController();
        pimeMcBopomofo.isCapsLockHold = true;
        pimeMcBopomofo.isLastFilterKeyDownHandled = false;
        let response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      } else {
        pimeMcBopomofo.isCapsLockHold = false;
      }

      if (pimeMcBopomofo.isAlphabetMode) {
        let response = Object.assign({}, responseTemplate, { return: false });
        return response;
      }

      let handled = pimeMcBopomofo.inputController.mcbopomofoKeyEvent(key);
      pimeMcBopomofo.isLastFilterKeyDownHandled = handled;
      let response = Object.assign({}, responseTemplate, {
        return: handled,
      });
      return response;
    }

    if (request.method === "onKeyDown") {
      // Ignore caps lock.
      if (pimeMcBopomofo.isCapsLockHold) {
        pimeMcBopomofo.resetController();
        let response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

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
      if (pimeMcBopomofo.isScheduledToUpdateUi) {
        pimeMcBopomofo.isScheduledToUpdateUi = false;
        let customUi = pimeMcBopomofo.customUiResponse();
        let buttonUi = pimeMcBopomofo.buttonUiResponse();
        response = Object.assign({}, response, customUi, buttonUi);
      }
      return response;
    }

    if (request.method === "onKeyboardStatusChanged") {
      let { opened } = request;
      pimeMcBopomofo.isOpened = opened;
      pimeMcBopomofo.resetController();
      let customUi = pimeMcBopomofo.customUiResponse();
      let buttonUi = pimeMcBopomofo.buttonUiResponse();
      let response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === "onCompositionTerminated") {
      pimeMcBopomofo.resetController();
      let uiState = pimeMcBopomofo.uiState;
      let customUi = pimeMcBopomofo.customUiResponse();
      let buttonUi = pimeMcBopomofo.buttonUiResponse();
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
      let buttonUi = pimeMcBopomofo.buttonUiResponse();
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
      let menu = [
        {
          text: "小麥注音輸入法網站",
          id: PimeMcBopomofoCommand.OpenHomepage,
        },
        {
          text: "問題回報",
          id: PimeMcBopomofoCommand.OpenBugReport,
        },
        {
          text: "輔助說明",
          id: PimeMcBopomofoCommand.Help,
        },
        {},
        {
          text: "輸入簡體中文",
          id: PimeMcBopomofoCommand.ToggleChineseConversion,
          checked: pimeMcBopomofo.settings.chineseConversion,
        },
        {
          text: "輸入半形標點",
          id: PimeMcBopomofoCommand.ToggleHalfWidthPunctuation,
          checked: pimeMcBopomofo.settings.half_width_punctuation,
        },
        {},
        {
          text: "偏好設定 (&O)",
          id: PimeMcBopomofoCommand.OpenOptions,
        },
        {
          text: "編輯使用者詞庫 (&U)",
          id: PimeMcBopomofoCommand.EditUserPhrase,
        },
        {
          text: "打開使用者資料夾",
          id: PimeMcBopomofoCommand.OpenMcBopomofoUserDataFolder,
        },
      ];
      let response = Object.assign({}, responseTemplate, { return: menu });
      return response;
    }

    return responseTemplate;
  },
};
