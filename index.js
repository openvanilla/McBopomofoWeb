var alphabetMode = false;
var composingBuffer = "";

function toggle_feature(id) {
  let features = [
    "feature_input",
    "feature_user_phrases",
    "feature_text_to_braille",
    "feature_braille_to_text",
    "feature_add_bpmf",
    "feature_convert_hanyupnyin",
  ];
  for (let feature of features) {
    document.getElementById(feature).style.display = "none";
  }
  document.getElementById(id).style.display = "block";
  if (id === "feature_input") {
    document.getElementById("text_area").focus();
    document.title = "輸入功能";
  } else if (id === "feature_user_phrases") {
    document.title = "自定詞管理";
  } else if (id === "feature_text_to_braille") {
    document.getElementById("text_to_braille_text_area").focus();
    document.title = "中文轉注音點字";
  } else if (id === "feature_braille_to_text") {
    document.getElementById("braille_to_text_text_area").focus();
    document.title = "注音點字轉中文";
  } else if (id === "feature_add_bpmf") {
    document.getElementById("add_bpmf_text_area").focus();
    document.title = "國字加注音";
  } else if (id === "feature_convert_hanyupnyin") {
    document.getElementById("convert_hanyupnyin_text_area").focus();
    document.title = "國字轉拼音";
  }

}

function resetUI() {
  let renderText = alphabetMode ? "【英】" : "【麥】";
  renderText += "<span class='cursor'>|</span>";
  document.getElementById("composing_buffer").innerHTML = renderText;
  document.getElementById("candidates").innerHTML = "";
  composingBuffer = "";
}

function beep() {
  var snd = new Audio(
    "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
  );
  snd.play();
}

