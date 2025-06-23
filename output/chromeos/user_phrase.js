window.onload = () => {
  // On ChromeOS, we store the user phrases in JSON format, but
  // the editor convert the JSON to phrases per line.
  function mapToText(map) {
    let text = "";
    for (let k in map) {
      let list = map[k];
      for (let v of list) {
        text += v + " " + k + "\n";
      }
    }
    return text;
  }

  function textToMap(text) {
    let lines = text.split("\n");
    let map = {};
    for (let line of lines) {
      let kv = line.split(" ");
      if (kv.length != 2) {
        continue;
      }
      let k = kv[1];
      let v = kv[0];
      let list = map[k];
      if (list === undefined) {
        list = [];
      }
      if (list.includes(v)) {
        continue;
      }
      list.push(v);
      map[k] = list;
    }
    return map;
  }

  function load_user_phrases() {
    chrome.storage.largeSync.get(["user_phrase"], (value) => {
      let jsonString = value.user_phrase;

      if (jsonString !== undefined) {
        try {
          let obj = JSON.parse(jsonString);
          if (obj) {
            let s = mapToText(obj);
            document.getElementById("text_area").value = s;
          }
        } catch (e) {
          console.log("failed to parse user_phrase:" + e);
        }
      }
    });
  }

  function load_excluded_phrases() {
    chrome.storage.largeSync.get(["excluded_phrase"], (value) => {
      let jsonString = value.user_phrase;

      if (jsonString !== undefined) {
        try {
          let obj = JSON.parse(jsonString);
          if (obj) {
            let s = mapToText(obj);
            document.getElementById("text_area_excluded_phrase").value = s;
          }
        } catch (e) {
          console.log("failed to parse user_phrase:" + e);
        }
      }
    });
  }

  document.getElementById("user_phrases_link").onclick = () => {
    document.getElementById("user_phrases").style.display = "block";
    document.getElementById("excluded_phrases").style.display = "none";
    document.getElementById("user_phrases_link").classList.add("active");
    document.getElementById("excluded_phrases_link").classList.remove("active");
    document.getElementById("text_area").focus();
    return false;
  };

  document.getElementById("excluded_phrases_link").onclick = () => {
    document.getElementById("user_phrases").style.display = "none";
    document.getElementById("excluded_phrases").style.display = "block";
    document.getElementById("user_phrases_link").classList.remove("active");
    document.getElementById("excluded_phrases_link").classList.add("active");
    document.getElementById("text_area_excluded_phrases").focus();
    return false;
  };

  document.getElementById("reload").onclick = () => {
    load_user_phrases();
    document.getElementById("text_area").focus();
  };

  document.getElementById("save").onclick = () => {
    let text = document.getElementById("text_area").value;
    let map = textToMap(text);
    let jsonString = JSON.stringify(map);
    chrome.storage.largeSync.set({ user_phrase: jsonString });
    console.log("write user_phrase done");

    chrome.runtime.sendMessage(
      { command: "reload_user_phrase" },
      function (response) {
        document.getElementById("text_area").focus();
      }
    );
  };

  document.getElementById("reload_excluded_phrases").onclick = () => {
    load_excluded_phrases();
    document.getElementById("text_area_excluded_phrases").focus();
  };

  document.getElementById("save_excluded_phrases").onclick = () => {
    let text = document.getElementById("text_area_excluded_phrases").value;
    let map = textToMap(text);
    let jsonString = JSON.stringify(map);
    chrome.storage.largeSync.set({ excluded_phrase: jsonString });
    console.log("write user_phrase done");

    chrome.runtime.sendMessage(
      { command: "reload_user_phrase" },
      function (response) {
        document.getElementById("text_area_excluded_phrases").focus();
      }
    );
  };

  window.document.title = chrome.i18n.getMessage("userPhrasesPageTitle");

  document.getElementById("user_phrases_title").innerText =
    chrome.i18n.getMessage("userPhrasesPageTitle");

  document.getElementById("reload").innerText =
    chrome.i18n.getMessage("btnReload");
  document.getElementById("reload_excluded_phrases").innerText =
    chrome.i18n.getMessage("btnReload");

  document.getElementById("save").innerText = chrome.i18n.getMessage("btnSave");
  document.getElementById("save_excluded_phrases").innerText =
    chrome.i18n.getMessage("btnSave");

  document.getElementById("text_area").placeholder =
    chrome.i18n.getMessage("placeholder");
  document.getElementById("text_area_excluded_phrases").placeholder =
    chrome.i18n.getMessage("placeholder");

  document.getElementById("user_phrases_link").placeholder =
    chrome.i18n.getMessage("user_phrases_link");
  document.getElementById("excluded_phrases_link").placeholder =
    chrome.i18n.getMessage("excluded_phrases_link");

  load_user_phrases();
  load_excluded_phrases();

  document.getElementById("text_area").focus();
};
