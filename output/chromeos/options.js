window.onload = () => {
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
    allow_changing_prior_tone: false,
  };

  let settings = {};
  const $ = (id) => document.getElementById(id);
  const L = (key) => chrome.i18n.getMessage(key);

  function applySettings(settings) {
    {
      if (settings.input_mode === "use_plainbopomofo") {
        $("use_plainbopomofo").checked = true;
      } else {
        $("use_mcbopomofo").checked = true;
      }
    }
    {
      const select = $("layout");
      const options = select.getElementsByTagName("option");
      for (const option of options) {
        if (option.value === settings.layout) {
          option.selected = "selected";
          break;
        }
      }
    }
    {
      const select = $("keys");
      const options = select.getElementsByTagName("option");
      for (const option of options) {
        if (option.value === settings.candidate_keys) {
          option.selected = "selected";
          break;
        }
      }
    }
    {
      const select = $("keys_count");
      const options = select.getElementsByTagName("option");
      for (const option of options) {
        if (option.value == settings.candidate_keys_count) {
          option.selected = "selected";
          break;
        }
      }
    }
    {
      if (settings.select_phrase === "before_cursor") {
        $("before_cursor").checked = true;
        $("after_cursor").checked = false;
      } else if (settings.select_phrase === "after_cursor") {
        $("before_cursor").checked = false;
        $("after_cursor").checked = true;
      }
    }
    {
      const select = $("moving_cursor_option");
      const options = select.getElementsByTagName("option");
      for (const option of options) {
        if (option.value === settings.moving_cursor_option) {
          option.selected = "selected";
          break;
        }
      }
    }
    {
      $("shift_key").checked = settings.shift_key_toggle_alphabet_mode;
      $("esc_key").checked = settings.esc_key_clear_entire_buffer;
      $("move_cursor").checked = settings.move_cursor;
      $("use_notification").checked = settings.use_notification;
      $("allow_change_prior_tone").checked = settings.allow_changing_prior_tone;
      $("repeated_punctuation_choose_candidate").checked =
        settings.repeated_punctuation_choose_candidate;
    }
    {
      if (settings.letter_mode === "upper") {
        $("uppercase_letters").checked = true;
        $("lowercase_letters").checked = false;
      } else if (settings.letter_mode === "lower") {
        $("uppercase_letters").checked = false;
        $("lowercase_letters").checked = true;
      }
    }
    {
      const select = $("ctrl_enter_option");
      const options = select.getElementsByTagName("option");
      for (const option of options) {
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

  $("use_mcbopomofo").onchange = (event) => {
    settings.input_mode = "use_mcbopomofo";
    saveSettings(settings);
  };

  $("use_plainbopomofo").onchange = (event) => {
    settings.input_mode = "use_plainbopomofo";
    saveSettings(settings);
  };

  $("layout").onchange = (event) => {
    const value = $("layout").value;
    settings.layout = value;
    saveSettings(settings);
  };

  $("keys").onchange = (event) => {
    const value = $("keys").value;
    settings.candidate_keys = value;
    saveSettings(settings);
  };

  $("keys_count").onchange = (event) => {
    const value = $("keys_count").value;
    settings.candidate_keys_count = +value;
    saveSettings(settings);
  };

  $("before_cursor").onchange = (event) => {
    settings.select_phrase = "before_cursor";
    saveSettings(settings);
  };

  $("after_cursor").onchange = (event) => {
    settings.select_phrase = "after_cursor";
    saveSettings(settings);
  };

  $("esc_key").onchange = (event) => {
    const checked = $("esc_key").checked;
    settings.esc_key_clear_entire_buffer = checked;
    saveSettings(settings);
  };

  $("moving_cursor_option").onchange = function (event) {
    const value = $("moving_cursor_option").value;
    settings.moving_cursor_option = +value;
    saveSettings(settings);
  };

  $("use_notification").onchange = function (event) {
    const checked = $("use_notification").checked;
    settings.use_notification = checked;
    saveSettings(settings);
  };

  $("shift_key").onchange = (event) => {
    const checked = $("shift_key").checked;
    settings.shift_key_toggle_alphabet_mode = checked;
    saveSettings(settings);
  };

  $("uppercase_letters").onchange = (event) => {
    settings.letter_mode = "upper";
    saveSettings(settings);
  };

  $("lowercase_letters").onchange = (event) => {
    settings.letter_mode = "lower";
    saveSettings(settings);
  };

  $("move_cursor").onchange = (event) => {
    const checked = $("move_cursor").checked;
    settings.move_cursor = checked;
    saveSettings(settings);
  };

  $("allow_change_prior_tone").onchange = (event) => {
    const checked = $("allow_change_prior_tone").checked;
    settings.allow_changing_prior_tone = checked;
    saveSettings(settings);
  };

  $("repeated_punctuation_choose_candidate").onchange = (event) => {
    const checked = $("repeated_punctuation_choose_candidate").checked;
    settings.repeated_punctuation_choose_candidate = checked;
    saveSettings(settings);
  };

  $("others_manage_user_phrases").onclick = (event) => {
    function tryOpen(url) {
      chrome.tabs.query({ url: url }).then((tabs) => {
        if (tabs.length == 0) {
          chrome.tabs.create({ active: true, url: url });
          return;
        }
        const tabId = tabs[0].id;
        if (tabId === undefined) {
          chrome.tabs.create({ active: true, url: url });
        } else {
          chrome.tabs.update(tabId, { selected: true });
        }
      });
    }
    const page = "user_phrase.html";
    const url = chrome.runtime.getURL(page);
    tryOpen(url);
    return false;
  };

  $("ctrl_enter_option").onchange = (event) => {
    const value = +$("ctrl_enter_option").value;
    settings.ctrl_enter_option = value;
    saveSettings(settings);
  };

  window.document.title = L("optionTitle");

  $("input_mode_title").innerText = L("input_mode_title");
  $("use_mcbopomofo_label").innerText = L("use_mcbopomofo");
  $("use_plainbopomofo_label").innerText = L("use_plainbopomofo");

  $("options_title").innerText = L("optionTitle");
  $("keyboard_layout").innerText = L("optionKeyboardLayout");
  $("keyboard_layout_standard").innerText = L("optionKeyboardLayoutStandard");
  $("keyboard_layout_eten").innerText = L("optionKeyboardLayoutEten");
  $("keyboard_layout_hsu").innerText = L("optionKeyboardLayoutHsu");
  $("keyboard_layout_eten26").innerText = L("optionKeyboardLayoutEten26");
  $("keyboard_layout_hanyupinyin").innerText = L(
    "optionKeyboardLayoutHanyuPinyin"
  );
  $("keyboard_layout_ibm").innerText = L("optionKeyboardLayoutIBM");

  $("candidate_keys").innerText = L("optionCandidateKeys");

  $("select_candidate").innerText = L("optionSelectCandidate");

  $("select_candidate_before_cursor").innerText = L(
    "optionSelectCandidateBeforeCursor"
  );
  $("select_candidate_after_cursor").innerText = L(
    "optionSelectCandidateAfterCursor"
  );
  $("select_candidate_move_cursor").innerText = L(
    "optionSelectCandidateMoveCursor"
  );

  $("esc_key_title").innerText = L("optionEscKeyTitle");
  $("esc_key_label").innerText = L("optionEscKeyLabel");

  $("shift_key_title").innerText = L("optionShiftKeyTitle");
  $("shift_key_label").innerText = L("optionShiftKeyLabel");

  $("shift_letter_title").innerText = L("optionShiftLetterTitle");
  $("shift_letter_uppercase").innerText = L("optionShiftLetterUppercase");
  $("shift_letter_lowercase").innerText = L("optionShiftLetterLowercase");

  $("others_keyboard_shortcut").innerText = L("others_keyboard_shortcut");

  $("ctrl_enter_title").innerText = L("ctrl_enter_key");
  $("ctrl_enter_option_0").innerText = L("ctrl_enter_none");
  $("ctrl_enter_option_1").innerText = L("ctrl_enter_bpmf_reading");
  $("ctrl_enter_option_2").innerText = L("ctrl_enter_html_ruby");
  $("ctrl_enter_option_3").innerText = L(
    "ctrl_enter_taiwanese_braille_unicode"
  );
  $("ctrl_enter_option_5").innerText = L("ctrl_enter_taiwanese_braille_ascii");
  $("ctrl_enter_option_4").innerText = L("ctrl_enter_hanyu_pinyin");

  $("others_title").innerText = L("optionOthersTitle");
  $("others_manage_user_phrases").innerText = L("optionOtherManageUserPhrases");
  $("candidate_keys_count").innerText = L("candidate_keys_count");
  $("system").innerText = L("system");
  $("use_notification_label").innerText = L("use_notification");

  $("when_choosing_candidates").innerText = L("when_choosing_candidates");
  $("moving_cursor_is_not_allowed").innerText = L(
    "moving_cursor_is_not_allowed"
  );
  $("jk_keys_move_the_cursor").innerText = L("jk_keys_move_the_cursor");
  $("hl_keys_move_the_cursor").innerText = L("hl_keys_move_the_cursor");

  $("repeated_punctuation_choose_candidate_title").innerText = L(
    "repeated_punctuation_choose_candidate_title"
  );

  $("repeated_punctuation_choose_candidate_label").innerText = L(
    "repeated_punctuation_choose_candidate_label"
  );

  $("tone_keys_title").innerText = L("tone_keys_title");
  $("allow_change_prior_tone_label").innerText = L(
    "allow_change_prior_tone_label"
  );
  $("user_phrases_link").innerText = L("user_phrases_link");
  $("excluded_phrases_link").innerText = L("excluded_phrases_link");
};
