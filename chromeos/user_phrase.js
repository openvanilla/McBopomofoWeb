window.onload = () => {
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

  function load() {
    chrome.storage.sync.get(["user_phrase"], (value) => {
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

  document.getElementById("reload").onclick = () => {
    load();
    document.getElementById("text_area").focus();
  };

  document.getElementById("save").onclick = () => {
    let text = document.getElementById("text_area").value;
    let map = textToMap(text);
    let jsonString = JSON.stringify(map);
    chrome.storage.sync.set({ user_phrase: jsonString });
    console.log("write user_phrase done");

    chrome.runtime.sendMessage(
      { command: "reload_user_phrase" },
      function (response) {
        document.getElementById("text_area").focus();
      }
    );
  };

  load();
  document.getElementById("text_area").focus();
};
