//Note: we added context menu items to convert text in the background worker,
//and then the background worker sends the converted text to the content script.
//The content script then replaces the selected text with the converted text.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  function replaceSelectedText(replacementText, isHtml) {
    let sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      const activeElement = document.activeElement;
      if (
        activeElement.nodeName === "TEXTAREA" ||
        (activeElement.nodeName === "INPUT" &&
          activeElement.type.toLowerCase() === "text")
      ) {
        const val = activeElement.value;
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        activeElement.value =
          val.slice(0, start) + replacementText + val.slice(end);
      } else {
        if (sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          if (isHtml) {
            const div = document.createElement("div");
            div.innerHTML = replacementText;
            range.insertNode(div);
          } else {
            const lines = replacementText.split("\n").reverse();
            if (lines.length > 1) {
              for (const line of lines) {
                const p = document.createElement("p");
                p.innerText = line;
                range.insertNode(p);
              }
            } else {
              range.insertNode(document.createTextNode(replacementText));
            }
          }
        } else {
          sel.deleteFromDocument();
        }
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      range.text = replacementText;
    }
  }

  const text = request.text;
  const isHtml = request.isHtml;
  replaceSelectedText(text, isHtml);
});
