var mcInputController = null;
var mcContext = null;
var settings = null;

window.onload = function () {
  const { InputController } = window.mcbopomofo;

  function makeUI(engineID) {
    let that = {};
    that.engineID = engineID;

    that.reset = function () {
      chrome.input.ime.clearComposition({ contextID: mcContext.contextID });
      chrome.input.ime.setCandidateWindowProperties({
        engineID: that.engineID,
        properties: {
          visible: false,
        },
      });
    };

    that.commitString = function (string) {
      chrome.input.ime.commitText({
        contextID: mcContext.contextID,
        text: string,
      });
    };

    that.update = function (string) {
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
        console.log(chromeCandidates);
        chrome.input.ime.setCandidateWindowProperties({
          engineID: that.engineID,
          properties: {
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
      } else {
        chrome.input.ime.setCandidateWindowProperties({
          engineID: that.engineID,
          properties: {
            visible: false,
          },
        });
      }
    };
    return that;
  }

  chrome.input.ime.onActivate.addListener(function (engineID) {
    mcInputController = new InputController(makeUI(engineID));
    mcInputController.setUserVerticalCandidates(true);
    mcEngineID = engineID;
    var menus = [
      {
        id: "mcbopomofo-options",
        label: chrome.i18n.getMessage("menuOptions"),
        style: "check",
      },
      {
        id: "mcbopomofo-homepage",
        label: chrome.i18n.getMessage("homepage"),
        style: "check",
      },
    ];
    chrome.input.ime.setMenuItems({ engineID: engineID, items: menus });

    chrome.storage.sync.get("user_phrase", (value) => {
      if (value !== undefined) {
        let map = JSON.parse(value);
        if (map) {
          mcInputController.setUserPhrases(map);
        }
      }
      mcInputController.setOnPhraseChange((map) => {
        let s = JSON.stringify(map);
        chrome.storage.sync.set("user_phrase", s);
      });
    });
  });

  chrome.input.ime.onFocus.addListener(function (context) {
    mcContext = context;
    chrome.storage.sync.get("settings", (value) => {
      settings = value.settings;
      if (settings === undefined) {
        settings = {};
      }

      mcInputController.setKeyboardLayout(settings.layout);
      mcInputController.setSelectPhrase(settings.select_phrase);
      mcInputController.setCandidateKeys(settings.candidate_keys);
      mcInputController.setEscClearEntireBuffer(
        settings.esc_key_clear_entire_buffer
      );
      mcInputController.setMoveCursorAfterSelection(settings.move_cursor);
      mcInputController.setLetterMode(settings.letter_mode);
    });
  });

  chrome.input.ime.onKeyEvent.addListener(function (engineID, keyData) {
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

  chrome.input.ime.onMenuItemActivated.addListener(function (engineID, name) {
    if (name === "mcbopomofo-options") {
      let page = chrome.i18n.getMessage("optionsPage");
      window.open(chrome.extension.getURL(page));
      return;
    }
    if (name === "mcbopomofo-homepage") {
      window.open("https://mcbopomofo.openvanilla.org/");
      return;
    }
  });
};
