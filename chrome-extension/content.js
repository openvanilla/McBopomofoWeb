let inputArea = document.createElement("div");
inputArea.innerHTML =
  '<div id="mcbpmf">' +
  '<div name="mcbpmf_composing_buffer" id="mcbpmf_composing_buffer">【麥】</div>' +
  '<div name="mcbpmf_candidates" id="mcbpmf_candidates"></div>' +
  '<div name="mcbpmf_debug" id="mcbpmf_debug"></div>' +
  "</div>";
document.body.appendChild(inputArea);
document.getElementById("mcbpmf").hidden = true;

window.createMcBopomofoUI = function (element) {
  let that = {};
  that.chineseMode = true;
  that.element = element;

  that.reset = function () {
    console.log("reset called");
    document.getElementById("mcbpmf_candidates").innerHTML = "";
    let s = that.chineseMode ? "【麥】" : "【英】";
    s += "<span class='cursor'>|</span>";
    document.getElementById("mcbpmf_composing_buffer").innerHTML = s;
  };

  that.commitString = function (string) {
    console.log("commitString called");
    if (
      that.element.nodeName === "TEXTAREA" ||
      that.element.nodeName === "INPUT"
    ) {
      var selectionStart = that.element.selectionStart;
      var selectionStop = that.element.selectionStop;
      var text = that.element.value;
      console.log("selectionStart: " + selectionStart);
      console.log("selectionStop: " + selectionStop);
      if (selectionStop == undefined) {
        selectionStop = selectionStart;
      }
      console.log("selectionStop: " + selectionStop);
      console.log("current text: " + text);
      console.log("string: " + string);
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionStop);
      var composed = head + string + tail;
      that.element.value = composed;
      console.log("composed text: " + composed);
      let start = selectionStart + string.length;
      that.element.setSelectionRange(start, start);
    }
  };

  that.update = function (string) {
    console.log("update called" + string);
    let state = JSON.parse(string);
    console.log("update called" + state);
    {
      let buffer = state.composingBuffer;
      let s = that.chineseMode ? "【麥】" : "【英】";
      let i = 0;
      for (let item of buffer) {
        let text = item.text;
        for (let c of text) {
          if (i === state.cursorIndex) {
            s += "<span class='cursor'>|</span>";
          }
          s += c;
          i++;
        }
      }
      if (i === state.cursorIndex) {
        s += "<span class='cursor'>|</span>";
      }
      document.getElementById("mcbpmf_composing_buffer").innerHTML = s;
    }

    if (state.candidates.length) {
      let s = "<table><tr>";
      for (let candidate of state.candidates) {
        s += "<td>";
        if (candidate.selected) s += "<b>";
        s += candidate.keyCap;
        if (candidate.selected) s += "</b>";
        s += "</td>";
        s += "<td>";
        if (candidate.selected) s += "<b>";
        s += candidate.candidate;
        if (candidate.selected) s += "</b>";
        s += "</td>";
        if (candidate.selected) s += "</b>";
      }
      s += "</tr></table>";
      document.getElementById("mcbpmf_candidates").innerHTML = s;
    } else {
      document.getElementById("mcbpmf_candidates").innerHTML = "";
    }
  };

  return that;
};

var lastKeyAccepted = false;
let shiftState = false;

window.mcbpmf_UpdateUI = function (ui) {
  let uiState = JSON.parse(ui);
  if (window.mcBopomofoUI != undefined) {
    if (uiState.uiInfo.length > 0) {
      window.mcBopomofoUI.update(uiState.uiInfo);
    } else {
      window.mcBopomofoUI.reset();
    }
    if (uiState.text.length > 0) {
      window.mcBopomofoUI.commitString(uiState.text);
    }
  }
};

window.mcbpmf_KeyUp = function () {
  if (event.key === "Shift" && shiftState) {
    shiftState = false;
    window.mcBopomofoUI.chineseMode = !window.mcBopomofoUI.chineseMode;
    chrome.runtime.sendMessage({ command: "reset" }, function (response) {
      window.mcbpmf_UpdateUI(response.ui);
    });
  }
};

window.mcbpmf_KeyPress = function (event) {
  console.log("mcbpmf_KeyPress 1 " + lastKeyAccepted);

  if (!window.mcBopomofoUI.chineseMode) {
    return;
  }

  if (lastKeyAccepted) {
    event.preventDefault();
  } else if (event.key.length == 1) {
    event.preventDefault();
  }
};

window.mcbpmf_Keydown = function (event) {
  console.log("mcbpmf_Keydown start");
  console.log(event);
  shiftState = event.key === "Shift";

  if (!window.mcBopomofoUI.chineseMode) {
    return;
  }

  event.preventDefault();

  let o = {};
  o.isTrusted = true;
  o.key = event.key;
  o.code = event.code;
  o.altKey = event.altKey;
  o.ctrlKey = event.ctrlKey;
  o.which = event.which;
  o.shiftKey = event.shiftKey;
  o.metaKey = event.metaKey;
  o.keyCode = event.keyCode;
  o.charCode = event.charCode;

  let key = JSON.stringify(o);

  chrome.runtime.sendMessage(
    { command: "send_key_event", key: key },
    function (response) {
      console.log(response);
      lastKeyAccepted = response.accepted;
      window.mcbpmf_UpdateUI(response.ui);
      resolve();
    }
  );

  console.log("lastKeyAccepted a2 " + lastKeyAccepted);
  console.log("mcbpmf_Keydown end");
};

document.addEventListener("focusout", function (e) {
  console.log("focusout");
  document.getElementById("mcbpmf").hidden = true;
});

document.addEventListener("focusin", function (e) {
  if (window.mcBopomofoUI != undefined) {
    let element = window.mcBopomofoUI.element;
    element.removeEventListener("keyup", mcbpmf_KeyUp);
    element.removeEventListener("keypress", mcbpmf_KeyPress);
    element.removeEventListener("keydown", mcbpmf_Keydown);
  }

  console.log(e.target);
  let nodeName = e.target.nodeName;

  let newElement;
  if (nodeName === "TEXTAREA") {
    newElement = e.target;
  } else if (nodeName === "DIV") {
    newElement = e.target;
  } else if (nodeName === "INPUT") {
    if (e.target.type === "text") {
      newElement = e.target;
    }
  }

  if (newElement == undefined) {
    window.mcBopomofoUI = null;
    document.getElementById("mcbpmf").hidden = true;
    return;
  }

  window.mcBopomofoUI = createMcBopomofoUI(newElement);
  document.getElementById("mcbpmf").hidden = false;
  newElement.addEventListener("keyup", mcbpmf_KeyUp);
  newElement.addEventListener("keypress", mcbpmf_KeyPress);
  newElement.addEventListener("keydown", mcbpmf_Keydown);

  console.log("call reset");
  chrome.runtime.sendMessage({ command: "load_config" }, function (response) {
    console.log(response);
  });

  chrome.runtime.sendMessage({ command: "reset" }, function (response) {
    console.log(response);
  });
});
