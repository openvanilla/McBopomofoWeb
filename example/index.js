var chineseMode = true;
function resetUI() {
  let s = chineseMode ? "【麥】" : "【英】";
  s += "<span class='cursor'>|</span>";
  document.getElementById("composing_buffer").innerHTML = s;
  document.getElementById("candidates").innerHTML = "";
}

let ui = (function () {
  let that = {};
  that.reset = resetUI;

  that.commitString = function (string) {
    var selectionStart = document.getElementById("text_area").selectionStart;
    var text = document.getElementById("text_area").value;
    var head = text.substring(0, selectionStart);
    var tail = text.substring(selectionStart);
    document.getElementById("text_area").value = head + string + tail;
    let start = selectionStart + string.length;
    document.getElementById("text_area").setSelectionRange(start, start);
  };

  that.update = function (string) {
    let state = JSON.parse(string);
    {
      let buffer = state.composingBuffer;
      let s = chineseMode ? "【麥】" : "【英】";
      let i = 0;
      for (let item of buffer) {
        if (item.style === "highlighted") {
          s += '<span class="marking">';
        }
        let text = item.text;
        for (let c of text) {
          if (i === state.cursorIndex) {
            s += "<span class='cursor'>|</span>";
          }
          s += c;
          i++;
        }
        if (item.style === "highlighted") {
          s += "</span>";
        }
      }
      if (i === state.cursorIndex) {
        s += "<span class='cursor'>|</span>";
      }
      document.getElementById("composing_buffer").innerHTML = s;
    }

    if (state.candidates.length) {
      let s = "<table><tr>";
      for (let candidate of state.candidates) {
        s += "<td>";
        if (candidate.selected) s += '<span class="highlighted_candidate"> ';
        s += '<span class="keycap">';
        s += candidate.keyCap;
        s += "</span>";
        s += '<span class="candidiate">';
        s += candidate.candidate.value;
        s += "</span>";
        if (candidate.selected) s += "</span>";
        s += "</td>";
      }
      s += "</tr></table>";
      document.getElementById("candidates").innerHTML = s;
    } else if (state.tooltip.length) {
      document.getElementById("candidates").innerHTML = state.tooltip;
    }
  };

  return that;
})();

const { InputController } = window.mcbopomofo;
let controller = new InputController(ui);
let defaultSettings = {
  trad_mode: false, // OK
  chinese_conversion: false, // OK
  layout: "standard", // OK
  candidate_keys: "123456789", //OK
  select_phrase: "before_cursor", // OK
  esc_key_clear_entire_buffer: false, // OK
  //   shift_key_toggle_alphabet_mode: true,
  move_cursor: true,
  letter_mode: "upper",
};
let settings = {};

function loadSettings() {
  console.log("loadSettings");
  let result = window.localStorage.getItem("user_settings");
  try {
    let obj = JSON.parse(result);
    if (!obj) {
      console.log("not load..");
      return defaultSettings;
    }
    console.log("load..");
    return obj;
  } catch (e) {}
  return defaultSettings;
}

function saveSettings(settings) {
  console.log("saveSettings");
  console.log(settings);
  const s = JSON.stringify(settings);
  window.localStorage.setItem("user_settings", s);
}

function applySettings(settings) {
  console.log(settings);
  {
    controller.setTraditionalMode(settings.trad_mode);
    if (settings.trad_mode) {
      document.getElementById("use_plainbopomofo").checked = true;
      document.getElementById("use_mcbopomofo").checked = false;
    } else {
      document.getElementById("use_mcbopomofo").checked = true;
      document.getElementById("use_plainbopomofo").checked = false;
    }
  }
  {
    controller.setChineseConversionEnabled(settings.chinese_conversion);
    if (settings.chinese_conversion) {
      document.getElementById("chinese_convert_simp").checked = true;
      document.getElementById("chinese_convert_trad").checked = false;
    } else {
      document.getElementById("chinese_convert_trad").checked = true;
      document.getElementById("chinese_convert_simp").checked = false;
    }
  }
  {
    controller.setKeyboardLayout(settings.layout);
    let select = document.getElementById("layout");
    let options = select.getElementsByTagName("option");
    for (let option of options) {
      if (option.value === settings.layout) {
        option.selected = "selected";
        break;
      }
    }
  }
  {
    controller.setCandidateKeys(settings.candidate_keys);
    let select = document.getElementById("keys");
    let options = select.getElementsByTagName("option");
    for (let option of options) {
      if (option.value === settings.candidate_keys) {
        option.selected = "selected";
        break;
      }
    }
  }
  {
    if (settings.select_phrase === "before_cursor") {
      controller.setSelectPhrase("before_cursor");
      document.getElementById("before_cursor").checked = true;
      document.getElementById("after_cursor").checked = false;
    } else if (settings.select_phrase === "after_cursor") {
      controller.setSelectPhrase("after_cursor");
      document.getElementById("before_cursor").checked = false;
      document.getElementById("after_cursor").checked = true;
    }
  }
  {
    controller.setEscClearEntireBuffer(
      settings.esc_key_clear_entire_buffer === true
    );
    document.getElementById("esc_key").checked =
      settings.esc_key_clear_entire_buffer;
  }
  {
    document.getElementById("move_cursor").checked = settings.move_cursor;
    controller.setMoveCursorAfterSelection(settings.move_cursor);
  }

  {
    if (settings.letter_mode === "upper") {
      document.getElementById("uppercase_letters").checked = true;
      document.getElementById("lowercase_letters").checked = false;
      controller.setLetterMode("upper");
    } else if (settings.letter_mode === "lower") {
      document.getElementById("uppercase_letters").checked = false;
      document.getElementById("lowercase_letters").checked = true;
      controller.setLetterMode("lower");
    }
  }
}

