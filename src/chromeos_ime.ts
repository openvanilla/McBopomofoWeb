/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import { InputController } from "./McBopomofo/InputController";
import { Key, KeyName } from "./McBopomofo/Key";
import { LargeSync } from "./LargeSync/LargeSync";

let largeSync = new LargeSync();

type ChromeMcBopomofoSettings = {
  layout: string;
  select_phrase: string;
  candidate_keys: string;
  esc_key_clear_entire_buffer: boolean;
  shift_key_toggle_alphabet_mode: boolean;
  chineseConversion: boolean;
  move_cursor: boolean;
  letter_mode: string;
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
    esc_key_clear_entire_buffer: false,
    shift_key_toggle_alphabet_mode: true,
    chineseConversion: false,
    move_cursor: true,
    letter_mode: "upper",
  };
  readonly settings: ChromeMcBopomofoSettings = {
    layout: "standard",
    select_phrase: "before_cursor",
    candidate_keys: "123456789",
    esc_key_clear_entire_buffer: false,
    shift_key_toggle_alphabet_mode: true,
    chineseConversion: false,
    move_cursor: true,
    letter_mode: "upper",
  };
  lang = "en";
  isShiftHold = false;
  isAlphabetMode = false;
  mcInputController: InputController;

  constructor() {
    chrome.i18n.getAcceptLanguages((langs) => {
      if (langs.length) {
        this.lang = langs[0];
        // Changes language needs to restarts ChromeOS login session so it won't
        // change until user logs in again. So, we can just set language code once
        // at the start.
        this.mcInputController.setLanguageCode(this.lang);
      }
    });
    this.mcInputController = new InputController(this.makeUI());
    this.mcInputController.setOnOpenUrl((input: string) => {
      this.tryOpen(input);
    });

    // The horizontal candidate windows on ChromeOS is actually broken so we
    // use the vertical one only.
    this.mcInputController.setUserVerticalCandidates(true);
  }

  myLocalizedString(en: string, zh: string): string {
    return this.lang === "zh-TW" ? zh : en;
  }

  loadSettings() {
    chrome.storage.sync.get("settings", (value) => {
      settings = value.settings;
      if (settings === undefined) {
        settings = defaultSettings;
      }
      if (
        this.settings.shift_key_toggle_alphabet_mode === undefined ||
        this.settings.shift_key_toggle_alphabet_mode === null
      ) {
        this.settings.shift_key_toggle_alphabet_mode = true;
      }

      this.mcInputController.setChineseConversionEnabled(
        this.settings.chineseConversion === true
      );
      this.mcInputController.setKeyboardLayout(this.settings.layout);
      this.mcInputController.setSelectPhrase(this.settings.select_phrase);
      let keys = this.settings.candidate_keys;
      if (keys == undefined) {
        keys = "123456789";
      }
      this.mcInputController.setCandidateKeys(this.settings.candidate_keys);
      this.mcInputController.setEscClearEntireBuffer(
        this.settings.esc_key_clear_entire_buffer
      );
      this.mcInputController.setMoveCursorAfterSelection(
        this.settings.move_cursor
      );
      this.mcInputController.setLetterMode(this.settings.letter_mode);
    });
  }

  loadUserPhrases() {
    largeSync.get(["user_phrase"], (value) => {
      let jsonString = value.user_phrase;

      if (jsonString !== undefined) {
        try {
          let obj = JSON.parse(jsonString);
          if (obj) {
            let userPhrases = new Map<string, string[]>(Object.entries(obj));
            this.mcInputController.setUserPhrases(userPhrases);
          }
        } catch (e) {
          console.log("failed to parse user_phrase:" + e);
        }
      }
    });
  }

  updateMenu() {
    if (this.engineID === undefined) return;
    let menus = [
      {
        id: "mcbopomofo-toggle-alphabet-mode",
        label: this.myLocalizedString("Input Letters", "輸入英文字母"),
        // chrome.i18n.getMessage("menuChineseConversion"),
        style: "check",
        checked: this.settings.chineseConversion === true,
      },

      {
        id: "mcbopomofo-chinese-conversion",
        label: this.myLocalizedString(
          "Input Simplified Chinese",
          "輸入簡體中文"
        ),
        // chrome.i18n.getMessage("menuChineseConversion"),
        style: "check",
        checked: this.settings.chineseConversion === true,
      },
      {
        id: "mcbopomofo-options",
        label: this.myLocalizedString("Options", "選項"),
        // chrome.i18n.getMessage("menuOptions"),
        style: "check",
      },
      {
        id: "mcbopomofo-user-phrase",
        label: this.myLocalizedString("User Phrases", "使用者詞彙"),
        // chrome.i18n.getMessage("menuUserPhrases"),
        style: "check",
      },
      {
        id: "mcbopomofo-help",
        label: this.myLocalizedString("Help...", "輔助說明…"),
        // chrome.i18n.getMessage("menuHelp"),
        style: "check",
      },
      {
        id: "mcbopomofo-homepage",
        label: this.myLocalizedString("Homepage", "專案首頁"),
        //  chrome.i18n.getMessage("homepage"),
        style: "check",
      },
    ];
    chrome.input.ime.setMenuItems({ engineID: this.engineID, items: menus });
  }

  toggleAlphabetMode() {
    this.isAlphabetMode = !this.isAlphabetMode;

    chrome.notifications.create("mcbopomofo-alphabet-mode" + Date.now(), {
      title: this.isAlphabetMode
        ? this.myLocalizedString("English Mode", "英文模式")
        : this.myLocalizedString("Chinese Mode", "中文模式"),

      message: "",
      type: "basic",
      iconUrl: "icons/icon48.png",
    });
  }

  toggleChineseConversion() {
    let checked = this.settings.chineseConversion;
    checked = !checked;
    this.settings.chineseConversion = checked;

    chrome.notifications.create("mcbopomofo-chinese-conversion" + Date.now(), {
      title: checked
        ? this.myLocalizedString("Chinese Conversion On", "簡繁轉換已開啟")
        : this.myLocalizedString("Chinese Conversion Off", "簡繁轉換已關閉"),

      message: "",
      type: "basic",
      iconUrl: "icons/icon48.png",
    });

    chrome.storage.sync.set({ settings: settings }, () => {
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

        let tabId = tabs[0].id;
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
      chromeMcBopomofo.context = undefined;
      chromeMcBopomofo.mcInputController.reset();
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

        let state = JSON.parse(stateString);
        let buffer = state.composingBuffer;
        let candidates = state.candidates;

        let segments = [];
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

        chrome.input.ime.setComposition({
          contextID: this.context.contextID,
          cursor: state.cursorIndex,
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

          let candidatePageCount = state.candidatePageCount;
          let candidatePageIndex = state.candidatePageIndex;
          let auxiliaryText = candidatePageIndex + "/" + candidatePageCount;

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
                candidate: this.myLocalizedString("Tooltip", "提示"),
                // chrome.i18n.getMessage("tooltip"),
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

chrome.input.ime.onActivate.addListener((engineID) => {
  chromeMcBopomofo.engineID = engineID;
  chromeMcBopomofo.loadSettings();
  chromeMcBopomofo.updateMenu();
  chromeMcBopomofo.loadUserPhrases();
  chromeMcBopomofo.mcInputController.setOnPhraseChange((userPhrases) => {
    const obj = Object.fromEntries(userPhrases);
    let jsonString = JSON.stringify(obj);
    largeSync.set({ user_phrase: jsonString }, () => {});
  });
});

// Called when the current text input are loses the focus.
chrome.input.ime.onBlur.addListener((context) => {
  // console.log("onBlur");
  chromeMcBopomofo.deferredReset();
});

chrome.input.ime.onReset.addListener((context) => {
  // console.log("onReset");
  chromeMcBopomofo.deferredReset();
});

// Called when the user switch to another input method.
chrome.input.ime.onDeactivated.addListener((context) => {
  // console.log("onDeactivated");
  if (chromeMcBopomofo.deferredResetTimeout != null) {
    clearTimeout(chromeMcBopomofo.deferredResetTimeout);
  }
  chromeMcBopomofo.context = undefined;
  chromeMcBopomofo.mcInputController.reset();
  chromeMcBopomofo.deferredResetTimeout = null;
});

// Called when the current text input is focused. We reload the settings this
// time.
chrome.input.ime.onFocus.addListener((context) => {
  // console.log("onFocus");
  chromeMcBopomofo.context = context;
  if (chromeMcBopomofo.deferredResetTimeout != null) {
    clearTimeout(chromeMcBopomofo.deferredResetTimeout);
  } else {
    loadSettings();
  }
});

// The main keyboard event handler.
chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
  if (keyData.type === "keyup") {
    // If we have a shift in a key down event, then a key up event with the
    // shift key, and there is no other key down event between them, it means it
    // is a single shift down/up, and we can let some users to use this to
    // toggle between Bopomofo mode and alphabet mode.
    if (keyData.key === "Shift" && chromeMcBopomofo.isShiftHold) {
      chromeMcBopomofo.isShiftHold = false;
      chromeMcBopomofo.toggleAlphabetMode();
      chromeMcBopomofo.mcInputController.reset();
      return;
    }
    return false;
  }

  if (keyData.type != "keydown") {
    return false;
  }

  let shouldHandleShift =
    chromeMcBopomofo.settings.shift_key_toggle_alphabet_mode === true;

  if (shouldHandleShift) {
    chromeMcBopomofo.isShiftHold = keyData.key === "Shift";
  }

  if (
    keyData.altKey ||
    keyData.ctrlKey ||
    keyData.altgrKey ||
    keyData.capsLock
  ) {
    return false;
  }

  if (chromeMcBopomofo.isAlphabetMode) {
    return false;
  }

  let keyEvent = KeyFromKeyboardEvent(keyData);
  return chromeMcBopomofo.mcInputController.mcbopomofoKeyEvent(keyEvent);
});

chrome.input.ime.onMenuItemActivated.addListener((engineID, name) => {
  if (name === "mcbopomofo-toggle-alphabet-mode") {
    chromeMcBopomofo.toggleAlphabetMode();
    return;
  }

  if (name === "mcbopomofo-chinese-conversion") {
    chromeMcBopomofo.toggleChineseConversion();
    return;
  }

  if (name === "mcbopomofo-options") {
    let page = "options.html";
    chromeMcBopomofo.tryOpen(chrome.runtime.getURL(page));
    return;
  }

  if (name === "mcbopomofo-user-phrase") {
    let page = "user_phrase.html";
    chromeMcBopomofo.tryOpen(chrome.runtime.getURL(page));
    return;
  }

  if (name === "mcbopomofo-help") {
    let page = "help/index.html";
    chromeMcBopomofo.tryOpen(chrome.runtime.getURL(page));
    return;
  }

  if (name === "mcbopomofo-homepage") {
    chromeMcBopomofo.tryOpen("https://mcbopomofo.openvanilla.org/");
    return;
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Reloads the user phrases by the message sent from "user_phrase.html".
  if (request.command === "reload_user_phrase") {
    loadUserPhrases();
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
keepAlive();

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = undefined;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: "*://*/*" })) {
    try {
      let args = {
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
  let key = new Key(event.key, keyName, event.shiftKey, event.ctrlKey);
  return key;
}
