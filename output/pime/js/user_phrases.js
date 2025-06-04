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

  (function () {
    getUserPhrases();
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
};
