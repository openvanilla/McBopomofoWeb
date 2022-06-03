var mcInputController = null;
var mcContext = null;
var settings = null;

window.onload = () => {
  const { InputController } = window.mcbopomofo;

  function makeUI(engineID) {
    let that = {};
    that.engineID = engineID;

    that.reset = () => {
      chrome.input.ime.clearComposition({ contextID: mcContext.contextID });
      chrome.input.ime.setCandidateWindowProperties({
        engineID: that.engineID,
        properties: {
          auxiliaryText: "",
          auxiliaryTextVisible: false,
          visible: false,
        },
      });
    };

    that.commitString = (string) => {
      chrome.input.ime.commitText({
        contextID: mcContext.contextID,
        text: string,
      });
    };

    that.update = (string) => {
      let state = JSON.parse(string);
      let buffer = state.composingBuffer;
      let candidates = state.candidates;

      let segments = [];
      let text = "";
      let selectionStart = null;
      let selectionEnd = null;
      let index = 0;
      for (let item of buffer) {
        text += item.text;
        if (item.style === "highlighted") {
          selectionStart = index;
          selectionEnd = index + item.text.length;
          var segment = {
            start: index,
            end: index + item.text.length,
            style: "doubleUnderline",
          };
          segments.push(segment);
        } else {
          var segment = {
            start: index,
            end: index + item.text.length,
            style: "underline",
          };
          segments.push(segment);
        }
        index += item.text.length;
      }

      chrome.input.ime.setComposition({
        contextID: mcContext.contextID,
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
          var item = {};
          item.candidate = candidate.candidate;
          item.annotation = "";
          item.id = index++;
          item.label = candidate.keyCap;
          chromeCandidates.push(item);
        }

        chrome.input.ime.setCandidateWindowProperties({
          engineID: that.engineID,
          properties: {
            auxiliaryText: "",
            auxiliaryTextVisible: false,
            visible: true,
            cursorVisible: true,
            vertical: true,
            pageSize: candidates.length,
          },
        });

        chrome.input.ime.setCandidates({
          contextID: mcContext.contextID,
          candidates: chromeCandidates,
        });

        chrome.input.ime.setCursorPosition({
          contextID: mcContext.contextID,
          candidateID: selectedIndex,
        });
      } else if (state.tooltip.length) {
        // Use the candidate window to tooltips.
        chrome.input.ime.setCandidateWindowProperties({
          engineID: that.engineID,
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
          contextID: mcContext.contextID,
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
          engineID: that.engineID,
          properties: {
            auxiliaryText: "",
            auxiliaryTextVisible: false,
            visible: false,
          },
        });
      }
    };
    return that;
  }

  function loadUserPhrases() {
    chrome.storage.sync.get("user_phrase", (value) => {
      let jsonString = value.user_phrase;

      if (jsonString !== undefined) {
        try {
          let obj = JSON.parse(jsonString);
          if (obj) {
            let userPhrases = new Map(Object.entries(obj));
            mcInputController.setUserPhrases(userPhrases);
          }
        } catch (e) {
          console.log("failed to parse user_phrase:" + e);
        }
      }
    });
  }

  chrome.input.ime.onActivate.addListener((engineID) => {
    mcInputController = new InputController(makeUI(engineID));

    /// The horizontal candidate windows on ChromeOS is actually broken so we
    /// use the vertical one only.
    mcInputController.setUserVerticalCandidates(true);

    // Changes language needs to restarts ChromeOS login session so it won't
    // change until user logs in again. So, we can just set language code once
    // at the start.
    let languageCode = chrome.i18n.getUILanguage();
    mcInputController.setLanguageCode(languageCode);

    mcEngineID = engineID;
    var menus = [
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
        id: "mcbopomofo-homepage",
        label: chrome.i18n.getMessage("homepage"),
        style: "check",
      },
    ];
    chrome.input.ime.setMenuItems({ engineID: engineID, items: menus });

    console.log("load user phrase");
    loadUserPhrases();

    mcInputController.setOnPhraseChange((userPhrases) => {
      const obj = Object.fromEntries(userPhrases);
      let jsonString = JSON.stringify(obj);
      chrome.storage.sync.set({ user_phrase: jsonString });
    });
  });

  chrome.input.ime.onBlur.addListener((context) => {
    mcInputController.reset();
  });

  chrome.input.ime.onReset.addListener((context) => {
    mcInputController.reset();
  });

  chrome.input.ime.onFocus.addListener((context) => {
    mcContext = context;
    chrome.storage.sync.get("settings", (value) => {
      settings = value.settings;
      if (settings === undefined) {
        settings = {};
      }

      mcInputController.setKeyboardLayout(settings.layout);
      mcInputController.setSelectPhrase(settings.select_phrase);
      let keys = settings.candidate_keys;
      if (keys == undefined) {
        keys = "123456789";
      }
      mcInputController.setCandidateKeys(settings.candidate_keys);
      mcInputController.setEscClearEntireBuffer(
        settings.esc_key_clear_entire_buffer
      );
      mcInputController.setMoveCursorAfterSelection(settings.move_cursor);
      mcInputController.setLetterMode(settings.letter_mode);
    });
  });

  chrome.input.ime.onKeyEvent.addListener((engineID, keyData) => {
    if (keyData.type != "keydown") {
      return false;
    }

    if (
      keyData.altKey ||
      keyData.ctrlKey ||
      keyData.altgrKey ||
      keyData.capsLock
    ) {
      return false;
    }

    return mcInputController.keyEvent(keyData);
  });

  chrome.input.ime.onMenuItemActivated.addListener((engineID, name) => {
    if (name === "mcbopomofo-options") {
      let page = chrome.i18n.getMessage("optionsPage");
      window.open(chrome.extension.getURL(page));
      return;
    }

    if (name === "mcbopomofo-user-phrase") {
      let page = chrome.i18n.getMessage("userPhrasesPage");
      window.open(chrome.extension.getURL(page));
      return;
    }

    if (name === "mcbopomofo-homepage") {
      window.open("https://mcbopomofo.openvanilla.org/");
      return;
    }
  });

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
    if (request.command === "reload_user_phrase") {
      loadUserPhrases();
      sendResponse({ status: "ok" });
    }
  });
};
