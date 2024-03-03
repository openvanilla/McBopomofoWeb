window.onload = () => {
  let settings = {
    layout: "standard",
    select_phrase: "before_cursor",
    candidate_keys: "123456789",
    esc_key_clear_entire_buffer: false,
    shift_key_toggle_alphabet_mode: true,
    half_width_punctuation: false,
    chinese_conversion: false,
    move_cursor: false,
    letter_mode: "upper",
    ctrl_enter_option: 0,
    by_default_deactivated: false,
    beep_on_error: true,
  };

  function applySettings(settings) {
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
      if (settings.select_phrase === "before_cursor") {
        document.getElementById("before_cursor").checked = true;
        document.getElementById("after_cursor").checked = false;
      } else if (settings.select_phrase === "after_cursor") {
        document.getElementById("before_cursor").checked = false;
        document.getElementById("after_cursor").checked = true;
      }
    }
    {
      document.getElementById("esc_key").checked =
        settings.esc_key_clear_entire_buffer;
    }
    {
      let enabled = settings.shift_key_toggle_alphabet_mode;
      if (enabled === undefined) {
        enabled = true;
      }
      document.getElementById("shift_key").checked = enabled;
    }
    {
      document.getElementById("move_cursor").checked = settings.move_cursor;
    }

    {
      document.getElementById("ctrl_enter_option").onchange = function (event) {
        let value = document.getElementById("ctrl_enter_option").value;
        value = +value;
        settings.ctrl_enter_option = value;
        saveSettings(settings);
      };
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
        if (option.value == settings.ctrl_option) {
          option.selected = "selected";
          break;
        }
      }
    }

    {
      document.getElementById("by_default_deactivated").checked =
        settings.by_default_deactivated;
    }
    {
      document.getElementById("beep_on_error").checked = settings.beep_on_error;
    }
  }

  function saveSettings(settings) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/config");
    let string = JSON.stringify(settings);
    xhttp.send(string);
  }

  (function () {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      try {
        settings = JSON.parse(this.responseText);
        if (settings == undefined) {
          settings = {};
        }
        console.log("settings loaded: " + settings);
      } catch {
        settings = {};
      }
      applySettings(settings);
    };
    xhttp.open("GET", "/config");
    xhttp.send();
  })();

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

  document.getElementById("by_default_deactivated").onchange = (event) => {
    let checked = document.getElementById("by_default_deactivated").checked;
    settings.by_default_deactivated = checked;
    saveSettings(settings);
  };

  document.getElementById("beep_on_error").onchange = (event) => {
    let checked = document.getElementById("beep_on_error").checked;
    settings.by_default_deactivated = checked;
    saveSettings(settings);
  };
};
