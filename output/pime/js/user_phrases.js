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
        attach("user_phrases");
        attach("excluded_phrases");
      },
      refresh(id) {
        render(id);
      },
    };
  })();

  function saveUserPhrases(string) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      try {
        const response = this.responseText;
        console.log("User phrases saved: " + response);
      } catch {
        console.error("Failed to parse response after saving user phrases");
      }
    };
    xhttp.onerror = function () {
      console.error("Failed to save user phrases");
    };
    xhttp.open("POST", "/user_phrases");
    xhttp.send(string);
    return false;
  }

  function getUserPhrases() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      try {
        const userPhrases = this.responseText;
        console.log("User phrases loaded: " + userPhrases);
        document.getElementById("user_phrases").value = userPhrases;
        syntaxHighlightManager.refresh("user_phrases");
      } catch {
        console.error("Failed to parse user phrases");
      }
    };
    xhttp.onerror = function () {
      console.error("Failed to load user phrases");
    };
    xhttp.open("GET", "/user_phrases");
    xhttp.send("");
    return false;
  }

  function openUserPhrases() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/open_user_phrases");
    xhttp.send("");
    return false;
  }

  function saveExcludedPhrases(string) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      try {
        const response = this.responseText;
        console.log("User phrases saved: " + response);
      } catch {
        console.error("Failed to parse response after saving user phrases");
      }
    };
    xhttp.onerror = function () {
      console.error("Failed to save user phrases");
    };
    xhttp.open("POST", "/excluded_phrases");
    xhttp.send(string);
    return false;
  }

  function getExcludedPhrases() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
      try {
        const userPhrases = this.responseText;
        console.log("User phrases loaded: " + userPhrases);
        document.getElementById("excluded_phrases").value = userPhrases;
        syntaxHighlightManager.refresh("excluded_phrases");
      } catch {
        console.error("Failed to parse user phrases");
      }
    };
    xhttp.onerror = function () {
      console.error("Failed to load user phrases");
    };
    xhttp.open("GET", "/excluded_phrases");
    xhttp.send("");
    return false;
  }

  function openExcludedPhrases() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/open_excluded_phrases");
    xhttp.send("");
    return false;
  }

  (function () {
    syntaxHighlightManager.init();
    getUserPhrases();
    getExcludedPhrases();
  })();

  document.getElementById("save").onclick = function () {
    const userPhrases = document.getElementById("user_phrases").value;
    saveUserPhrases(userPhrases);
    console.log("User phrases saved");
  };

  document.getElementById("reload").onclick = function () {
    getUserPhrases();
    console.log("User phrases reloaded");
  };

  document.getElementById("open").onclick = function () {
    openUserPhrases();
    console.log("User phrases opened");
  };

  document.getElementById("save_excluded_phrases").onclick = function () {
    const userPhrases = document.getElementById("excluded_phrases").value;
    saveExcludedPhrases(userPhrases);
    console.log("User phrases saved");
  };

  document.getElementById("reload_excluded_phrases").onclick = function () {
    getExcludedPhrases();
    console.log("User phrases reloaded");
  };

  document.getElementById("open_excluded_phrases").onclick = function () {
    openExcludedPhrases();
    console.log("User phrases opened");
  };

  document.getElementById("user_phrases_link").onclick = function () {
    const up = document.getElementById("user_phrases_container");
    up.style.display = "block";
    const ep = document.getElementById("excluded_phrases_container");
    ep.style.display = "none";
    const upl = document.getElementById("user_phrases_link");
    upl.classList.add("active");
    const epl = document.getElementById("excluded_phrases_link");
    epl.classList.remove("active");
    return false;
  };

  document.getElementById("excluded_phrases_link").onclick = function () {
    const up = document.getElementById("user_phrases_container");
    up.style.display = "none";
    const ep = document.getElementById("excluded_phrases_container");
    ep.style.display = "block";
    const upl = document.getElementById("user_phrases_link");
    upl.classList.remove("active");
    const epl = document.getElementById("excluded_phrases_link");
    epl.classList.add("active");
    return false;
  };
};
