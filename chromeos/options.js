window.onload = () => {
  let settings = {};

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
      document.getElementById("move_cursor").checked = settings.move_cursor;
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
      let value = settings.composing_buffer_size;
      if (value === undefined) value = 10;
      if (value < 4) value = 4;
      if (value > 100) value = 100;
      document.getElementById("composing_buffer_size").value = value;
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
      settings = {};
    }
    applySettings(settings);
  });

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

  document.getElementById("composing_buffer_size").onchange = function (event) {
    let value = document.getElementById("composing_buffer_size").value;
    let size = parseInt(value);
    if (isNaN(size)) {
      return;
    }
    if (size < 4) {
      size = 4;
    }
    if (size > 100) {
      size = 100;
    }
    settings.composing_buffer_size = size;
    saveSettings(settings);
  };
};
