window.onload = function () {
  const { InputController } = window.mcbopomofo;
  let ui = (function () {
    let that = {};
    that.uiInfo = "";
    that.text = "";

    that.reset = function () {
      console.log("ui reset called");
      that.uiInfo = "";
      that.text = "";
    };
    that.commitString = function (string) {
      console.log("ui commitString called");
      this.text = string;
    };
    that.update = function (string) {
      console.log("ui update called");
      that.uiInfo = string;
    };
    return that;
  })();

  let controller = new InputController(ui);

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.command === "load_config") {
      chrome.storage.sync.get("settings", (value) => {});
      sendResponse({});
    } else if (request.command === "reset") {
      ui.reset();
      controller.reset();
      let uiState = JSON.stringify(ui);
      // console.log("reset");
      let msg = { msg: "reset called", ui: uiState };
      // console.log(msg);
      sendResponse(msg);
    } else if (request.command === "send_key_event") {
      ui.reset();
      let key = JSON.parse(request.key);
      let accepted = controller.keyEvent(key);
      let uiState = JSON.stringify(ui);
      let msg = { accepted: accepted, key: request.key, ui: uiState };
      console.log(msg);
      sendResponse(msg);
    } else {
      sendResponse({});
    }
  });
};
