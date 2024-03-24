chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  function replaceSelectedText(replacementText) {
    var sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      let activeElement = document.activeElement;
      if (
        activeElement.nodeName == "TEXTAREA" ||
        (activeElement.nodeName == "INPUT" &&
          activeElement.type.toLowerCase() == "text")
      ) {
        let val = activeElement.value,
          start = activeElement.selectionStart,
          end = activeElement.selectionEnd;
        activeElement.value =
          val.slice(0, start) + replacementText + val.slice(end);
      } else {
        if (sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(replacementText));
        } else {
          sel.deleteFromDocument();
        }
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      range.text = replacementText;
    }
  }

  let text = request.text;
  replaceSelectedText(text);
});
