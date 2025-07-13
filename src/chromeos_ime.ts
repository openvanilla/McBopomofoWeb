/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import {
  InputController,
  MovingCursorOption,
} from "./McBopomofo/InputController";
import { Service } from "./McBopomofo/Service";
import { Key, KeyName } from "./McBopomofo/Key";
import { LargeSync } from "./LargeSync/LargeSync";
const ChineseConvert = require("chinese_convert");

const largeSync = new LargeSync();

type ChromeMcBopomofoSettings = {
  /** The keyboard layout. */
  layout: string;
  /** Whether to select the phrase before or after the cursor. */
  select_phrase: string;
  /** The keys to select candidates. */
  candidate_keys: string;
  /** The number of candidate keys. */
  candidate_keys_count: number;
  /** Whether to clear the entire buffer when the Esc key is pressed. */
  esc_key_clear_entire_buffer: boolean;
  /** Whether to toggle alphabet mode when the Shift key is pressed. */
  shift_key_toggle_alphabet_mode: boolean;
  /** Whether to enable Chinese conversion. */
  chinese_conversion: boolean;
  /** Whether to move the cursor after selection. */
  move_cursor: boolean;
  /** The letter mode. */
  letter_mode: string;
  /** The Ctrl+Enter option. */
  ctrl_enter_option: number;
  /** Whether to enable half-width punctuation. */
  half_width_punctuation_enabled: boolean;
  /** Whether to use J/K keys to move the cursor when the candidate window appears. */
  moving_cursor_option: MovingCursorOption;
  /** Whether to use notification. */
  use_notification: boolean;
  /** Whether to use repeated punctuation to choose candidate. */
  repeated_punctuation_choose_candidate: boolean;
};

class ChromeMcBopomofo {
  // The ID of the current input engine.
  engineID: string | undefined = undefined;

  // The current input context.
  context: chrome.input.ime.InputContext | undefined = undefined;

  // The default settings.
  readonly defaultSettings: ChromeMcBopomofoSettings = {
    layout: "standard",
    select_phrase: "before_cursor",
    candidate_keys: "123456789",
    candidate_keys_count: 9,
    esc_key_clear_entire_buffer: false,
    shift_key_toggle_alphabet_mode: true,
    chinese_conversion: false,
    move_cursor: false,
    letter_mode: "upper",
    ctrl_enter_option: 0,
    half_width_punctuation_enabled: false,
    moving_cursor_option: MovingCursorOption.Disabled,
    use_notification: true,
    repeated_punctuation_choose_candidate: false,
  };
  settings: ChromeMcBopomofoSettings = {
    layout: "standard",
    select_phrase: "before_cursor",
    candidate_keys: "123456789",
    candidate_keys_count: 9,
    esc_key_clear_entire_buffer: false,
    shift_key_toggle_alphabet_mode: true,
    chinese_conversion: false,
    move_cursor: false,
    letter_mode: "upper",
    ctrl_enter_option: 0,
    half_width_punctuation_enabled: false,
    moving_cursor_option: MovingCursorOption.Disabled,
    use_notification: true,
    repeated_punctuation_choose_candidate: false,
  };
  lang = "en";
  isShiftHold = false;
  isAlphabetMode = false;
  inputController: InputController;
  service: Service;

  constructor() {
    chrome.i18n.getAcceptLanguages((langs) => {
      if (langs.length) {
        this.lang = langs[0];
        // Changes language needs to restarts ChromeOS login session so it won't
        // change until user logs in again. So, we can just set language code once
        // at the start.
        this.inputController.setLanguageCode(this.lang);
      }
    });
    this.inputController = new InputController(this.makeUI());
    this.service = new Service();
    this.inputController.setOnOpenUrl((input: string) => {
      this.tryOpen(input);
    });
    this.inputController.setOnError(() => {});

    // The horizontal candidate windows on ChromeOS is actually broken so we
    // use the vertical one only.
    this.inputController.setUserVerticalCandidates(true);
  }

