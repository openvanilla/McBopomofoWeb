import mcbopomofoweb from "./bundls.js";
const { InputController } = mcbopomofoweb;

let controller = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  if (request.command === "set_ui") {
    controller = new InputController(request.ui);
    sendResponse({ msg: "set_ui called" });
  } else if (request.command === "set_ui") {
    if (controller == null) {
      sendResponse({ msg: "NO controller" });
      return;
    }
    controller.reset();
    sendResponse({ msg: "reset called" });
  } else if (request.command === "send_key_event") {
    if (controller == null) {
      sendResponse({ msg: "NO controller" });
      return;
    }
    let accepted = controller.keyEvent(request.key);
    sendResponse({ accepted: accepted, key: "key is:" + request.key });
  } else {
    sendResponse({});
  }
});