function loadUserPhrases() {
  console.log("loadUserPhrases");
  let result = window.localStorage.getItem("user_phrases");
  console.log(result);
  try {
    let obj = JSON.parse(result);
    if (result !== undefined && result !== null) {
      let userPhrases = new Map(Object.entries(obj));
      controller.setUserPhrases(userPhrases);
    } else {
      controller.setUserPhrases(new Map());
    }
  } catch (e) {}
}

function saveUserPhrases(userPhrases) {
  const obj = Object.fromEntries(userPhrases);
  const s = JSON.stringify(obj);
  window.localStorage.setItem("user_phrases", s);
}

settings = loadSettings();
applySettings(settings);
loadUserPhrases();
controller.setOnPhraseChange(saveUserPhrases);

let shiftState = false;

document.getElementById("text_area").addEventListener("keyup", (event) => {
  if (event.key === "Shift" && shiftState) {
    shiftState = false;
    chineseMode = !chineseMode;
    controller.reset();
    return;
  }
});

document.getElementById("text_area").addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  shiftState = event.key === "Shift";
  if (!chineseMode) {
    return;
  }

  let accepted = controller.keyEvent(event);
  if (accepted) {
    event.preventDefault();
  }
});

document.getElementById("use_mcbopomofo").onchange = function (event) {
  controller.setTraditionalMode(false);
  settings.trad_mode = false;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("use_plainbopomofo").onchange = function (event) {
  controller.setTraditionalMode(true);
  settings.trad_mode = true;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("chinese_convert_trad").onchange = function (event) {
  console.log("chinese_convert_trad");
  controller.setChineseConversionEnabled(false);
  settings.chinese_conversion = false;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("chinese_convert_simp").onchange = function (event) {
  console.log("chinese_convert_simp");
  controller.setChineseConversionEnabled(true);
  settings.chinese_conversion = true;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("layout").onchange = function (event) {
  let value = document.getElementById("layout").value;
  controller.setKeyboardLayout(value);
  settings.layout = value;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("keys").onchange = function (event) {
  let value = document.getElementById("keys").value;
  controller.setCandidateKeys(value);
  settings.candidate_keys = value;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("before_cursor").onchange = function (event) {
  controller.setSelectPhrase("before_cursor");
  settings.select_phrase = "before_cursor";
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("after_cursor").onchange = function (event) {
  controller.setSelectPhrase("after_cursor");
  settings.select_phrase = "after_cursor";
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("esc_key").onchange = function (event) {
  let checked = document.getElementById("esc_key").checked;
  controller.setEscClearEntireBuffer(checked);
  settings.esc_key_clear_entire_buffer = checked;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("uppercase_letters").onchange = function (event) {
  controller.setLetterMode("upper");
  settings.letter_mode = "upper";
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("lowercase_letters").onchange = function (event) {
  controller.setLetterMode("lower");
  settings.letter_mode = "lower";
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("move_cursor").onchange = function (event) {
  let checked = document.getElementById("move_cursor").checked;
  controller.setMoveCursorAfterSelection(checked);
  settings.move_cursor = checked;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("fullscreen").onclick = function (event) {
  let elem = document.getElementById("edit_area");
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
  document.getElementById("text_area").focus();
  return false;
};

document.getElementById("text_area").onblur = function () {
  // controller.reset();
};

document.getElementById("loading").innerText = "載入完畢！";
setTimeout(function () {
  document.getElementById("loading").innerText = "";
}, 2000);
resetUI();
document.getElementById("text_area").focus();