let ui = (function () {
  let that = {};
  that.reset = resetUI;

  that.commitString = function (string) {
    var selectionStart = document.getElementById("text_area").selectionStart;
    var selectionEnd = document.getElementById("text_area").selectionEnd;
    var text = document.getElementById("text_area").value;
    var head = text.substring(0, selectionStart);
    var tail = text.substring(selectionEnd);
    document.getElementById("text_area").value = head + string + tail;
    let start = selectionStart + string.length;
    document.getElementById("text_area").setSelectionRange(start, start);
    composingBuffer = "";
  };

  that.update = function (string) {
    let state = JSON.parse(string);
    {
      let buffer = state.composingBuffer;
      let renderText = alphabetMode ? "【英】" : "【麥】";
      let plainText = "";
      let i = 0;
      for (let item of buffer) {
        if (item.style === "highlighted") {
          renderText += '<span class="marking">';
        }
        let text = item.text;
        plainText += text;
        for (let c of text) {
          if (i === state.cursorIndex) {
            renderText += "<span class='cursor'>|</span>";
          }
          renderText += c;
          i++;
        }
        if (item.style === "highlighted") {
          renderText += "</span>";
        }
      }
      if (i === state.cursorIndex) {
        renderText += "<span class='cursor'>|</span>";
      }
      document.getElementById("composing_buffer").innerHTML = renderText;
      composingBuffer = plainText;
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
        s += candidate.candidate.displayedText;
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

const { InputController, Service } = window.mcbopomofo;
let controller = new InputController(ui);
controller.setOnPhraseAdded(function (key, phrase) {
  let result = window.localStorage.getItem("user_phrases");
  if (result === undefined || result === null || result.length === 0) {
    result = "";
  }
  let lastChar = result.substring(result.length - 1);
  if (lastChar != "\n") {
    result += "\n";
  }
  result += key + " " + phrase + "\n";
  saveUserPhrases(result);
});
controller.setOnOpenUrl(function (url) {
  window.open(url);
});
controller.setOnError(function () {
  if (settings.beep_on_error) {
    beep();
  }
});
let service = new Service();

let defaultSettings = {
  trad_mode: false,
  chinese_conversion: false,
  half_width_punctuation: false,
  layout: "standard",
  candidate_keys: "123456789",
  candidate_keys_count: 9,
  select_phrase: "before_cursor",
  esc_key_clear_entire_buffer: false,
  move_cursor: false,
  letter_mode: "upper",
  ctrl_enter_option: 0,
  use_jk_key_to_move_cursor: false,
  beep_on_error: true,
};
let settings = {};

function loadSettings() {
  let result = window.localStorage.getItem("user_settings");
  try {
    let obj = JSON.parse(result);
    if (!obj) {
      return defaultSettings;
    }

    for (let key in defaultSettings) {
      if (!(key in obj)) {
        obj[key] = defaultSettings[key];
      }
    }

    return obj;
  } catch (e) {}
  return defaultSettings;
}

function saveSettings(settings) {
  const s = JSON.stringify(settings);
  window.localStorage.setItem("user_settings", s);
}

function applySettings(settings) {
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
    controller.setHalfWidthPunctuationEnabled(settings.half_width_punctuation);
    if (settings.half_width_punctuation) {
      document.getElementById("full_width_punctuation").checked = true;
      document.getElementById("half_width_punctuation").checked = false;
    } else {
      document.getElementById("full_width_punctuation").checked = true;
      document.getElementById("half_width_punctuation").checked = false;
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
    controller.setCandidateKeysCount(settings.candidate_keys_count);
    let select = document.getElementById("keys_count");
    let options = select.getElementsByTagName("option");
    for (let option of options) {
      if (option.value === settings.candidate_keys_count) {
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
    controller.setEscClearEntireBuffer(settings.esc_key_clear_entire_buffer);
    document.getElementById("esc_key").checked =
      settings.esc_key_clear_entire_buffer;
  }
  {
    controller.setUseJKToMoveCursor(settings.use_jk_key_to_move_cursor);
    document.getElementById("jk_key").checked =
      settings.use_jk_key_to_move_cursor;
  }
  {
    document.getElementById("beep_on_error").checked = settings.beep_on_error;
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
  {
    controller.setCtrlEnterOption(settings.ctrl_enter_option);
    let select = document.getElementById("ctrl_enter_option");
    let options = select.getElementsByTagName("option");
    for (let option of options) {
      if (option.value === settings.ctrl_enter_option) {
        option.selected = "selected";
        break;
      }
    }
  }
}

function loadUserPhrases() {
  let result = window.localStorage.getItem("user_phrases");
  if (result === undefined || result === null || result.length === 0) {
    result = "";
  }
  document.getElementById("feature_user_phrases_text_area").value = result;
  console.log("userPhrases:\n" + result);
  controller.setUserPhrases(result);
  service.setUserPhrases(result);
}

function saveUserPhrases(result) {
  window.localStorage.setItem("user_phrases", result);
  controller.setUserPhrases(result);
  service.setUserPhrases(result);
  document.getElementById("feature_user_phrases_text_area").value = result;
}

settings = loadSettings();
applySettings(settings);
loadUserPhrases();

let shiftKeyIsPressed = false;

document.getElementById("text_area").addEventListener("keyup", (event) => {
  if (event.key === "Shift" && shiftKeyIsPressed) {
    shiftKeyIsPressed = false;
    if (composingBuffer.length > 0) {
      ui.commitString(composingBuffer);
      composingBuffer = "";
    }
    alphabetMode = !alphabetMode;
    controller.reset();
    return;
  }
});

document.getElementById("text_area").addEventListener("keydown", (event) => {
  if (event.metaKey || event.altKey) {
    return;
  }

  shiftKeyIsPressed = event.key === "Shift";
  if (alphabetMode) {
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
  controller.setChineseConversionEnabled(false);
  settings.chinese_conversion = false;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("chinese_convert_simp").onchange = function (event) {
  controller.setChineseConversionEnabled(true);
  settings.chinese_conversion = true;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("full_width_punctuation").onchange = function (event) {
  controller.setHalfWidthPunctuationEnabled(false);
  settings.half_width_punctuation = false;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("half_width_punctuation").onchange = function (event) {
  controller.setHalfWidthPunctuationEnabled(true);
  settings.half_width_punctuation = true;
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
document.getElementById("layout").onblur = function (event) {
  document.getElementById("text_area").focus();
};

document.getElementById("keys").onchange = function (event) {
  let value = document.getElementById("keys").value;
  controller.setCandidateKeys(value);
  settings.candidate_keys = value;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};
document.getElementById("keys").onblur = function (event) {
  document.getElementById("text_area").focus();
};

document.getElementById("keys_count").onchange = function (event) {
  let value = document.getElementById("keys_count").value;
  controller.setCandidateKeysCount(+value);
  settings.candidate_keys_count = +value;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};
document.getElementById("keys_count").onblur = function (event) {
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

document.getElementById("jk_key").onchange = function (event) {
  let checked = document.getElementById("jk_key").checked;
  controller.setUseJKToMoveCursor(checked);
  settings.use_jk_key_to_move_cursor = checked;
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

document.getElementById("ctrl_enter_option").onchange = function (event) {
  let value = document.getElementById("ctrl_enter_option").value;
  value = +value;
  controller.setCtrlEnterOption(value);
  settings.ctrl_enter_option = value;
  saveSettings(settings);
  document.getElementById("text_area").focus();
};

document.getElementById("beep_on_error").onchange = function (event) {
  let value = document.getElementById("beep_on_error").checked;
  settings.beep_on_error = value;
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
  document.getElementById("loading").style.display = "none";
}, 2000);
resetUI();
document.getElementById("text_area").focus();

function textToBraille() {
  let text = document.getElementById("text_to_braille_text_area").value;
  text = text.trim();
  if (text.length === 0) {
    document.getElementById("text_to_braille_output").innerHTML =
      "<p>您沒有輸入任何內容！</p>";
    document.getElementById("text_to_braille_text_area").focus();
    return;
  }
  let output = service.convertTextToBraille(text);
  let lines = output.split("\n");
  let html = "<h2>轉換結果如下</h2>";
  for (let line of lines) {
    html += "<p>" + line + "</p>";
  }

  document.getElementById("text_to_braille_output").innerHTML = html;
  document.getElementById("text_to_braille_text_area").focus();
}

function brailleToText() {
  let text = document.getElementById("braille_to_text_text_area").value;
  text = text.trim();
  if (text.length === 0) {
    document.getElementById("braille_to_text_output").innerHTML =
      "<p>您沒有輸入任何內容！</p>";
    document.getElementById("braille_to_text_text_area").focus();
    return;
  }
  let output = service.convertBrailleToText(text);
  let lines = output.split("\n");
  let html = "<h2>轉換結果如下</h2>";
  for (let line of lines) {
    html += "<p>" + line + "</p>";
  }

  document.getElementById("braille_to_text_output").innerHTML = html;
  document.getElementById("braille_to_text_text_area").focus();
}

function addBpmf() {
  let text = document.getElementById("add_bpmf_text_area").value;
  text = text.trim();
  if (text.length === 0) {
    document.getElementById("add_bpmf_output").innerHTML =
      "<p>您沒有輸入任何內容！</p>";
    document.getElementById("add_bpmf_text_area").focus();
    return;
  }
  let output = "";
  if (document.getElementById("convert_to_reading").checked) {
    output = service.convertTextToBpmfReadings(text);
  } else if (document.getElementById("add_reading").checked) {
    output = service.appendBpmfReadingsToText(text);
  } else {
    output = service.convertTextToHtmlRuby(text);
  }
  let lines = output.split("\n");
  let html = "<h2>轉換結果如下</h2>";
  for (let line of lines) {
    html += "<p>" + line + "</p>";
  }

  document.getElementById("add_bpmf_output").innerHTML = html;
  document.getElementById("add_bpmf_text_area").focus();
}

function convertHanyuPinyin() {
  let text = document.getElementById("convert_hanyupnyin_text_area").value;
  text = text.trim();
  if (text.length === 0) {
    document.getElementById("convert_hanyupnyin_output").innerHTML =
      "<p>您沒有輸入任何內容！</p>";
    document.getElementById("convert_hanyupnyin_text_area").focus();
    return;
  }
  let output = service.convertTextToPinyin(text);
  let lines = output.split("\n");
  let html = "<h2>轉換結果如下</h2>";
  for (let line of lines) {
    html += "<p>" + line + "</p>";
  }

  document.getElementById("convert_hanyupnyin_output").innerHTML = html;
  document.getElementById("convert_hanyupnyin_text_area").focus();
}

function onHashChange() {
  let hash = window.location.hash;
  toggle_feature(hash.substring(1));
}

window.addEventListener("hashchange", () => {
  onHashChange();
});
document.addEventListener("DOMContentLoaded", (event) => {
  let hash = window.location.hash;
  if (hash.length === 0) {
    window.location.hash = "feature_input";
  }
  onHashChange();
});
