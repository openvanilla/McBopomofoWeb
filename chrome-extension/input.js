window.mcbopomofoUI = (function (element) {
  let that = {};
  that.chineseMode = false;
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
    let doc = document;
    if (that.element.nodeName === "IFRAME") {
      doc = that.element.contentWindow.document;
    }

    if (doc.queryCommandSupported) {
      console.log("Has queryCommandSupported");
      if (doc.queryCommandSupported("insertText")) {
        console.log("Has insertText");
        doc.execCommand("insertText", false, string);
        return;
      }
      if (doc.queryCommandSupported("insertHTML")) {
        console.log("Has insertHTML");
        string = string
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>")
          .replace(/\u0020/g, "&nbsp;");
        doc.execCommand("insertHTML", false, string);
        return;
      }
    }

    if (
      that.element.nodeName === "TEXTAREA" ||
      that.element.nodeName === "INPUT"
    ) {
      var selectionStart = that.element.selectionStart;
      var selectionStop = that.element.selectionStop;
      var text = that.element.value;
      if (selectionStop == undefined) {
        selectionStop = selectionStart;
      }
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionStop);
      var composed = head + string + tail;
      that.element.value = composed;
      console.log("composed text: " + composed);
      let start = selectionStart + string.length;
      that.element.setSelectionRange(start, start);
    } else {
      var sel, range;
      var w = function () {
        if (that.element.nodeName === "IFRAME") {
          return that.element.contentWindow;
        }
        return window;
      };

      if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          let node = document.createTextNode(string);
          range.insertNode(node);
          range.setStart(node, node.length);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = string;
      }
    }
  };

  that.update = function (string) {
    let state = JSON.parse(string);
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

  that.updateLocation = function () {
    if (that.element === undefined) {
      return;
    }
    var rect = that.element.getBoundingClientRect();
    let panel = document.getElementById("mcbpmf");
    if (that.chineseMode) {
      panel.style.width = "300px";
      panel.style.height = "3em";
    } else {
      panel.style.width = "5em";
      panel.style.height = "1.1em";
    }

    panel.style.top = rect.bottom + "px";
    panel.style.left = rect.left + "px";
  };

  return that;
})();

let shiftState = false;

window.mcbpmf_KeyUp = function (event) {
  if (event.key === "Shift" && shiftState) {
    shiftState = false;
    window.mcbopomofoUI.chineseMode = !window.mcbopomofoUI.chineseMode;
    window.bpmfController().reset();
    window.mcbopomofoUI.updateLocation();
  }
};

window.mcbpmf_KeyPress = function (event) {};

window.mcbpmf_Keydown = function (event) {
  if (window.mcbopomofoUI.element === undefined) {
    return;
  }
  console.log("mcbpmf_Keydown start");
  console.log(event);
  console.log(event.location);

  shiftState = event.key === "Shift";

  if (!window.mcbopomofoUI.chineseMode) {
    return;
  }

  let accepted = window.bpmfController().keyEvent(event);
  if (accepted) {
    event.preventDefault();
  }

  window.mcbopomofoUI.updateLocation();
};

document.addEventListener("focusout", function (e) {
  console.log("focusout");
  window.mcbopomofoUI.element = null;
  document.getElementById("mcbpmf").hidden = true;
});

document.addEventListener("focusin", function (e) {
  console.log(e.target);
  let newElement;
  let nodeName = e.target.nodeName;
  if (nodeName === "DIV" || nodeName === "TEXTAREA" || nodeName === "CANVAS") {
    newElement = e.target;
  } else if (nodeName === "INPUT") {
    if (e.target.type === "text") {
      newElement = e.target;
    }
  } else if (nodeName == "IFRAME") {
    newElement = e.target;
    let doc = newElement.contentWindow.document;
    doc.addEventListener("keydown", window.mcbpmf_Keydown);
    doc.addEventListener("keypress", window.mcbpmf_KeyPress);
    doc.addEventListener("keyup", window.mcbpmf_KeyUp);
  }

  window.mcbopomofoUI.element = newElement;
  if (newElement) {
    window.mcbopomofoUI.updateLocation();
    document.getElementById("mcbpmf").hidden = false;
  }
});

document.addEventListener("keydown", window.mcbpmf_Keydown);
document.addEventListener("keypress", window.mcbpmf_KeyPress);
document.addEventListener("keyup", window.mcbpmf_KeyUp);

window.bpmfController = function () {
  if (window.bpmfController_ === undefined) {
    const { InputController } = window.mcbopomofo;
    window.bpmfController_ = new InputController(window.mcbopomofoUI);
  }
  return window.bpmfController_;
};