  loadSettings() {
    chrome.storage.sync.get("settings", (value) => {
      this.settings = value.settings;
      if (this.settings === undefined) {
        this.settings = this.defaultSettings;
      }
      if (
        this.settings.shift_key_toggle_alphabet_mode === undefined ||
        this.settings.shift_key_toggle_alphabet_mode === null
      ) {
        this.settings.shift_key_toggle_alphabet_mode = true;
      }
      if (
        this.settings.use_notification === undefined ||
        this.settings.use_notification === null
      ) {
        this.settings.use_notification = true;
      }

      this.inputController.setChineseConversionEnabled(
        this.settings.chinese_conversion === true
      );
      this.inputController.setKeyboardLayout(this.settings.layout);
      this.inputController.setSelectPhrase(this.settings.select_phrase);
      let keys = this.settings.candidate_keys;
      if (keys == undefined) {
        keys = "123456789";
      }
      this.inputController.setCandidateKeys(this.settings.candidate_keys);
      this.inputController.setEscClearEntireBuffer(
        this.settings.esc_key_clear_entire_buffer
      );
      this.inputController.setMoveCursorAfterSelection(
        this.settings.move_cursor
      );
      this.inputController.setLetterMode(this.settings.letter_mode);
      this.inputController.setCtrlEnterOption(this.settings.ctrl_enter_option);
      this.inputController.setHalfWidthPunctuationEnabled(
        this.settings.half_width_punctuation_enabled
      );
      this.inputController.setCandidateKeysCount(
        this.settings.candidate_keys_count
      );
      this.inputController.setMovingCursorOption(
        this.settings.moving_cursor_option
      );
      this.inputController.setRepeatedPunctuationChooseCandidate(
        this.settings.repeated_punctuation_choose_candidate
      );
    });
  }

  loadUserPhrases() {
    largeSync.get(["user_phrase"], (value) => {
      // On ChromeOS, we store the user phrases in JSON format, but
      // the editor convert the JSON to phrases per line.
      const jsonString = value.user_phrase;
      if (jsonString !== undefined) {
        try {
          const obj = JSON.parse(jsonString);
          if (obj) {
            const userPhrases = new Map<string, string[]>(Object.entries(obj));
            this.inputController.setUserPhrases(userPhrases);
          }
        } catch (e) {
          console.log("failed to parse user_phrase:" + e);
        }
      }
    });
  }

  loadExcludedPhrases() {
    largeSync.get(["excluded_phrase"], (value) => {
      // On ChromeOS, we store the user phrases in JSON format, but
      // the editor convert the JSON to phrases per line.
      const jsonString = value.user_phrase;
      if (jsonString !== undefined) {
        try {
          const obj = JSON.parse(jsonString);
          if (obj) {
            const userPhrases = new Map<string, string[]>(Object.entries(obj));
            this.inputController.setExcludedPhrases(userPhrases);
          }
        } catch (e) {
          console.log("failed to parse excluded_phrase:" + e);
        }
      }
    });
  }

  updateMenu() {
    if (this.engineID === undefined) return;
    const menus = [
      {
        id: "mcbopomofo-toggle-alphabet-mode",
        label: chrome.i18n.getMessage("menuAlphabetMode"),
        style: "check",
        checked: this.isAlphabetMode === true,
      },
      {
        id: "mcbopomofo-chinese-conversion",
        label: chrome.i18n.getMessage("menuChineseConversion"),
        style: "check",
        checked: this.settings.chinese_conversion === true,
      },
      {
        id: "mcbopomofo-half-width-punctuation",
        label: chrome.i18n.getMessage("menuHalfWidthPunctuation"),
        style: "check",
        checked: this.settings.half_width_punctuation_enabled === true,
      },
      {
        id: "mcbopomofo-options",
        label: chrome.i18n.getMessage("menuOptions"),
        style: "check",
      },
      {
        id: "mcbopomofo-user-phrase",
        label: chrome.i18n.getMessage("menuUserPhrases"),
        style: "check",
      },
      {
        id: "mcbopomofo-help",
        label: chrome.i18n.getMessage("menuHelp"),
        style: "check",
      },
      {
        id: "mcbopomofo-homepage",
        label: chrome.i18n.getMessage("homepage"),
        style: "check",
      },
    ];
    chrome.input.ime.setMenuItems({ engineID: this.engineID, items: menus });
  }

  toggleAlphabetMode() {
    if (this.engineID === undefined) return;
    this.isAlphabetMode = !this.isAlphabetMode;

    if (this.settings.use_notification) {
      const notificationId = "mcbopomofo-alphabet-mode";
      chrome.notifications.clear(notificationId, () => {
        chrome.notifications.create(notificationId, {
          title: this.isAlphabetMode
            ? chrome.i18n.getMessage("alphabet_mode")
            : chrome.i18n.getMessage("chinese_mode"),
          message: "",
          type: "basic",
          iconUrl: "icons/icon48.png",
        });
      });
    }
  }

