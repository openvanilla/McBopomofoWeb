var mcInputController = null;
var mcContext = null;

window.onload = function () {
  const { InputController } = window.mcbopomofo;

  function makeUI(engineID) {
    let that = {};
    that.engineID = engineID;

    that.reset = function () {
      chrome.input.ime.clearComposition({ contextID: mcContext });
      chrome.input.ime.setCandidateWindowProperties({
        engineID: that.engineID,
        properties: {
          visible: false,
        },
      });
    };

    that.commitString = function (string) {
      chrome.input.ime.commitText({
        contextID: mcContext,
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
        contextID: this.context,
        cursor: state.cursorIndex,
        segments: segments,
        text: text,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd,
      });

      if (candidates.length) {
        chrome.input.ime.setCandidateWindowProperties({
          engineID: that.engineID,
          properties: {
            visible: true,
            cursorVisible: false,
            vertical: false,
            pageSize: candidates.length,
          },
        });
        let chromeCandidates = [];
        let index = 0;
        let selectedIndex = 0;
        for (let candidate of state.candidates) {
          var item = {};
          if (candidate.selected) {
            selectedIndex = index;
          }
          item.candidate = candidate.candidate;
          item.id = index++;
          item.label = candidate.keyCap;
          chromeCandidates.push(item);
        }
        chrome.input.ime.setCandidates({
          contextID: this.context,
          candidates: candidates,
        });
        chrome.input.ime.setCursorPosition({
          contextID: this.context,
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
    mcInputController = new InputController(ui);
    mcEngineID = engineID;
    var menus = [
      { id: "mcbopomofo-options", label: "Options", style: "check" },
      { id: "mcbopomofo-separator", style: "separator" },
    ];
    chrome.input.ime.setMenuItems({ engineID: engineID, items: menus });
  });

  chrome.input.ime.onFocus.addListener(function (context) {
    mcContext = context;
  });

  chrome.input.ime.onKeyEvent.addListener(function (engineID, keyData) {
    if (keyData.type != "keydown") {
      return false;
    }

    return controller.keyEvent(keyData);
  });

  chrome.input.ime.onMenuItemActivated.addListener(function (engineID, name) {
    if (name == "mcbopomofo-options") {
      window.open(chrome.extension.getURL("options.html"));
      return;
    }
  });
};
