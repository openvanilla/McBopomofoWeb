window.onload = () => {
  const syntaxHighlightManager = (() => {
    const fields = new Map();

    function syncScroll(textarea, backdrop) {
      backdrop.scrollTop = textarea.scrollTop;
      backdrop.scrollLeft = textarea.scrollLeft;
    }

    function render(id) {
      const field = fields.get(id);
      const renderer = window.phraseSyntaxHighlighter;
      if (!field || !renderer) {
        return;
      }

      field.content.innerHTML = renderer.renderHtml(field.textarea.value) + "\n";
      syncScroll(field.textarea, field.backdrop);
    }

    function attach(id) {
      const renderer = window.phraseSyntaxHighlighter;
      const textarea = document.getElementById(id);
      if (!renderer || !textarea || fields.has(id)) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "syntax-highlight-field";
      textarea.parentNode.insertBefore(wrapper, textarea);
      wrapper.appendChild(textarea);

      const backdrop = document.createElement("div");
      backdrop.className = "syntax-highlight-backdrop";
      const content = document.createElement("pre");
      content.className = "syntax-highlight-content";
      backdrop.appendChild(content);
      wrapper.appendChild(backdrop);

      const computedStyle = window.getComputedStyle(textarea);
      backdrop.style.font = computedStyle.font;
      backdrop.style.letterSpacing = computedStyle.letterSpacing;
      content.style.font = computedStyle.font;
      content.style.lineHeight = computedStyle.lineHeight;
      content.style.letterSpacing = computedStyle.letterSpacing;

      textarea.classList.add("syntax-highlight-input");
      textarea.addEventListener("input", () => render(id));
      textarea.addEventListener("scroll", () => syncScroll(textarea, backdrop));

      fields.set(id, { textarea, backdrop, content });
      render(id);
    }

    return {
      init() {
        attach("text_area");
        attach("text_area_excluded_phrases");
      },
      refresh(id) {
        render(id);
      },
    };
  })();

  // On ChromeOS, we store the user phrases in JSON format, but
  // the editor convert the JSON to phrases per line.
  function mapToText(map) {
    let text = "";
    for (const k in map) {
      const list = map[k];
      for (const v of list) {
        text += v + " " + k + "\n";
      }
    }
    return text;
  }

  function textToMap(text) {
    const lines = text.split("\n");
    const map = {};
    for (const line of lines) {
      const kv = line.split(" ");
      if (kv.length != 2) {
        continue;
      }
      const k = kv[1];
      const v = kv[0];
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
      const jsonString = value.user_phrase;

      if (jsonString !== undefined) {
        try {
          const obj = JSON.parse(jsonString);
          if (obj) {
            const s = mapToText(obj);
            document.getElementById("text_area").value = s;
            syntaxHighlightManager.refresh("text_area");
          }
        } catch (e) {
          console.log("failed to parse user_phrase:" + e);
        }
      }
    });
  }

  function load_excluded_phrases() {
    chrome.storage.largeSync.get(["excluded_phrase"], (value) => {
      const jsonString = value.excluded_phrase;

      if (jsonString !== undefined) {
        try {
          const obj = JSON.parse(jsonString);
          if (obj) {
            const s = mapToText(obj);
            document.getElementById("text_area_excluded_phrases").value = s;
            syntaxHighlightManager.refresh("text_area_excluded_phrases");
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
    const text = document.getElementById("text_area").value;
    const map = textToMap(text);
    const jsonString = JSON.stringify(map);
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
    const text = document.getElementById("text_area_excluded_phrases").value;
    const map = textToMap(text);
    const jsonString = JSON.stringify(map);
    chrome.storage.largeSync.set({ excluded_phrase: jsonString });

    chrome.runtime.sendMessage(
      { command: "reload_excluded_phrase" },
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

  document.getElementById("user_phrases_link").innerText =
    chrome.i18n.getMessage("user_phrases_link");
  document.getElementById("excluded_phrases_link").innerText =
    chrome.i18n.getMessage("excluded_phrases_link");

  syntaxHighlightManager.init();
  load_user_phrases();
  load_excluded_phrases();

  document.getElementById("text_area").focus();
};