  toggleChineseConversion() {
    let checked = this.settings.chinese_conversion;
    checked = !checked;
    this.settings.chinese_conversion = checked;
    this.inputController.setChineseConversionEnabled(checked);

    if (this.settings.use_notification) {
      const notificationId = "mcbopomofo-chinese-conversion";
      chrome.notifications.clear(notificationId, () => {
        chrome.notifications.create(notificationId, {
          title: checked
            ? chrome.i18n.getMessage("chinese_conversion_on")
            : chrome.i18n.getMessage("chinese_conversion_off"),

          message: "",
          type: "basic",
          iconUrl: "icons/icon48.png",
        });
      });
    }

    chrome.storage.sync.set({ settings: this.settings }, () => {
      if (this.engineID === undefined) return;
      if (this.context === undefined) return;

      this.loadSettings();
      this.updateMenu();
    });
  }

  toggleHalfWidthPunctuation() {
    let checked = this.settings.half_width_punctuation_enabled;
    checked = !checked;
    this.settings.half_width_punctuation_enabled = checked;
    this.inputController.setHalfWidthPunctuationEnabled(checked);

    chrome.notifications.create(
      "mcbopomofo-half-width-punctuation" + Date.now(),
      {
        title: checked
          ? chrome.i18n.getMessage("using_half_width_punctuation")
          : chrome.i18n.getMessage("using_full_width_punctuation"),

        message: "",
        type: "basic",
        iconUrl: "icons/icon48.png",
      }
    );

    chrome.storage.sync.set({ settings: this.settings }, () => {
      if (this.engineID === undefined) return;
      if (this.context === undefined) return;

      this.loadSettings();
      this.updateMenu();
    });
  }

  tryOpen(url: string) {
    chrome.windows.getCurrent({}, (win) => {
      if (win === undefined) {
        chrome.windows.create({ url: url, focused: true });
        return;
      }

      chrome.tabs.query({ url: url }).then((tabs) => {
        if (tabs.length === 0) {
          chrome.tabs.create({ active: true, url: url });
          return;
        }

        const tabId = tabs[0].id;
        if (tabId !== undefined) {
          chrome.tabs.update(tabId, { selected: true });
        }
      });
    });
  }

  deferredResetTimeout?: NodeJS.Timeout | null = null;

  // Sometimes onBlur is called unexpectedly. It might be called and then a
  // onFocus comes suddenly when a user is typing contents continuously. Such
  // behaviour causes the input to be interrupted.
  //
  // To prevent the issue, we ignore such event if an onFocus comes very quickly.
  deferredReset() {
    if (this.deferredResetTimeout != null) {
      clearTimeout(this.deferredResetTimeout);
      this.deferredResetTimeout = null;
    }

    this.deferredResetTimeout = setTimeout(() => {
      this.inputController.reset();
      this.deferredResetTimeout = null;
    }, 5000);
  }

  makeUI() {
    return {
      reset: () => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;
        try {
          // The context might be destroyed by the time we reset it, so we use a
          // try/catch block here.
          chrome.input.ime.clearComposition({
            contextID: this.context.contextID,
          });
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: "",
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        } catch (e) {}
      },

      commitString: (text: string) => {
        if (this.context === undefined) return;
        chrome.input.ime.commitText({
          contextID: this.context.contextID,
          text: text,
        });
      },

      update: (stateString: string) => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;

        const state = JSON.parse(stateString);
        const buffer = state.composingBuffer;
        const candidates = state.candidates;

        const segments = [];
        let text = "";
        let selectionStart: number | undefined = undefined;
        let selectionEnd: number | undefined = undefined;
        let index = 0;
        for (let item of buffer) {
          text += item.text;
          if (item.style === "highlighted") {
            selectionStart = index;
            selectionEnd = index + item.text.length;
            let segment = {
              start: index,
              end: index + item.text.length,
              style: "doubleUnderline",
            };
            segments.push(segment);
          } else {
            let segment = {
              start: index,
              end: index + item.text.length,
              style: "underline",
            };
            segments.push(segment);
          }
          index += item.text.length;
        }

        // This shall not happen, but we make sure the cursor index to be not
        // larger than the text length.
        let localCursorIndex = state.cursorIndex;
        if (localCursorIndex > text.length) {
          localCursorIndex = text.length;
        }

        chrome.input.ime.setComposition({
          contextID: this.context.contextID,
          cursor: localCursorIndex,
          segments: segments,
          text: text,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
        });

        if (candidates.length) {
          let chromeCandidates = [];
          let index = 0;
          let selectedIndex = 0;
          for (let candidate of state.candidates) {
            if (candidate.selected) {
              selectedIndex = index;
            }
            let item = {
              candidate: candidate.candidate.displayedText,
              annotation: "",
              id: index++,
              label: candidate.keyCap,
            };
            chromeCandidates.push(item);
          }

          const candidatePageCount = state.candidatePageCount;
          const candidatePageIndex = state.candidatePageIndex;
          const auxiliaryText = candidatePageIndex + "/" + candidatePageCount;

          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: auxiliaryText,
              auxiliaryTextVisible: true,
              visible: true,
              cursorVisible: true,
              vertical: true,
              pageSize: candidates.length,
            },
          });

          chrome.input.ime.setCandidates({
            contextID: this.context.contextID,
            candidates: chromeCandidates,
          });

          chrome.input.ime.setCursorPosition({
            contextID: this.context.contextID,
            candidateID: selectedIndex,
          });
        } else if (state.tooltip.length) {
          // Use the candidate window to tooltips.
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: state.tooltip,
              auxiliaryTextVisible: true,
              visible: true,
              cursorVisible: false,
              windowPosition: "composition",
              pageSize: 1, // pageSize has to be at least 1 otherwise ChromeOS crashes.
            },
          });

          chrome.input.ime.setCandidates({
            contextID: this.context.contextID,
            candidates: [
              {
                candidate: chrome.i18n.getMessage("tooltip"),
                annotation: "",
                id: 0,
                label: " ",
              },
            ],
          });
        } else {
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: "",
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        }
      },
    };
  }
}

