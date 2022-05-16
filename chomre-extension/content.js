let inputArea = document.createElement("div");
inputArea.innerHTML =
  '<div id="mcbpmf">' +
  '<div name="mcbpmf_composing_buffer" id="mcbpmf_composing_buffer"></div>' +
  '<div name="mcbpmf_candidates" id="mcbpmf_candidates"></div>' +
  '<div name="mcbpmf_debug" id="mcbpmf_debug"></div>' +
  "</div>";
document.body.appendChild(inputArea);
document.getElementById("mcbpmf").hidden = true;

window.createMcBopomofoUI = function (element) {
  let that = {};

  that.chineseMode = true;
  that.element = element;

  that.inputPanel = function () {
    return document.getElementById("mcbpmf");
  };

  that.composingBuffer = function () {
    return document.getElementById("mcbpmf_composing_buffer");
  };

  that.candidatesPanel = function () {
    return document.getElementById("mcbpmf_candidates");
  };

  that.reset = function () {
    console.log("reset called");
  };

  that.commitString = function (string) {
    console.log("commitString called");
    if (
      that.element.nodeName === "TEXTAREA" ||
      that.element.nodeName === "INPUT"
    ) {
      var selectionStart = that.element.selectionStart;
      var selectionStop = that.element.selectionStop;
      var text = document.that.element.value;
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionStop);
      that.element.value = head + string + tail;
      let start = selectionStart + string.length;
      that.element.setSelectionRange(start, start);
    }
  };

  that.update = function (string) {
    console.log("update called");
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
      composingBuffer().innerHTML = s;
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
      candidatesPanel().innerHTML = s;
    }
  };

  return that;
};

window.mcbpmf_KeyUp = function (event) {
  console.log("keyup");
  console.log(event);
};

window.mcbpmf_Keydown = async function (event) {
  console.log("keydown");
  console.log("keydown 1");
  let o = {};
  o.key = event.key;
  o.code = event.code;
  o.altKey = event.altKey;
  o.ctrlKey = event.ctrlKey;
  o.shiftKey = event.shiftKey;
  o.metaKey = event.metaKey;
  let key = JSON.stringify(o);

  let promise = new Promise((resolve, reject) => {
    console.log(key);
    chrome.runtime.sendMessage(
      { command: "send_key_event", key: key },
      function (response) {
        console.log("response comes");
        console.log(response);
        console.log("keydown 2");
        event.preventDefault();
        resolve();
      }
    );
  });
  await promise;
  console.log("keydown 3");
};

document.addEventListener("focusout", function (e) {
  console.log("focusout");
  document.getElementById("mcbpmf").hidden = true;
});

document.addEventListener("focusin", function (e) {
  if (window.mcBopomofoUI != undefined) {
    let element = window.mcBopomofoUI.element;
    element.removeEventListener("keyup", mcbpmf_KeyUp);
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
  window.mcBopomofoUI.inputPanel().hidden = false;
  newElement.addEventListener("keyup", mcbpmf_KeyUp);
  newElement.addEventListener("keydown", mcbpmf_Keydown);

  console.log("call reset");
  chrome.runtime.sendMessage({ command: "reset" }, function (response) {
    console.log(response);
  });

  document.getElementById("mcbpmf_candidates").innerText =
    e.srcElement.nodeName.toString();
});
