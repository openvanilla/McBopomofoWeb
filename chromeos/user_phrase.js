function syncStore(key, objectToStore) {
  var jsonstr = JSON.stringify(objectToStore);
  var i = 0;
  var storageObj = {};

  // split jsonstr into chunks and store them in an object indexed by `key_i`
  while (jsonstr.length > 0) {
    var index = key + "_" + i++;

    // since the key uses up some per-item quota, see how much is left for the value
    // also trim off 2 for quotes added by storage-time `stringify`
    const maxLength =
      chrome.storage.sync.QUOTA_BYTES_PER_ITEM - index.length - 2;
    var valueLength = jsonstr.length;
    if (valueLength > maxLength) {
      valueLength = maxLength;
    }

    // trim down segment so it will be small enough even when run through `JSON.stringify` again at storage time
    //max try is QUOTA_BYTES_PER_ITEM to avoid infinite loop
    var segment = jsonstr.substr(0, valueLength);
    for (let i = 0; i < chrome.storage.sync.QUOTA_BYTES_PER_ITEM; i++) {
      const jsonLength = JSON.stringify(segment).length;
      if (jsonLength > maxLength) {
        segment = jsonstr.substr(0, --valueLength);
      } else {
        break;
      }
    }

    storageObj[index] = segment;
    jsonstr = jsonstr.substr(valueLength);
  }
}

function syncGet(key, callback) {
  chrome.storage.sync.get(key, (data) => {
    console.log(data[key]);
    console.log(typeof data[key]);
    if (
      data != undefined &&
      data != "undefined" &&
      data != {} &&
      data[key] != undefined &&
      data[key] != "undefined"
    ) {
      const keyArr = new Array();
      for (let i = 0; i <= data[key].count; i++) {
        keyArr.push(`${data[key].prefix}${i}`);
      }
      chrome.storage.sync.get(keyArr, (items) => {
        console.log(data);
        const keys = Object.keys(items);
        const length = keys.length;
        let results = "";
        if (length > 0) {
          const sepPos = keys[0].lastIndexOf("_");
          const prefix = keys[0].substring(0, sepPos);
          for (let x = 0; x < length; x++) {
            results += items[`${prefix}_${x}`];
          }
          callback(JSON.parse(results));
          return;
        }
        callback(undefined);
      });
    } else {
      callback(undefined);
    }
  });
}

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
    syncGet("user_phrase", (obj) => {
      if (obj) {
        let s = mapToText(obj);
        document.getElementById("text_area").value = s;
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
    syncStore("user_phrase", map);
    console.log("write user_phrase done");

    chrome.runtime.sendMessage(
      { command: "reload_user_phrase" },
      function (response) {
        document.getElementById("text_area").focus();
      }
    );
  };

  window.document.title = chrome.i18n.getMessage("userPhrasesPageTitle");
  document.getElementById("user_phrases_title").innerText =
    chrome.i18n.getMessage("userPhrasesPageTitle");

  document.getElementById("reload").innerText =
    chrome.i18n.getMessage("btnReload");

  document.getElementById("save").innerText = chrome.i18n.getMessage("btnSave");

  load();
  document.getElementById("text_area").focus();
};
