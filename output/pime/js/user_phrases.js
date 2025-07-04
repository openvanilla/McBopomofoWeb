window.onload = () => {
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
