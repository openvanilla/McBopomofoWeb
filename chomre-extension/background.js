window.onload = function () {
  const { InputController } = window.mcbopomofo;
  let ui = (function () {
    let that = {};
    that.uiInfo = "";
    that.text = "";

    that.reset = function () {
      console.log("ui reset called");
      that.uiInfo = "";
      that.text = "reset called";
    };
    that.commitString = function (string) {
      console.log("ui commitString called");
      this.text = string;
      that.text = "commitString called";
    };
    that.update = function (string) {
      console.log("ui update called");
      that.uiInfo = string;
      that.text = "update called";
    };
    return that;
  })();

  let controller = new InputController(ui);

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.command === "reset") {
      controller.reset();
      let uiState = JSON.stringify(ui);
      console.log("reset");
      let msg = { msg: "reset called", ui: uiState };
      console.log(msg);
      sendResponse(msg);
    } else if (request.command === "send_key_event") {
      console.log("send_key_event");
      let key = JSON.parse(request.key);
      console.log("key");
      console.log(key);
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
