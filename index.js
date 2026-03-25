const calculateFunctionPosition = ({
  caretRect,
  mirrorRect,
  textAreaRect,
  containerRect,
  lineHeight,
  scrollTop,
  scrollLeft,
}) => {
  const relativeTop = caretRect.top - mirrorRect.top;
  const relativeLeft = caretRect.left - mirrorRect.left;

  return {
    top:
      textAreaRect.top -
      containerRect.top +
      relativeTop +
      lineHeight -
      scrollTop,
    left: textAreaRect.left - containerRect.left + relativeLeft - scrollLeft,
  };
};

const INPUT_FONT_SIZE_BPMF = 22;
const INPUT_FONT_SIZE_DEFAULT = 18;
const copyTextFromTextArea = async ({ areaId, document, clipboard, alert }) => {
  const area = document.getElementById(areaId);
  if (area == undefined) {
    alert("找不到輸出區域，無法複製");
    return false;
  }
  await clipboard.writeText(area.value);
  alert("已複製到剪貼簿");
  return true;
};

// if (typeof module !== "undefined" && module.exports) {
//   module.exports = {
//     calculateFunctionPosition,
//     copyTextFromTextArea,
//     INPUT_FONT_SIZE_BPMF,
//     INPUT_FONT_SIZE_DEFAULT,
//   };
// }

