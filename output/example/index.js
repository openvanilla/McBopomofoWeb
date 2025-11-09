(() => {
  const ui = (() => {
    const that = {};
    that.beep = () => {
      const snd = new Audio(
        "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
      );
      snd.play();
    };

    that.reset = () => {
      document.getElementById("function").style.visibility = "hidden";
      document.getElementById("composing_buffer").style.visibility = "hidden";
      document.getElementById("candidates").style.visibility = "hidden";
      const renderText = "<span class='cursor'>|</span>";
      document.getElementById("composing_buffer").innerHTML = renderText;
      document.getElementById("candidates").innerHTML = "";
    };

    that.commitString = (string) => {
      const selectionStart =
        document.getElementById("text_area").selectionStart;
      const selectionEnd = document.getElementById("text_area").selectionEnd;
      const text = document.getElementById("text_area").value;
      const head = text.substring(0, selectionStart);
      const tail = text.substring(selectionEnd);
      document.getElementById("text_area").value = head + string + tail;
      const start = selectionStart + string.length;
      document.getElementById("text_area").setSelectionRange(start, start);
    };

    that.updateMenu = () => {
      document.getElementById("menu").style.display = globalUi.menuVisible
        ? "block"
        : "none";
      document.getElementById("feature_input_area").style.width =
        globalUi.menuVisible ? "70%" : "100%";
      document.getElementById("menu_visible").innerHTML = globalUi.menuVisible
        ? '<a href="" onclick="globalUi.hideMenu(); return false;">隱藏設定</a>'
        : '<a href="" onclick="globalUi.showMenu(); return false;">顯示設定</a>';
    };

    that.updateByAlphabetMode = () => {
      document.getElementById("status").innerHTML = globalUi.alphabetMode
        ? '<a href="" onclick="globalUi.enterChineseMode(); return false;">【英文】</a>'
        : '<a href="" onclick="globalUi.enterAlphabetMode(); return false;">【中文】</a>';
    };

    that.update = (string) => {
      const state = JSON.parse(string);
      {
        that.updateByAlphabetMode();
        const buffer = state.composingBuffer;
        let renderText = "<p>";
        let plainText = "";
        if (buffer.length === 0) {
          renderText += "<span class='cursor'>|</span>";
          document.getElementById("composing_buffer").style.visibility =
            "hidden";
        } else {
          let i = 0;
          for (const item of buffer) {
            if (item.style === "highlighted") {
              renderText += '<span class="marking">';
            }
            const text = item.text;
            plainText += text;
            for (const c of text) {
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
          renderText += "</p>";
          document.getElementById("composing_buffer").innerHTML = renderText;
          document.getElementById("composing_buffer").style.visibility =
            "visible";
          composingBuffer = plainText;
        }
      }

      if (state.candidates.length) {
        let s = "<table>";
        for (const candidate of state.candidates) {
          if (candidate.selected) {
            s += '<tr class="highlighted_candidate"> ';
          } else {
            s += "<tr>";
          }
          s += '<td class="keycap">';
          s += candidate.keyCap;
          s += "</td>";
          s += '<td class="candidate">';
          s += candidate.candidate.displayedText;
          s += "</td>";
          s += "</tr>";
        }
        s += '<tr class="page_info"> ';
        s += '<td colspan="2" style="text-align: right;">';
        s += "" + state.candidatePageIndex + " / " + state.candidatePageCount;
        s += "</td>";
        s += "</tr>";
        s += "</table>";

        document.getElementById("candidates").innerHTML = s;
      }

      const tooltipDeb = document.getElementById("tooltip");
      if (state.candidates.length !== 0) {
        tooltipDeb.innerHTML = "";
        tooltipDeb.style.visibility = "hidden";
        tooltipDeb.style.width = null;
      } else {
        const tooltip = state.tooltip;
        if (tooltip) {
          tooltipDeb.innerHTML = tooltip;
          tooltipDeb.style.visibility = "visible";
          tooltipDeb.style.width = "auto";
        } else {
          tooltipDeb.innerHTML = "";
          tooltipDeb.style.visibility = "hidden";
          tooltipDeb.style.width = null;
        }
      }

      document.getElementById("candidates").style.visibility = state.candidates
        .length
        ? "visible"
        : "hidden";

      // Create a temporary mirror div to measure actual caret position
      document.getElementById("function").style.visibility = "visible";
      const textArea = document.getElementById("text_area");
      const functionDiv = document.getElementById("function");
      const rect = textArea.getBoundingClientRect();
      const textAreaStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(textAreaStyle.lineHeight) || 20;

      // Create a temporary mirror div to measure actual caret position
      const mirror = document.createElement("div");
      const styles = [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "letterSpacing",
        "overflowWrap",
        "whiteSpace",
        "lineHeight",
        "padding",
        "border",
        "boxSizing",
        "width",
      ];
      styles.forEach((style) => {
        mirror.style[style] = textAreaStyle[style];
      });
      mirror.style.position = "absolute";
      mirror.style.visibility = "hidden";
      mirror.style.whiteSpace = "pre-wrap";
      mirror.style.overflowWrap = "break-word";

      const caretPos = textArea.selectionStart;
      const textBeforeCaret = textArea.value.substring(0, caretPos);
      mirror.textContent = textBeforeCaret;

      const caretSpan = document.createElement("span");
      caretSpan.textContent = "|";
      mirror.appendChild(caretSpan);

      document.body.appendChild(mirror);

      const caretRect = caretSpan.getBoundingClientRect();
      const mirrorRect = mirror.getBoundingClientRect();

      const relativeTop = caretRect.top - mirrorRect.top;
      const relativeLeft = caretRect.left - mirrorRect.left;

      document.body.removeChild(mirror);

      // Account for textarea scroll position
      const scrollTop = textArea.scrollTop;
      const scrollLeft = textArea.scrollLeft;

      functionDiv.style.position = "absolute";
      functionDiv.style.top =
        rect.top + relativeTop + lineHeight - scrollTop + "px";
      functionDiv.style.left = rect.left + relativeLeft - scrollLeft + "px";
    };

    return that;
  })();

  const globalUi = (() => {
    let that = {};
    that.alphabetMode = false;
    that.menuVisible = true;

    that.enterAlphabetMode = () => {
      that.alphabetMode = true;
      ui.updateByAlphabetMode();
      controller.reset();
      document.getElementById("text_area").focus();
    };

    that.enterChineseMode = () => {
      that.alphabetMode = false;
      ui.updateByAlphabetMode();
      controller.reset();
      document.getElementById("text_area").focus();
    };

    that.hideMenu = () => {
      that.menuVisible = false;
      ui.updateMenu();
      document.getElementById("text_area").focus();
    };

    that.showMenu = () => {
      that.menuVisible = true;
      ui.updateMenu();
      document.getElementById("text_area").focus();
    };

    return that;
  })();

  const { InputController, Service } = window.mcbopomofo;
  const controller = (() => {
    const controller = new InputController(ui);
    controller.setUserVerticalCandidates(true);
    controller.setOnPhraseChange((userPhrases) => {
      console.log("userPhrases changed");
      let string = "";
      for (const [key, phrase] of userPhrases) {
        console.log(`Key: ${key}, Phrase: ${phrase}`);
        for (let i = 0; i < phrase.length; i++) {
          string += phrase[i] + " " + key + "\n";
        }
      }
      saveUserPhrases(string);
    });
    controller.setOnExcludedPhraseChange((userPhrases) => {
      console.log("excludedPhrases changed");
      let string = "";
      for (const [key, phrase] of userPhrases) {
        console.log(`Key: ${key}, Phrase: ${phrase}`);
        for (let i = 0; i < phrase.length; i++) {
          string += phrase[i] + " " + key + "\n";
        }
      }
      saveExcludedPhrases(string);
    });
    controller.setOnOpenUrl((url) => {
      window.open(url);
    });
    controller.setOnError(() => {
      if (settingsManager.settings.beep_on_error) {
        ui.beep();
      }
    });
    return controller;
  })();

  const service = (() => {
    let that = {};

    that.service = new Service();

    that.textToBraille = () => {
      const text = document
        .getElementById("text_to_braille_text_area")
        .value.trim();
      if (text.length === 0) {
        document.getElementById("text_to_braille_output").innerHTML =
          "<p>您沒有輸入任何內容！</p>";
        document.getElementById("text_to_braille_text_area").focus();
        return;
      }
      const output = that.service.convertTextToBraille(text);
      const lines = output.split("\n");
      let html = "<h2>轉換結果如下</h2>";
      for (const line of lines) {
        html += "<p>" + line + "</p>";
      }

      document.getElementById("text_to_braille_output").innerHTML = html;
      document.getElementById("text_to_braille_text_area").focus();
    };

    that.brailleToText = () => {
      const text = document
        .getElementById("braille_to_text_text_area")
        .value.trim();
      if (text.length === 0) {
        document.getElementById("braille_to_text_output").innerHTML =
          "<p>您沒有輸入任何內容！</p>";
        document.getElementById("braille_to_text_text_area").focus();
        return;
      }
      const output = that.service.convertBrailleToText(text);
      const lines = output.split("\n");
      let html = "<h2>轉換結果如下</h2>";
      for (const line of lines) {
        html += "<p>" + line + "</p>";
      }

      document.getElementById("braille_to_text_output").innerHTML = html;
      document.getElementById("braille_to_text_text_area").focus();
    };

    that.addBpmf = function () {
      const text = document.getElementById("add_bpmf_text_area").value.trim();
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
        output = that.service.appendBpmfReadingsToText(text);
      } else {
        output = that.service.convertTextToHtmlRuby(text);
      }
      const lines = output.split("\n");
      let html = "<h2>轉換結果如下</h2>";
      for (const line of lines) {
        html += "<p>" + line + "</p>";
      }

      document.getElementById("add_bpmf_output").innerHTML = html;
      document.getElementById("add_bpmf_text_area").focus();
    };

    that.convertHanyuPinyin = () => {
      const text = document
        .getElementById("convert_hanyupnyin_text_area")
        .value.trim();
      if (text.length === 0) {
        document.getElementById("convert_hanyupnyin_output").innerHTML =
          "<p>您沒有輸入任何內容！</p>";
        document.getElementById("convert_hanyupnyin_text_area").focus();
        return;
      }
      const output = that.service.convertTextToPinyin(text);
      const lines = output.split("\n");
      let html = "<h2>轉換結果如下</h2>";
      for (const line of lines) {
        html += "<p>" + line + "</p>";
      }

      document.getElementById("convert_hanyupnyin_output").innerHTML = html;
      document.getElementById("convert_hanyupnyin_text_area").focus();
    };
    return that;
  })();

  const settingsManager = (() => {
    let that = {};
    that.defaultSettings = {
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
      moving_cursor_option: 0,
      beep_on_error: true,
      repeated_punctuation_choose_candidate: false,
    };

    that.settings = that.defaultSettings;
    that.loadSettings = () => {
      const result = window.localStorage.getItem("user_settings");
      try {
        const obj = JSON.parse(result);
        if (!obj) {
          that.settings = that.defaultSettings;
        }

        for (const key in defaultSettings) {
          if (!(key in obj)) {
            obj[key] = defaultSettings[key];
          }
        }
        that.settings = obj;
        return obj;
      } catch (e) {}
    };

    that.saveSettings = () => {
      const s = JSON.stringify(that.settings);
      window.localStorage.setItem("user_settings", s);
    };

    that.applySettings = () => {
      const settings = that.settings;
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
        controller.setHalfWidthPunctuationEnabled(
          settings.half_width_punctuation
        );
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
        const select = document.getElementById("layout");
        const options = select.getElementsByTagName("option");
        for (const option of options) {
          if (option.value === settings.layout) {
            option.selected = "selected";
            break;
          }
        }
      }
      {
        controller.setCandidateKeys(settings.candidate_keys);
        const select = document.getElementById("keys");
        const options = select.getElementsByTagName("option");
        for (const option of options) {
          if (option.value === settings.candidate_keys) {
            option.selected = "selected";
            break;
          }
        }
      }
      {
        controller.setCandidateKeysCount(settings.candidate_keys_count);
        const select = document.getElementById("keys_count");
        const options = select.getElementsByTagName("option");
        for (const option of options) {
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
        controller.setEscClearEntireBuffer(
          settings.esc_key_clear_entire_buffer
        );
        document.getElementById("esc_key").checked =
          settings.esc_key_clear_entire_buffer;
      }
      {
        controller.setRepeatedPunctuationChooseCandidate(
          settings.repeated_punctuation_choose_candidate
        );
        document.getElementById(
          "repeated_punctuation_choose_candidate"
        ).checked = settings.repeated_punctuation_choose_candidate;
      }
      {
        controller.setMovingCursorOption(settings.moving_cursor_option);
        const select = document.getElementById("moving_cursor_option");
        const options = select.getElementsByTagName("option");
        for (const option of options) {
          if (option.value === settings.moving_cursor_option) {
            option.selected = "selected";
            break;
          }
        }
      }
      {
        document.getElementById("beep_on_error").checked =
          settings.beep_on_error;
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
        const select = document.getElementById("ctrl_enter_option");
        const options = select.getElementsByTagName("option");
        for (const option of options) {
          if (option.value === settings.ctrl_enter_option) {
            option.selected = "selected";
            break;
          }
        }
      }
    };

    that.loadUserPhrases = () => {
      const result = window.localStorage.getItem("user_phrases") || "";
      document.getElementById("feature_user_phrases_text_area").value = result;
      document.getElementById("feature_user_phrases_text_area").focus();
      console.log("userPhrases:\n" + result);
      controller.setUserPhrases(result);
      service.service.setUserPhrases(result);
    };

    that.saveUserPhrases = (result) => {
      window.localStorage.setItem("user_phrases", result);
      controller.setUserPhrases(result);
      service.service.setUserPhrases(result);
      document.getElementById("feature_user_phrases_text_area").value = result;
      document.getElementById("feature_user_phrases_text_area").focus();
    };

    that.loadExcludedPhrases = () => {
      const result = window.localStorage.getItem("excluded_phrases") || "";
      document.getElementById("feature_excluded_phrases_text_area").value =
        result;
      document.getElementById("feature_excluded_phrases_text_area").focus();
      console.log("excludedPhrases:\n" + result);
      controller.setExcludedPhrases(result);
      service.service.setExcludedPhrases(result);
    };

    that.saveExcludedPhrases = (result) => {
      window.localStorage.setItem("excluded_phrases", result);
      controller.setExcludedPhrases(result);
      service.service.setExcludedPhrases(result);
      document.getElementById("feature_excluded_phrases_text_area").value =
        result;
      document.getElementById("feature_excluded_phrases_text_area").focus();
    };

    return that;
  })();

  (function () {
    ui.updateByAlphabetMode();
    ui.updateMenu();

    settingsManager.loadSettings();
    settingsManager.applySettings();
    settingsManager.loadUserPhrases();
    settingsManager.loadExcludedPhrases();

    let shiftKeyIsPressed = false;
    document.getElementById("text_area").addEventListener("keyup", (event) => {
      if (event.key === "Shift" && shiftKeyIsPressed) {
        globalUi.alphabetMode = !globalUi.alphabetMode;
        controller.reset();
        return;
      }
    });

    document
      .getElementById("text_area")
      .addEventListener("keydown", (event) => {
        if (event.metaKey || event.altKey) {
          controller.reset();
          return;
        }

        shiftKeyIsPressed = event.key === "Shift";
        if (globalUi.alphabetMode) {
          return;
        }

        const accepted = controller.keyEvent(event);
        if (accepted) {
          event.preventDefault();
        }
      });

    document.getElementById("use_mcbopomofo").onchange = (event) => {
      controller.setTraditionalMode(false);
      settingsManager.settings.trad_mode = false;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("use_plainbopomofo").onchange = (event) => {
      controller.setTraditionalMode(true);
      settingsManager.settings.trad_mode = true;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("chinese_convert_trad").onchange = (event) => {
      controller.setChineseConversionEnabled(false);
      settingsManager.settings.chinese_conversion = false;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("chinese_convert_simp").onchange = (event) => {
      controller.setChineseConversionEnabled(true);
      settingsManager.settings.chinese_conversion = true;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("full_width_punctuation").onchange = (event) => {
      controller.setHalfWidthPunctuationEnabled(false);
      settingsManager.settings.half_width_punctuation = false;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("half_width_punctuation").onchange = (event) => {
      controller.setHalfWidthPunctuationEnabled(true);
      settingsManager.settings.half_width_punctuation = true;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("layout").onchange = (event) => {
      const value = document.getElementById("layout").value;
      controller.setKeyboardLayout(value);
      settingsManager.settings.layout = value;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("layout").onblur = (event) => {
      document.getElementById("text_area").focus();
    };

    document.getElementById("keys").onchange = (event) => {
      const value = document.getElementById("keys").value;
      controller.setCandidateKeys(value);
      settingsManager.settings.candidate_keys = value;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("keys").onblur = (event) => {
      document.getElementById("text_area").focus();
    };

    document.getElementById("keys_count").onchange = (event) => {
      const value = +document.getElementById("keys_count").value;
      controller.setCandidateKeysCount(value);
      settingsManager.settings.candidate_keys_count = value;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("keys_count").onblur = (event) => {
      document.getElementById("text_area").focus();
    };

    document.getElementById("moving_cursor_option").onchange = (event) => {
      const value = +document.getElementById("moving_cursor_option").value;
      controller.setMovingCursorOption(value);
      settingsManager.settings.moving_cursor_option = value;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("before_cursor").onchange = (event) => {
      controller.setSelectPhrase("before_cursor");
      settingsManager.settings.select_phrase = "before_cursor";
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("after_cursor").onchange = (event) => {
      controller.setSelectPhrase("after_cursor");
      settingsManager.settings.select_phrase = "after_cursor";
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("esc_key").onchange = (event) => {
      const checked = document.getElementById("esc_key").checked;
      controller.setEscClearEntireBuffer(checked);
      settingsManager.settings.esc_key_clear_entire_buffer = checked;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("repeated_punctuation_choose_candidate").onchange =
      (event) => {
        const checked = document.getElementById(
          "repeated_punctuation_choose_candidate"
        ).checked;
        controller.setRepeatedPunctuationChooseCandidate(checked);
        settingsManager.settings.repeated_punctuation_choose_candidate =
          checked;
        settingsManager.saveSettings();
        document.getElementById("text_area").focus();
      };

    document.getElementById("uppercase_letters").onchange = (event) => {
      controller.setLetterMode("upper");
      settingsManager.settings.letter_mode = "upper";
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("lowercase_letters").onchange = (event) => {
      controller.setLetterMode("lower");
      settingsManager.settings.letter_mode = "lower";
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("move_cursor").onchange = (event) => {
      const checked = document.getElementById("move_cursor").checked;
      controller.setMoveCursorAfterSelection(checked);
      settingsManager.settings.move_cursor = checked;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("ctrl_enter_option").onchange = (event) => {
      const value = +document.getElementById("ctrl_enter_option").value;
      controller.setCtrlEnterOption(value);
      settingsManager.settings.ctrl_enter_option = value;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("beep_on_error").onchange = (event) => {
      const value = document.getElementById("beep_on_error").checked;
      settingsManager.settings.beep_on_error = value;
      settingsManager.saveSettings();
      document.getElementById("text_area").focus();
    };

    document.getElementById("fullscreen").onclick = (event) => {
      const elem = document.getElementById("edit_area");
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

    document.getElementById("text_area").onblur = () => {
      // controller.reset();
    };

    document.getElementById("loading").innerText = "載入完畢！";
    setTimeout(() => {
      document.getElementById("loading").style.display = "none";
      onHashChange();
    }, 2000);
    ui.reset();

    function toggle_feature(id) {
      const features = [
        "feature_input",
        "feature_user_phrases",
        "feature_excluded_phrases",
        "feature_text_to_braille",
        "feature_braille_to_text",
        "feature_add_bpmf",
        "feature_convert_hanyupnyin",
      ];
      for (const feature of features) {
        document.getElementById(feature).style.display = "none";
      }
      document.getElementById(id).style.display = "block";
      if (id === "feature_input") {
        document.getElementById("text_area").focus();
        document.title = "小麥注音輸入法 - 輸入功能";
      } else if (id === "feature_user_phrases") {
        document.getElementById("feature_user_phrases_text_area").focus();
        document.title = "小麥注音輸入法 - 自定詞管理";
      } else if (id === "feature_excluded_phrases") {
        document.getElementById("feature_excluded_phrases_text_area").focus();
        document.title = "小麥注音輸入法 - 管理排除的詞彙";
      } else if (id === "feature_text_to_braille") {
        document.getElementById("text_to_braille_text_area").focus();
        document.title = "小麥注音輸入法 - 中文轉注音點字";
      } else if (id === "feature_braille_to_text") {
        document.getElementById("braille_to_text_text_area").focus();
        document.title = "小麥注音輸入法 - 注音點字轉中文";
      } else if (id === "feature_add_bpmf") {
        document.getElementById("add_bpmf_text_area").focus();
        document.title = "小麥注音輸入法 - 國字加注音";
      } else if (id === "feature_convert_hanyupnyin") {
        document.getElementById("convert_hanyupnyin_text_area").focus();
        document.title = "小麥注音輸入法 - 國字轉拼音";
      }
    }

    function onHashChange() {
      const hash = window.location.hash;
      toggle_feature(hash.substring(1));
    }

    window.addEventListener("hashchange", () => {
      onHashChange();
    });
    document.addEventListener("DOMContentLoaded", (event) => {
      const hash = window.location.hash;
      if (hash.length === 0) {
        window.location.hash = "feature_input";
      }
      onHashChange();
    });
  })();
})();
