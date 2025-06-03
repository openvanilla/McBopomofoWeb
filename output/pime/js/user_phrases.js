function saveUserPhrases(string) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/user_phrases");
  xhttp.send(string);
}

function getUserPhrases() {
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/user_phrases");
  xhttp.onload = function () {
    try {
      const userPhrases = this.responseText;
      document.getElementById("user_phrases").value = userPhrases;
    } catch {
      console.error("Failed to parse user phrases");
    }
  };
}

function openUserPhrases() {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/open_user_phrases");
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