let chromeMcBopomofo = new ChromeMcBopomofo();

chrome.input?.ime.onActivate.addListener((engineID) => {
  chromeMcBopomofo.engineID = engineID;
  chromeMcBopomofo.loadSettings();
  chromeMcBopomofo.updateMenu();
  chromeMcBopomofo.loadUserPhrases();
  chromeMcBopomofo.inputController.setOnPhraseChange((userPhrases) => {
    const obj = Object.fromEntries(userPhrases);
    let jsonString = JSON.stringify(obj);
    largeSync.set({ user_phrase: jsonString }, () => {});
  });
  chromeMcBopomofo.inputController.setOnExcludedPhraseChange((userPhrases) => {
    const obj = Object.fromEntries(userPhrases);
    let jsonString = JSON.stringify(obj);
    largeSync.set({ excluded_phrase: jsonString }, () => {});
  });
});

// Called when the current text input are loses the focus.
chrome.input?.ime.onBlur.addListener((context) => {
  chromeMcBopomofo.deferredReset();
});

chrome.input?.ime.onReset.addListener((context) => {
  chromeMcBopomofo.deferredReset();
});

// Called when the user switch to another input method.
chrome.input?.ime.onDeactivated.addListener((context) => {
  if (chromeMcBopomofo.deferredResetTimeout != null) {
    clearTimeout(chromeMcBopomofo.deferredResetTimeout);
  }
  chromeMcBopomofo.context = undefined;
  chromeMcBopomofo.inputController.reset();
  chromeMcBopomofo.deferredResetTimeout = null;
});

// Called when the current text input is focused. We reload the settings this
// time.
chrome.input?.ime.onFocus.addListener((context) => {
  chromeMcBopomofo.context = context;
  if (chromeMcBopomofo.deferredResetTimeout != null) {
    clearTimeout(chromeMcBopomofo.deferredResetTimeout);
  } else {
    chromeMcBopomofo.loadSettings();
  }
});

// The main keyboard event handler.
chrome.input?.ime.onKeyEvent.addListener((engineID, keyData) => {
  chromeMcBopomofo.engineID = engineID;
  if (keyData.type === "keyup") {
    // If we have a shift in a key down event, then a key up event with the
    // shift key, and there is no other key down event between them, it means it
    // is a single shift down/up, and we can let some users to use this to
    // toggle between Bopomofo mode and alphabet mode.
    if (keyData.key === "Shift" && chromeMcBopomofo.isShiftHold) {
      chromeMcBopomofo.isShiftHold = false;
      chromeMcBopomofo.inputController.reset();
      chromeMcBopomofo.toggleAlphabetMode();
      return true;
    }
    return false;
  }

  if (keyData.type != "keydown") {
    return false;
  }

  // We always prevent handling Ctrl + Space so we can switch input methods.
  if (keyData.ctrlKey && keyData.code === "Space") {
    chromeMcBopomofo.inputController.reset();
    return false;
  }

  const shouldHandleShift =
    chromeMcBopomofo.settings.shift_key_toggle_alphabet_mode === true;

  if (shouldHandleShift) {
    chromeMcBopomofo.isShiftHold = keyData.key === "Shift";
  }

  if (keyData.altKey || keyData.altgrKey || keyData.capsLock) {
    return false;
  }

  if (chromeMcBopomofo.isAlphabetMode) {
    return false;
  }

  const keyEvent = KeyFromKeyboardEvent(keyData);
  return chromeMcBopomofo.inputController.mcbopomofoKeyEvent(keyEvent);
});