if (typeof document !== "undefined") {
  (() => {
    window.copy_text = (areaId) =>
      copyTextFromTextArea({
        areaId,
        document,
        clipboard: navigator.clipboard,
        alert: window.alert.bind(window),
      });

    const $ = (id) => document.getElementById(id);
    const focusElement = (id) => {
      $(id).focus();
    };
    const getTrimmedValue = (id) => $(id).value.trim();
    const getValue = (id) => $(id).value;
    const getChecked = (id) => $(id).checked;
    const setChecked = (id, checked) => {
      $(id).checked = checked;
    };
    const setDisplay = (id, display) => {
      $(id).style.display = display;
    };
    const setSelectValue = (id, value) => {
      const select = $(id);
      const options = select.getElementsByTagName("option");
      for (const option of options) {
        if (option.value === String(value)) {
          option.selected = "selected";
          break;
        }
      }
    };
    const renderTable = (textareaId, useBrailleFont = false) => {
      let html = "<h2>轉換結果如下</h2>";
      html +=
        "<textarea style='height: 200px; " +
        (useBrailleFont ? "font-family: SimBraille;" : "") +
        "' id ='" +
        textareaId +
        "'>" +
        "</textarea>";
      return html;
    };
    const renderEmptyInput = (outputId, focusId) => {
      $(outputId).innerHTML = "<p>您沒有輸入任何內容！</p>";
      focusElement(focusId);
    };
    const serializePhraseMap = (phrases) => {
      let output = "";
      for (const [key, phrase] of phrases) {
        console.log(`Key: ${key}, Phrase: ${phrase}`);
        for (let i = 0; i < phrase.length; i++) {
          output += phrase[i] + " " + key + "\n";
        }
      }
      return output;
    };
    const runTextConversion = ({
      inputId,
      outputId,
      emptyOutputId = outputId,
      converter,
      textareaId,
      useBrailleFont = false,
    }) => {
      const text = getTrimmedValue(inputId);
      if (text.length === 0) {
        renderEmptyInput(emptyOutputId, inputId);
        return null;
      }
      const output = converter(text);
      $(outputId).innerHTML = renderTable(textareaId, useBrailleFont);
      console.log("Output:", output);
      $(textareaId).value = output;
      focusElement(inputId);
      return output;
    };

    const ui = (() => {
      const that = {};
      that.beep = () => {
        const snd = new Audio(
          "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
        );
        snd.play();
      };

      that.reset = () => {
        $("function").style.visibility = "hidden";
        $("composing_buffer").style.visibility = "hidden";
        $("candidates").style.visibility = "hidden";
        const renderText = "<span class='cursor'>|</span>";
        $("composing_buffer").innerHTML = renderText;
        $("candidates").innerHTML = "";
      };

      that.commitString = (string) => {
        const textArea = $("text_area");
        const selectionStart = textArea.selectionStart;
        const selectionEnd = textArea.selectionEnd;
        const text = textArea.value;
        const head = text.substring(0, selectionStart);
        const tail = text.substring(selectionEnd);
        textArea.value = head + string + tail;
        const start = selectionStart + string.length;
        textArea.setSelectionRange(start, start);
      };

      that.updateByAlphabetMode = () => {
        $("status").innerHTML = globalUi.alphabetMode
          ? '<a href="" onclick="example.globalUi.enterChineseMode(); return false;">【英文】</a>'
          : '<a href="" onclick="example.globalUi.enterAlphabetMode(); return false;">【中文】</a>';
      };
      that.updateByBmpFontSupport = () => {
        // console.log("updateByBmpFontSupport");
        const textArea = $("text_area");
        if (globalUi.bpmvdFontsSupport) {
          // console.log("add");
          textArea.style.fontFamily = "BpmfZihiSerif-Regular";
          textArea.style.fontSize = INPUT_FONT_SIZE_BPMF;
          textArea.style.lineHeight = "1.2em";
        } else {
          // console.log("remove");
          textArea.style.fontFamily = "Helvetica, Arial, sans-serif";
          textArea.style.fontSize = INPUT_FONT_SIZE_DEFAULT;
          textArea.style.lineHeight = "1.2em";
        }
      };
      // that.update

      that.update = (string) => {
        const state = JSON.parse(string);
        {
          that.updateByAlphabetMode();
          const buffer = state.composingBuffer;
          let renderText = "<p>";
          if (buffer.length === 0) {
            renderText += "<span class='cursor'>|</span>";
            $("composing_buffer").style.visibility = "hidden";
          } else {
            let i = 0;
            let cusrorNotAtEnd = false;
            for (const item of buffer) {
              if (item.style === "highlighted") {
                renderText += '<span class="marking">';
              }
              const text = item.text;
              for (let j = 0; j < text.length; j++) {
                let c = text[j];
                if (i === state.cursorIndex) {
                  renderText += "<span class='cursor'>|</span>";
                  cusrorNotAtEnd = true;
                }
                renderText += c;
                i++;
              }

              if (item.style === "highlighted") {
                renderText += "</span>";
              }
            }
            if (!cusrorNotAtEnd) {
              renderText += "<span class='cursor'>|</span>";
            }
            renderText += "</p>";

            $("composing_buffer").innerHTML = renderText;
            $("composing_buffer").style.visibility = "visible";
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
            s += '<td class="keyCap">';
            s += candidate.keyCap;
            s += "</td>";
            s += '<td class="candidate">';
            s += candidate.candidate.displayedText;
            s += "</td>";
            s += "</tr>";
          }
          s += '<tr class="page_info"> ';
          s += '<td colspan="2">';
          s += "" + state.candidatePageIndex + " / " + state.candidatePageCount;
          s += "</td>";
          s += "</tr>";
          s += "</table>";

          $("candidates").innerHTML = s;
        }

        const tooltipDiv = $("tooltip");
        if (state.candidates.length !== 0) {
          tooltipDiv.innerHTML = "";
          tooltipDiv.style.visibility = "hidden";
          tooltipDiv.style.width = null;
        } else {
          const tooltip = state.tooltip;
          if (tooltip) {
            tooltipDiv.innerHTML = tooltip;
            tooltipDiv.style.visibility = "visible";
            tooltipDiv.style.width = "auto";
          } else {
            tooltipDiv.innerHTML = "";
            tooltipDiv.style.visibility = "hidden";
            tooltipDiv.style.width = null;
          }
        }

        $("candidates").style.visibility = state.candidates.length
          ? "visible"
          : "hidden";

        // Create a temporary mirror div to measure actual caret position
        $("function").style.visibility = "visible";
        const textArea = $("text_area");
        const functionDiv = $("function");
        const textAreaRect = textArea.getBoundingClientRect();
        const containerRect = $("edit_area").getBoundingClientRect();
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

        // Account for textarea scroll position
        const scrollTop = textArea.scrollTop;
        const scrollLeft = textArea.scrollLeft;

        const { top, left } = calculateFunctionPosition({
          caretRect,
          mirrorRect,
          textAreaRect,
          containerRect,
          lineHeight,
          scrollTop,
          scrollLeft,
        });
        document.body.removeChild(mirror);

        functionDiv.style.position = "absolute";
        functionDiv.style.top = top + "px";
        functionDiv.style.left = left + "px";
      };

      function removeTextBeforeSelection() {
        const textArea = $("text_area");
        const selectionStart = textArea.selectionStart;
        const selectionEnd = textArea.selectionEnd;
        const currentText = textArea.value;
        const head = currentText.substring(0, selectionStart);
        const tail = currentText.substring(selectionEnd);

        textArea.value = head.substring(0, head.length - 1) + tail;
        const cursorPosition = Math.max(0, head.length - 1);
        textArea.setSelectionRange(cursorPosition, cursorPosition);
      }

      that.backspace = () => {
        removeTextBeforeSelection();
        composingBuffer = "";
      };

      return that;
    })();

    const globalUi = (() => {
      let that = {};
      that.alphabetMode = false;
      that.bpmvdFontsSupport = false;

      that.startSupportBpmfvsFont = () => {
        that.bpmvdFontsSupport = true;
        ui.updateByBmpFontSupport();
      };

      that.stopSupportBpmfvsFont = () => {
        that.bpmvdFontsSupport = false;
        ui.updateByBmpFontSupport();
      };

      that.enterAlphabetMode = () => {
        that.alphabetMode = true;
        ui.updateByAlphabetMode();
        controller.reset();
        focusElement("text_area");
      };

      that.enterChineseMode = () => {
        that.alphabetMode = false;
        ui.updateByAlphabetMode();
        controller.reset();
        focusElement("text_area");
      };

      return that;
    })();

    const { InputController, Service } = window.mcbopomofo;
    const controller = (() => {
      const controller = new InputController(ui);
      controller.setUserVerticalCandidates(true);
      controller.setLanguageCode("zh-TW");
      controller.setOnPhraseChange((userPhrases) => {
        console.log("userPhrases changed");
        settingsManager.saveUserPhrases(serializePhraseMap(userPhrases));
      });
      controller.setOnExcludedPhraseChange((userPhrases) => {
        console.log("excludedPhrases changed");
        saveExcludedPhrases(serializePhraseMap(userPhrases));
      });
      controller.setOnOpenUrl((url) => {
        window.open(url, "_blank", "noopener,noreferrer");
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
        const selectedValue = document.querySelector(
          'input[name="to_braille_format"]:checked'
        ).value;
        let converter = null;
        if (selectedValue === "unicode") {
          converter = (text) => that.service.convertTextToBraille(text);
        } else if (selectedValue === "ascii") {
          converter = (text) => that.service.convertTextToAsciiBraille(text);
        }

        runTextConversion({
          inputId: "text_to_braille_text_area",
          outputId: "text_to_braille_output",
          converter: converter,
          textareaId: "text_to_braille_output_textarea",
          useBrailleFont: selectedValue === "ascii",
        });
      };

      that.brailleToText = () => {
        const selectedValue = document.querySelector(
          'input[name="from_braille_format"]:checked'
        ).value;
        let converter = null;
        if (selectedValue === "unicode") {
          converter = (text) => that.service.convertBrailleToText(text);
        } else if (selectedValue === "ascii") {
          converter = (text) => that.service.convertAsciiBrailleToText(text);
        }
        console.log(selectedValue); //
        runTextConversion({
          inputId: "braille_to_text_text_area",
          outputId: "braille_to_text_output",
          converter: converter,
          textareaId: "braille_to_text_output_textarea",
        });
      };

      that.addBpmf = function () {
        runTextConversion({
          inputId: "add_bpmf_text_area",
          outputId: "add_bpmf_output",
          converter: (text) => {
            if ($("convert_to_reading").checked) {
              return that.service.convertTextToBpmfReadings(text);
            }
            if ($("add_reading").checked) {
              return that.service.appendBpmfReadingsToText(text);
            }
            return that.service.convertTextToHtmlRuby(text);
          },
          textareaId: "add_bpmf_output_textarea",
        });
      };

      that.convertHanyuPinyin = () => {
        runTextConversion({
          inputId: "convert_hanyupnyin_text_area",
          outputId: "convert_hanyupnyin_output",
          converter: (text) => that.service.convertTextToPinyin(text),
          textareaId: "convert_hanyupnyin_output_textarea",
        });
      };

      that.generatePhrases = () => {
        const text = $("phrase_generate_input");
        const lines = text.value.trim().split("\n");
        if (lines.length === 0) {
          renderEmptyInput(
            "phrase_generate_input_output_container",
            "phrase_generate_output"
          );
          return;
        }
        let output = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const reading = that.service.convertTextToRawReadings(line);
          const perline = line + " " + reading;
          output.push(perline);
        }
        let finalOutput = output.join("\n");
        let outputTextArea = $("phrase_generate_output");
        outputTextArea.value = finalOutput;
        outputTextArea.focus();
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
        bopomofo_font_annotation_support_enabled: false,
        allow_changing_prior_tone: false,
      };

      that.settings = that.defaultSettings;

      that.loadSettings = () => {
        const result = window.localStorage.getItem("user_settings");
        try {
          const obj = JSON.parse(result);
          if (!obj) {
            that.settings = that.defaultSettings;
            return that.defaultSettings;
          }

          for (const key in that.defaultSettings) {
            if (!(key in obj)) {
              obj[key] = that.defaultSettings[key];
            }
          }
          console.log("Settings loaded:", obj);
          that.settings = obj;
          return obj;
        } catch (e) {
          console.log("Error loading settings, using default settings.");
          console.log(e);
        }
      };

      that.saveSettings = () => {
        console.log("Saving settings:", that.settings);
        const s = JSON.stringify(that.settings);
        window.localStorage.setItem("user_settings", s);
      };

      that.applySettings = () => {
        const settings = that.settings;
        const applyTogglePair = (enabled, enabledId, disabledId, setter) => {
          setter(enabled);
          setChecked(enabledId, enabled);
          setChecked(disabledId, !enabled);
        };
        const applySelectSetting = (id, value, setter) => {
          setter(value);
          setSelectValue(id, value);
        };
        const applyCheckboxSetting = (id, checked, setter) => {
          if (setter) {
            setter(checked);
          }
          setChecked(id, checked);
        };

        applyTogglePair(
          settings.trad_mode,
          "use_plainbopomofo",
          "use_mcbopomofo",
          (enabled) => controller.setTraditionalMode(enabled)
        );
        applyTogglePair(
          settings.chinese_conversion,
          "chinese_convert_simp",
          "chinese_convert_trad",
          (enabled) => controller.setChineseConversionEnabled(enabled)
        );
        applyTogglePair(
          settings.half_width_punctuation,
          "half_width_punctuation",
          "full_width_punctuation",
          (enabled) => controller.setHalfWidthPunctuationEnabled(enabled)
        );

        applySelectSetting("layout", settings.layout, (value) =>
          controller.setKeyboardLayout(value)
        );
        applySelectSetting("keys", settings.candidate_keys, (value) =>
          controller.setCandidateKeys(value)
        );
        applySelectSetting(
          "keys_count",
          settings.candidate_keys_count,
          (value) => controller.setCandidateKeysCount(value)
        );
        applySelectSetting(
          "moving_cursor_option",
          settings.moving_cursor_option,
          (value) => controller.setMovingCursorOption(value)
        );
        applySelectSetting(
          "ctrl_enter_option",
          settings.ctrl_enter_option,
          (value) => controller.setCtrlEnterOption(value)
        );

        if (settings.select_phrase === "before_cursor") {
          controller.setSelectPhrase("before_cursor");
          setChecked("before_cursor", true);
          setChecked("after_cursor", false);
        } else if (settings.select_phrase === "after_cursor") {
          controller.setSelectPhrase("after_cursor");
          setChecked("before_cursor", false);
          setChecked("after_cursor", true);
        }

        applyCheckboxSetting(
          "esc_key",
          settings.esc_key_clear_entire_buffer,
          (checked) => controller.setEscClearEntireBuffer(checked)
        );
        applyCheckboxSetting(
          "allow_change_prior_tone",
          settings.allow_changing_prior_tone,
          (checked) => controller.setAllowChangingPriorTone(checked)
        );
        applyCheckboxSetting(
          "repeated_punctuation_choose_candidate",
          settings.repeated_punctuation_choose_candidate,
          (checked) => controller.setRepeatedPunctuationChooseCandidate(checked)
        );
        applyCheckboxSetting("beep_on_error", settings.beep_on_error);
        applyCheckboxSetting("move_cursor", settings.move_cursor, (checked) =>
          controller.setMoveCursorAfterSelection(checked)
        );

        if (settings.bopomofo_font_annotation_support_enabled) {
          globalUi.startSupportBpmfvsFont();
        } else {
          globalUi.stopSupportBpmfvsFont();
        }
        applyCheckboxSetting(
          "bopomofo_font_annotation_support_enabled",
          settings.bopomofo_font_annotation_support_enabled,
          (checked) =>
            controller.setBopomofoFontAnnotationSupportEnabled(checked)
        );

        applyTogglePair(
          settings.letter_mode === "upper",
          "uppercase_letters",
          "lowercase_letters",
          (isUpper) => controller.setLetterMode(isUpper ? "upper" : "lower")
        );
      };

      that.loadUserPhrases = () => {
        const result = window.localStorage.getItem("user_phrases") || "";
        $("feature_user_phrases_text_area").value = result;
        focusElement("feature_user_phrases_text_area");
        console.log("userPhrases:\n" + result);
        controller.setUserPhrases(result);
        service.service.setUserPhrases(result);
      };

      that.saveUserPhrases = (result) => {
        window.localStorage.setItem("user_phrases", result);
        controller.setUserPhrases(result);
        service.service.setUserPhrases(result);
        $("feature_user_phrases_text_area").value = result;
        focusElement("feature_user_phrases_text_area");
      };

      that.loadExcludedPhrases = () => {
        const result = window.localStorage.getItem("excluded_phrases") || "";
        $("feature_excluded_phrases_text_area").value = result;
        focusElement("feature_excluded_phrases_text_area");
        console.log("excludedPhrases:\n" + result);
        controller.setExcludedPhrases(result);
        service.service.setExcludedPhrases(result);
      };

      that.saveExcludedPhrases = (result) => {
        window.localStorage.setItem("excluded_phrases", result);
        controller.setExcludedPhrases(result);
        service.service.setExcludedPhrases(result);
        $("feature_excluded_phrases_text_area").value = result;
        focusElement("feature_excluded_phrases_text_area");
      };

      return that;
    })();

    const databaseManager = (() => {
      let that = {};
      let db;

      that.init = async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("McBopomofoWeb", 1);
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("user_data")) {
              db.createObjectStore("user_data", { keyPath: "key" });
            }
          };
          request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
          };
          request.onerror = (event) => {
            console.error("Database error: ", event.target.error);
            reject(event.target.error);
          };
        });
      };

      that.loadLastText = async () => {
        return new Promise((resolve, reject) => {
          if (!db) {
            resolve("");
            return;
          }
          const transaction = db.transaction(["user_data"], "readonly");
          const store = transaction.objectStore("user_data");
          const request = store.get("last_text");
          request.onsuccess = () => {
            resolve(request.result ? request.result.value : "");
          };
          request.onerror = (event) => {
            console.error("Transaction error: ", event.target.error);
            reject(event.target.error);
          };
        });
      };

      that.saveLastText = (text) => {
        if (!db) return;
        const transaction = db.transaction(["user_data"], "readwrite");
        const store = transaction.objectStore("user_data");
        store.put({ key: "last_text", value: text });
      };

      return that;
    })();

    const screenKeyboard = (() => {
      const api = {
        isLock: false,
        isShift: false,
        isCtrl: false,
      };

      const Keyboard = window.SimpleKeyboard.default;
      const keyboard = new Keyboard({
        onKeyPress: (button) => handleKeyPress(button),
      });

      const defaultLayout = [
        "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
        "{tab} q w e r t y u i o p [ ] \\",
        "{lock} a s d f g h j k l ; ' {enter}",
        "{shift} z x c v b n m , . / {shift}",
        "{ctrl} {space}",
      ];
      const shiftLayout = [
        "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
        "{tab} Q W E R T Y U I O P { } |",
        '{lock} A S D F G H J K L : " {enter}',
        "{shift} Z X C V B N M < > ? {shift}",
        "{ctrl} {space}",
      ];

      function handleModifierButton(button) {
        if (button === "{lock}") {
          api.isLock = !api.isLock;
        } else if (button === "{shift}") {
          api.isShift = !api.isShift;
        } else if (button === "{ctrl}") {
          api.isCtrl = !api.isCtrl;
        } else {
          return false;
        }
        api.loadLayout();
        return true;
      }

      function handleFallbackButton(button) {
        if (button === "{enter}") {
          ui.commitString("\n");
        } else if (button === "{space}") {
          ui.commitString(" ");
        } else if (button === "{bksp}") {
          ui.backspace();
        }
      }

      function handleKeyPress(button) {
        if (handleModifierButton(button)) {
          return;
        }

        const handled = controller.simpleKeyboardEvent(
          button,
          api.isShift || api.isLock,
          api.isCtrl
        );
        focusElement("text_area");

        if (api.isShift) {
          api.isShift = false;
          api.loadLayout();
        }
        if (api.isCtrl) {
          api.isCtrl = false;
          api.loadLayout();
        }
        if (!handled) {
          handleFallbackButton(button);
        }
      }

      function buildKeyboardDisplay() {
        // const manager = inputMethod.tableManager;
        // const names = manager.currentTable.table.keynames;
        const names = controller.readableLayoutKeys;
        const display = {
          "{tab}": "⇥",
          "{lock}": "Lock",
          "{shift}": "⇧ Shift",
          "{bksp}": "⌫",
          "{enter}": "↵",
          "{space}": "Space",
          "{ctrl}": "⌃",
        };

        console.log(names);
        if (!api.isCtrl) {
          for (const [key, value] of names) {
            display[key] = value;
          }
        }

        return display;
      }

      function buildButtonTheme() {
        const buttonTheme = [];
        if (api.isLock) {
          buttonTheme.push({ class: "hg-button-active", buttons: "{lock}" });
        }
        if (api.isShift) {
          buttonTheme.push({ class: "hg-button-active", buttons: "{shift}" });
        }
        if (api.isCtrl) {
          buttonTheme.push({ class: "hg-button-active", buttons: "{ctrl}" });
        }
        return buttonTheme;
      }

      api.loadLayout = () => {
        keyboard.setOptions({
          display: buildKeyboardDisplay(),
          layout: {
            default: api.isShift || api.isLock ? shiftLayout : defaultLayout,
          },
          buttonTheme: buildButtonTheme(),
        });
      };

      return api;
    })();

    (async function () {
      ui.updateByAlphabetMode();
      settingsManager.loadSettings();
      settingsManager.applySettings();
      settingsManager.loadUserPhrases();
      settingsManager.loadExcludedPhrases();
      screenKeyboard.loadLayout();

      let shiftKeyIsPressed = false;
      let isComposing = false;

      $("text_area").addEventListener("compositionstart", (event) => {
        isComposing = true;
        const warning = $("ime_warning");
        if (warning) {
          warning.style.display = "block";
        }
      });

      $("text_area").addEventListener("compositionend", (event) => {
        isComposing = false;
        const warning = $("ime_warning");
        if (warning) {
          warning.style.display = "none";
        }
      });

      $("text_area").addEventListener("keyup", (event) => {
        if (isComposing || event.isComposing) {
          return;
        }

        if (event.key === "Shift" && shiftKeyIsPressed) {
          globalUi.alphabetMode = !globalUi.alphabetMode;
          controller.reset();
          return;
        }
      });

      $("text_area").addEventListener("keydown", (event) => {
        if (isComposing || event.isComposing || event.keyCode === 229) {
          return;
        }

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

      $("use_mcbopomofo").onchange = (event) => {
        controller.setTraditionalMode(false);
        settingsManager.settings.trad_mode = false;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("use_plainbopomofo").onchange = (event) => {
        controller.setTraditionalMode(true);
        settingsManager.settings.trad_mode = true;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("chinese_convert_trad").onchange = (event) => {
        controller.setChineseConversionEnabled(false);
        settingsManager.settings.chinese_conversion = false;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("chinese_convert_simp").onchange = (event) => {
        controller.setChineseConversionEnabled(true);
        settingsManager.settings.chinese_conversion = true;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("full_width_punctuation").onchange = (event) => {
        controller.setHalfWidthPunctuationEnabled(false);
        settingsManager.settings.half_width_punctuation = false;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("half_width_punctuation").onchange = (event) => {
        controller.setHalfWidthPunctuationEnabled(true);
        settingsManager.settings.half_width_punctuation = true;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("layout").onchange = (event) => {
        const value = getValue("layout");
        controller.setKeyboardLayout(value);
        settingsManager.settings.layout = value;
        settingsManager.saveSettings();
        screenKeyboard.loadLayout();
        focusElement("text_area");
      };

      $("layout").onblur = (event) => {
        focusElement("text_area");
      };

      $("keys").onchange = (event) => {
        const value = getValue("keys");
        controller.setCandidateKeys(value);
        settingsManager.settings.candidate_keys = value;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("keys").onblur = (event) => {
        focusElement("text_area");
      };

      $("keys_count").onchange = (event) => {
        const value = +getValue("keys_count");
        controller.setCandidateKeysCount(value);
        settingsManager.settings.candidate_keys_count = value;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("keys_count").onblur = (event) => {
        focusElement("text_area");
      };

      $("moving_cursor_option").onchange = (event) => {
        const value = +getValue("moving_cursor_option");
        controller.setMovingCursorOption(value);
        settingsManager.settings.moving_cursor_option = value;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("before_cursor").onchange = (event) => {
        controller.setSelectPhrase("before_cursor");
        settingsManager.settings.select_phrase = "before_cursor";
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("after_cursor").onchange = (event) => {
        controller.setSelectPhrase("after_cursor");
        settingsManager.settings.select_phrase = "after_cursor";
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("esc_key").onchange = (event) => {
        const checked = getChecked("esc_key");
        controller.setEscClearEntireBuffer(checked);
        settingsManager.settings.esc_key_clear_entire_buffer = checked;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("allow_change_prior_tone").onchange = (event) => {
        const checked = getChecked("allow_change_prior_tone");
        controller.setAllowChangingPriorTone(checked);
        settingsManager.settings.allow_changing_prior_tone = checked;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("repeated_punctuation_choose_candidate").onchange = (event) => {
        const checked = getChecked("repeated_punctuation_choose_candidate");
        controller.setRepeatedPunctuationChooseCandidate(checked);
        settingsManager.settings.repeated_punctuation_choose_candidate =
          checked;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("bopomofo_font_annotation_support_enabled").onchange = (event) => {
        const checked = getChecked("bopomofo_font_annotation_support_enabled");
        controller.setBopomofoFontAnnotationSupportEnabled(checked);
        settingsManager.settings.bopomofo_font_annotation_support_enabled =
          checked;
        settingsManager.saveSettings();
        if (checked) {
          globalUi.startSupportBpmfvsFont();
        } else {
          globalUi.stopSupportBpmfvsFont();
        }
        focusElement("text_area");
      };

      $("uppercase_letters").onchange = (event) => {
        controller.setLetterMode("upper");
        settingsManager.settings.letter_mode = "upper";
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("lowercase_letters").onchange = (event) => {
        controller.setLetterMode("lower");
        settingsManager.settings.letter_mode = "lower";
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("move_cursor").onchange = (event) => {
        const checked = getChecked("move_cursor");
        controller.setMoveCursorAfterSelection(checked);
        settingsManager.settings.move_cursor = checked;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("ctrl_enter_option").onchange = (event) => {
        const value = +getValue("ctrl_enter_option");
        controller.setCtrlEnterOption(value);
        settingsManager.settings.ctrl_enter_option = value;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("beep_on_error").onchange = (event) => {
        const value = getChecked("beep_on_error");
        settingsManager.settings.beep_on_error = value;
        settingsManager.saveSettings();
        focusElement("text_area");
      };

      $("fullscreen").onclick = (event) => {
        const elem = $("edit_area");
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
        focusElement("text_area");
        return false;
      };

      // $("text_area").onblur = () => {
      //   controller.reset();
      // };

      $("loading").innerText = "載入完畢！";
      setTimeout(() => {
        setDisplay("loading", "none");
        onHashChange({ focus: false });
      }, 2000);
      ui.reset();

      const featureTitlePrefix = "小麥注音輸入法 - ";
      const featureConfig = {
        feature_input: ["text_area", "輸入功能"],
        feature_user_phrases: ["feature_user_phrases_text_area", "自定詞管理"],
        feature_excluded_phrases: [
          "feature_excluded_phrases_text_area",
          "管理排除的詞彙",
        ],
        feature_text_to_braille: [
          "text_to_braille_text_area",
          "中文轉注音點字",
        ],
        feature_braille_to_text: [
          "braille_to_text_text_area",
          "注音點字轉中文",
        ],
        feature_add_bpmf: ["add_bpmf_text_area", "國字加注音"],
        feature_convert_hanyupnyin: [
          "convert_hanyupnyin_text_area",
          "國字轉拼音",
        ],
        feature_generate_phrases: ["phrase_generate_input", "詞庫產生工具"],
      };

      function toggle_feature(id, options = {}) {
        const { focus = true } = options;
        for (const feature of Object.keys(featureConfig)) {
          setDisplay(feature, "none");
        }
        console.log("Toggling feature:", id);
        setDisplay(id, "flex");
        const config = featureConfig[id];
        if (config) {
          const [focusId, title] = config;
          if (focus) {
            focusElement(focusId);
          }
          document.title = featureTitlePrefix + title;
        }
        resetInitialScrollPosition();
      }

      function onHashChange(options = {}) {
        const hash = window.location.hash;
        const featureId = hash.length > 1 ? hash.substring(1) : "feature_input";
        toggle_feature(featureId, options);
      }

      function resetInitialScrollPosition() {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }

      window.addEventListener("hashchange", () => {
        onHashChange();
      });
      document.addEventListener("DOMContentLoaded", (event) => {
        if (window.location.hash.length === 0) {
          window.history.replaceState(null, "", "#feature_input");
        }
        onHashChange({ focus: false });
        window.requestAnimationFrame(() => {
          resetInitialScrollPosition();
        });
      });

      $("text_area").addEventListener("input", (event) => {
        // console.log("Text changed:", event.target.value);
        databaseManager.saveLastText(event.target.value);
      });
      await databaseManager.init();
      databaseManager.loadLastText().then((text) => {
        $("text_area").value = text;
      });
    })();

    let example = {};
    example.ui = ui;
    example.globalUi = globalUi;
    example.controller = controller;
    example.service = service;
    example.settingsManager = settingsManager;
    example.screenKeyboard = screenKeyboard;
    window.example = example;
  })();
}
