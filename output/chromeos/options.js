window.onload = () => {
  let settings = {};
  const defaultSettings = {
    input_mode: "use_mcbopomofo",
    layout: "standard",
    select_phrase: "before_cursor",
    candidate_keys: "123456789",
    candidate_keys_count: 9,
    esc_key_clear_entire_buffer: false,
    moving_cursor_option: 0,
    shift_key_toggle_alphabet_mode: true,
    half_width_punctuation: false,
    chinese_conversion: false,
    move_cursor: false,
    letter_mode: "upper",
    ctrl_enter_option: 0,
    use_notification: true,
    repeated_punctuation_choose_candidate: false,
  };

  function applySettings(settings) {
    {
      if (settings.input_mode === "use_plainbopomofo") {
        document.getElementById("use_plainbopomofo").checked = true;
      } else {
        document.getElementById("use_mcbopomofo").checked = true;
      }
    }
    {
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
      let select = document.getElementById("keys_count");
      let options = select.getElementsByTagName("option");
      for (let option of options) {
        if (option.value == settings.candidate_keys_count) {
          option.selected = "selected";
          break;
        }
      }
    }
    {
      if (settings.select_phrase === "before_cursor") {
        document.getElementById("before_cursor").checked = true;
        document.getElementById("after_cursor").checked = false;
      } else if (settings.select_phrase === "after_cursor") {
        document.getElementById("before_cursor").checked = false;
        document.getElementById("after_cursor").checked = true;
      }
    }
    {
      let select = document.getElementById("moving_cursor_option");
      let options = select.getElementsByTagName("option");
      for (let option of options) {
        if (option.value === settings.moving_cursor_option) {
          option.selected = "selected";
          break;
        }
      }
    }
    {
      document.getElementById("shift_key").checked =
        settings.shift_key_toggle_alphabet_mode;
      document.getElementById("esc_key").checked =
        settings.esc_key_clear_entire_buffer;
      document.getElementById("move_cursor").checked = settings.move_cursor;
      document.getElementById("use_notification").checked =
        settings.use_notification;
      document.getElementById("repeated_punctuation_choose_candidate").checked =
        settings.repeated_punctuation_choose_candidate;
    }
    {
      if (settings.letter_mode === "upper") {
        document.getElementById("uppercase_letters").checked = true;
        document.getElementById("lowercase_letters").checked = false;
      } else if (settings.letter_mode === "lower") {
        document.getElementById("uppercase_letters").checked = false;
        document.getElementById("lowercase_letters").checked = true;
      }
    }
    {
      let select = document.getElementById("ctrl_enter_option");
      let options = select.getElementsByTagName("option");
      for (let option of options) {
        if (option.value == settings.ctrl_enter_option) {
          option.selected = "selected";
          break;
        }
      }
    }
  }

  function saveSettings(settings) {
    chrome.storage.sync.set({ settings: settings }, () => {
      // debug(JSON.stringify(settings));
    });
  }

  chrome.storage.sync.get("settings", (value) => {
    settings = value.settings;
    if (settings == undefined) {
      settings = defaultSettings;
    }
    for (let key in defaultSettings) {
      if (!(key in settings)) {
        settings[key] = defaultSettings[key];
      }
    }
    applySettings(settings);
  });

  document.getElementById("use_mcbopomofo").onchange = (event) => {
    settings.input_mode = "use_mcbopomofo";
    saveSettings(settings);
  };

  document.getElementById("use_plainbopomofo").onchange = (event) => {
    settings.input_mode = "use_plainbopomofo";
    saveSettings(settings);
  };

  document.getElementById("layout").onchange = (event) => {
    let value = document.getElementById("layout").value;
    settings.layout = value;
    saveSettings(settings);
  };

  document.getElementById("keys").onchange = (event) => {
    let value = document.getElementById("keys").value;
    settings.candidate_keys = value;
    saveSettings(settings);
  };

  document.getElementById("keys_count").onchange = (event) => {
    let value = document.getElementById("keys_count").value;
    settings.candidate_keys_count = +value;
    saveSettings(settings);
  };

  document.getElementById("before_cursor").onchange = (event) => {
    settings.select_phrase = "before_cursor";
    saveSettings(settings);
  };

  document.getElementById("after_cursor").onchange = (event) => {
    settings.select_phrase = "after_cursor";
    saveSettings(settings);
  };

  document.getElementById("esc_key").onchange = (event) => {
    let checked = document.getElementById("esc_key").checked;
    settings.esc_key_clear_entire_buffer = checked;
    saveSettings(settings);
  };

  document.getElementById("moving_cursor_option").onchange = function (event) {
    let value = document.getElementById("moving_cursor_option").value;
    settings.moving_cursor_option = +value;
    saveSettings(settings);
  };

  document.getElementById("use_notification").onchange = function (event) {
    let checked = document.getElementById("use_notification").checked;
    settings.use_notification = checked;
    saveSettings(settings);
  };

  document.getElementById("shift_key").onchange = (event) => {
    let checked = document.getElementById("shift_key").checked;
    settings.shift_key_toggle_alphabet_mode = checked;
    saveSettings(settings);
  };

  document.getElementById("uppercase_letters").onchange = (event) => {
    settings.letter_mode = "upper";
    saveSettings(settings);
  };

  document.getElementById("lowercase_letters").onchange = (event) => {
    settings.letter_mode = "lower";
    saveSettings(settings);
  };

  document.getElementById("move_cursor").onchange = (event) => {
    let checked = document.getElementById("move_cursor").checked;
    settings.move_cursor = checked;
    saveSettings(settings);
  };

  document.getElementById("repeated_punctuation_choose_candidate").onchange = (
    event
  ) => {
    let checked = document.getElementById(
      "repeated_punctuation_choose_candidate"
    ).checked;
    settings.repeated_punctuation_choose_candidate = checked;
    saveSettings(settings);
  };

  document.getElementById("others_manage_user_phrases").onclick = (event) => {
    function tryOpen(url) {
      chrome.tabs.query({ url: url }).then((tabs) => {
        if (tabs.length == 0) {
          chrome.tabs.create({ active: true, url: url });
          return;
        }
        let tabId = tabs[0].id;
        if (tabId === undefined) {
          chrome.tabs.create({ active: true, url: url });
        } else {
          chrome.tabs.update(tabId, { selected: true });
        }
      });
    }
    let page = "user_phrase.html";
    let url = chrome.runtime.getURL(page);
    tryOpen(url);
    return false;
  };

  document.getElementById("ctrl_enter_option").onchange = (event) => {
    let value = document.getElementById("ctrl_enter_option").value;
    value = +value;
    settings.ctrl_enter_option = value;
    saveSettings(settings);
  };

  window.document.title = chrome.i18n.getMessage("optionTitle");

  document.getElementById("input_mode_title").innerText =
    chrome.i18n.getMessage("input_mode_title");
  document.getElementById("use_mcbopomofo_label").innerText =
    chrome.i18n.getMessage("use_mcbopomofo");
  document.getElementById("use_plainbopomofo_label").innerText =
    chrome.i18n.getMessage("use_plainbopomofo");

  document.getElementById("options_title").innerText =
    chrome.i18n.getMessage("optionTitle");
  document.getElementById("keyboard_layout").innerText = chrome.i18n.getMessage(
    "optionKeyboardLayout"
  );
  document.getElementById("keyboard_layout_standard").innerText =
    chrome.i18n.getMessage("optionKeyboardLayoutStandard");
  document.getElementById("keyboard_layout_eten").innerText =
    chrome.i18n.getMessage("optionKeyboardLayoutEten");
  document.getElementById("keyboard_layout_hsu").innerText =
    chrome.i18n.getMessage("optionKeyboardLayoutHsu");
  document.getElementById("keyboard_layout_eten26").innerText =
    chrome.i18n.getMessage("optionKeyboardLayoutEten26");
  document.getElementById("keyboard_layout_hanyupinyin").innerText =
    chrome.i18n.getMessage("optionKeyboardLayoutHanyuPinyin");
  document.getElementById("keyboard_layout_ibm").innerText =
    chrome.i18n.getMessage("optionKeyboardLayoutIBM");

  document.getElementById("candidate_keys").innerText = chrome.i18n.getMessage(
    "optionCandidateKeys"
  );

  document.getElementById("select_candidate").innerText =
    chrome.i18n.getMessage("optionSelectCandidate");

  document.getElementById("select_candidate_before_cursor").innerText =
    chrome.i18n.getMessage("optionSelectCandidateBeforeCursor");
  document.getElementById("select_candidate_after_cursor").innerText =
    chrome.i18n.getMessage("optionSelectCandidateAfterCursor");
  document.getElementById("select_candidate_move_cursor").innerText =
    chrome.i18n.getMessage("optionSelectCandidateMoveCursor");

  document.getElementById("esc_key_title").innerText =
    chrome.i18n.getMessage("optionEscKeyTitle");
  document.getElementById("esc_key_label").innerText =
    chrome.i18n.getMessage("optionEscKeyLabel");

  document.getElementById("shift_key_title").innerText = chrome.i18n.getMessage(
    "optionShiftKeyTitle"
  );
  document.getElementById("shift_key_label").innerText = chrome.i18n.getMessage(
    "optionShiftKeyLabel"
  );

  document.getElementById("shift_letter_title").innerText =
    chrome.i18n.getMessage("optionShiftLetterTitle");
  document.getElementById("shift_letter_uppercase").innerText =
    chrome.i18n.getMessage("optionShiftLetterUppercase");
  document.getElementById("shift_letter_lowercase").innerText =
    chrome.i18n.getMessage("optionShiftLetterLowercase");

  document.getElementById("others_keyboard_shortcut").innerText =
    chrome.i18n.getMessage("others_keyboard_shortcut");

  document.getElementById("ctrl_enter_title").innerText =
    chrome.i18n.getMessage("ctrl_enter_key");
  document.getElementById("ctrl_enter_option_0").innerText =
    chrome.i18n.getMessage("ctrl_enter_none");
  document.getElementById("ctrl_enter_option_1").innerText =
    chrome.i18n.getMessage("ctrl_enter_bpmf_reading");
  document.getElementById("ctrl_enter_option_2").innerText =
    chrome.i18n.getMessage("ctrl_enter_html_ruby");
  document.getElementById("ctrl_enter_option_3").innerText =
    chrome.i18n.getMessage("ctrl_enter_taiwanese_braille");
  document.getElementById("ctrl_enter_option_4").innerText =
    chrome.i18n.getMessage("ctrl_enter_hanyu_pinyin");

  document.getElementById("others_title").innerText =
    chrome.i18n.getMessage("optionOthersTitle");
  document.getElementById("others_manage_user_phrases").innerText =
    chrome.i18n.getMessage("optionOtherManageUserPhrases");
  document.getElementById("candidate_keys_count").innerText =
    chrome.i18n.getMessage("candidate_keys_count");
  document.getElementById("system").innerText =
    chrome.i18n.getMessage("system");
  document.getElementById("use_notification_label").innerText =
    chrome.i18n.getMessage("use_notification");

  document.getElementById("when_choosing_candidates").innerText =
    chrome.i18n.getMessage("when_choosing_candidates");
  document.getElementById("moving_cursor_is_not_allowed").innerText =
    chrome.i18n.getMessage("moving_cursor_is_not_allowed");
  document.getElementById("jk_keys_move_the_cursor").innerText =
    chrome.i18n.getMessage("jk_keys_move_the_cursor");
  document.getElementById("hl_keys_move_the_cursor").innerText =
    chrome.i18n.getMessage("hl_keys_move_the_cursor");

  document.getElementById(
    "repeated_punctuation_choose_candidate_title"
  ).innerText = chrome.i18n.getMessage(
    "repeated_punctuation_choose_candidate_title"
  );

  document.getElementById(
    "repeated_punctuation_choose_candidate_label"
  ).innerText = chrome.i18n.getMessage(
    "repeated_punctuation_choose_candidate_label"
  );
};
