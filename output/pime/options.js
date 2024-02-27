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
      if (settings.letter_mode === "upper") {
        document.getElementById("uppercase_letters").checked = true;
        document.getElementById("lowercase_letters").checked = false;
      } else if (settings.letter_mode === "lower") {
        document.getElementById("uppercase_letters").checked = false;
        document.getElementById("lowercase_letters").checked = true;
      }
    }
  }

  function saveSettings(settings) {
    // chrome.storage.sync.set({ settings: settings }, () => {
    //   // debug(JSON.stringify(settings));
    // });
  }

  const xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    document.getElementById("demo").innerHTML = this.responseText;
  };
  xhttp.open("GET", "/config");
  xhttp.send();

  // chrome.storage.sync.get("settings", (value) => {
  //   settings = value.settings;
  //   if (settings == undefined) {
  //     settings = {};
  //   }
  //   applySettings(settings);
  // });

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
};