chrome.input?.ime.onMenuItemActivated.addListener((engineID, name) => {
  switch (name) {
    case "mcbopomofo-toggle-alphabet-mode":
      chromeMcBopomofo.inputController.reset();
      chromeMcBopomofo.toggleAlphabetMode();
      break;
    case "mcbopomofo-chinese-conversion":
      chromeMcBopomofo.inputController.reset();
      chromeMcBopomofo.toggleChineseConversion();
      break;
    case "mcbopomofo-half-width-punctuation":
      chromeMcBopomofo.toggleHalfWidthPunctuation();
      break;
    case "mcbopomofo-options":
      chromeMcBopomofo.tryOpen(chrome.runtime.getURL("options.html"));
      break;
    case "mcbopomofo-user-phrase":
      chromeMcBopomofo.tryOpen(chrome.runtime.getURL("user_phrase.html"));
      break;
    case "mcbopomofo-help":
      chromeMcBopomofo.tryOpen(chrome.runtime.getURL("help/index.html"));
      break;
    case "mcbopomofo-homepage":
      chromeMcBopomofo.tryOpen("https://mcbopomofo.openvanilla.org/");
      break;
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Reloads the user phrases by the message sent from "user_phrase.html".
  if (request.command === "reload_user_phrase") {
    chromeMcBopomofo.loadUserPhrases();
    chromeMcBopomofo.loadExcludedPhrases();
    sendResponse({ status: "ok" });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-chinese-convert") {
    chromeMcBopomofo.toggleChineseConversion();
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "keepAlive") {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

// A workaround to prevent Chrome to kill the service worker.
let lifeline: chrome.runtime.Port | undefined = undefined;

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = undefined;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: "*://*/*" })) {
    try {
      const args = {
        target: { tabId: tab.id ?? 9 },
        func: () => chrome.runtime.connect({ name: "keepAlive" }),
      };
      await chrome.scripting.executeScript(args);
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(
  tabId: number,
  info: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

keepAlive();

chrome.contextMenus.onClicked.addListener((event, tab) => {
  function handle(selectionText: string, menuItemId: string, tabId: number) {
    // console.log(selectionText);
    if (selectionText.length === 0) {
      return;
    }
    let converted = selectionText;
    let isHtml = false;

    if (menuItemId === "convert_text_to_bpmf_syllables") {
      const lines = selectionText.split("\n");
      let convertedLines = [];
      for (let line of lines) {
        let convertedLine = ChineseConvert.cn2tw(line);
        convertedLine =
          chromeMcBopomofo.service.convertTextToBpmfReadings(convertedLine);
        convertedLines.push(convertedLine);
      }
      converted = convertedLines.join("\n");
    } else if (menuItemId === "append_bpmf_syllables_to_text") {
      const lines = selectionText.split("\n");
      let convertedLines = [];
      for (let line of lines) {
        let convertedLine = ChineseConvert.cn2tw(line);
        convertedLine =
          chromeMcBopomofo.service.appendBpmfReadingsToText(convertedLine);
        convertedLines.push(convertedLine);
      }
      converted = convertedLines.join("\n");
    } else if (menuItemId === "convert_text_to_html_ruby") {
      const lines = selectionText.split("\n");
      let convertedLines = [];
      for (let line of lines) {
        let convertedLine = ChineseConvert.cn2tw(line);
        convertedLine =
          "<p>" +
          chromeMcBopomofo.service.convertTextToHtmlRuby(convertedLine) +
          "</p>";
        convertedLines.push(convertedLine);
      }
      converted = convertedLines.join("\n");

      isHtml = true;
    } else if (menuItemId === "append_taiwanese_braille") {
      const lines = selectionText.split("\n");
      let convertedLines = [];
      for (let line of lines) {
        let convertedLine = ChineseConvert.cn2tw(line);
        convertedLine =
          line +
          "\n\n" +
          chromeMcBopomofo.service.convertTextToBraille(convertedLine);
        convertedLines.push(convertedLine);
      }
      converted = convertedLines.join("\n");
    } else if (menuItemId === "convert_text_to_taiwanese_braille") {
      const lines = selectionText.split("\n");
      let convertedLines = [];
      for (let line of lines) {
        let convertedLine = ChineseConvert.cn2tw(line);
        convertedLine = chromeMcBopomofo.service.convertTextToBraille(line);
        convertedLines.push(convertedLine);
      }
      converted = convertedLines.join("\n");
    } else if (menuItemId === "convert_taiwanese_braille_to_text") {
      const lines = selectionText.split("\n");
      let convertedLines = [];
      for (let line of lines) {
        const convertedLine =
          chromeMcBopomofo.service.convertBrailleToText(line);
        convertedLines.push(convertedLine);
      }
      converted = convertedLines.join("\n");
    } else if (menuItemId === "convert_text_to_hanyu_pinyin") {
      const lines = selectionText.split("\n");
      let convertedLines = [];
      for (let line of lines) {
        let convertedLine = ChineseConvert.cn2tw(line);
        convertedLine =
          chromeMcBopomofo.service.convertTextToPinyin(convertedLine);
        convertedLines.push(convertedLine);
      }
      converted = convertedLines.join("\n");
    }

    chrome.tabs.sendMessage(tabId, {
      command: "replace_text",
      text: converted,
      isHtml: isHtml,
    });
  }

  const menuItemId = event.menuItemId;
  const tabId = (tab as chrome.tabs.Tab).id;
  if (tabId === undefined) {
    return;
  }

  const selected = event.selectionText;
  if (selected === undefined) {
    return;
  }
  handle(selected, menuItemId as string, tabId as number);
});

chrome.contextMenus.create({
  id: "convert_text_to_bpmf_syllables",
  title: chrome.i18n.getMessage("convert_text_to_bpmf_syllables"),
  contexts: ["selection", "editable"],
});

chrome.contextMenus.create({
  id: "append_bpmf_syllables_to_text",
  title: chrome.i18n.getMessage("append_bpmf_syllables_to_text"),
  contexts: ["selection", "editable"],
});

chrome.contextMenus.create({
  id: "convert_text_to_html_ruby",
  title: chrome.i18n.getMessage("convert_text_to_html_ruby"),
  contexts: ["selection", "editable"],
});

chrome.contextMenus.create({
  id: "append_taiwanese_braille",
  title: chrome.i18n.getMessage("append_taiwanese_braille"),
  contexts: ["selection", "editable"],
});

chrome.contextMenus.create({
  id: "convert_text_to_taiwanese_braille",
  title: chrome.i18n.getMessage("convert_text_to_taiwanese_braille"),
  contexts: ["selection", "editable"],
});

chrome.contextMenus.create({
  id: "convert_taiwanese_braille_to_text",
  title: chrome.i18n.getMessage("convert_taiwanese_braille_to_text"),
  contexts: ["selection", "editable"],
});

chrome.contextMenus.create({
  id: "convert_text_to_hanyu_pinyin",
  title: chrome.i18n.getMessage("convert_text_to_hanyu_pinyin"),
  contexts: ["selection", "editable"],
});

function KeyFromKeyboardEvent(event: chrome.input.ime.KeyboardEvent) {
  let keyName = KeyName.UNKNOWN;
  switch (event.code) {
    case "ArrowLeft":
      keyName = KeyName.LEFT;
      break;
    case "ArrowRight":
      keyName = KeyName.RIGHT;
      break;
    case "ArrowUp":
      keyName = KeyName.UP;
      break;
    case "ArrowDown":
      keyName = KeyName.DOWN;
      break;
    case "Home":
      keyName = KeyName.HOME;
      break;
    case "End":
      keyName = KeyName.END;
      break;
    case "Backspace":
      keyName = KeyName.BACKSPACE;
      break;
    case "Delete":
      keyName = KeyName.DELETE;
      break;
    case "Enter":
      keyName = KeyName.RETURN;
      break;
    case "Escape":
      keyName = KeyName.ESC;
      break;
    case "Space":
      keyName = KeyName.SPACE;
      break;
    case "Tab":
      keyName = KeyName.TAB;
      break;
    case "PageUp":
      keyName = KeyName.PAGE_UP;
      break;
    case "PageDown":
      keyName = KeyName.PAGE_DOWN;
      break;
    default:
      keyName = KeyName.ASCII;
      break;
  }
  const key = new Key(event.key, keyName, event.shiftKey, event.ctrlKey);
  return key;
}
