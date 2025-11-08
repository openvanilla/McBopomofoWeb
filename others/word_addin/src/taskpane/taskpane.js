/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office, Word */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("text_to_braille").onclick = textToBraille;
    document.getElementById("braille_to_text").onclick = brailleToText;
  }
});

export async function textToBraille() {
  return Word.run(async (context) => {
    if (service == undefined) {
      return;
    }

    const selection = context.document.getSelection();
    context.load(selection, "text");
    await context.sync();
    const lines = selection.text.split("\n");
    selection.clear();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const converted = service.convertTextToBraille(line);
      selection.insertText(converted);
      if (i < lines.length - 1) {
        selection.insertBreak(Word.BreakType.line);
      }
    }
  });
}

export async function brailleToText() {
  return Word.run(async (context) => {
    if (service == undefined) {
      return;
    }

    const selection = context.document.getSelection();
    context.load(selection, "text");
    await context.sync();
    const lines = selection.text.split("\n");
    selection.clear();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const converted = service.convertBrailleToText(line);
      selection.insertText(converted);
      if (i < lines.length - 1) {
        selection.insertBreak(Word.BreakType.line);
      }
    }
  });
}
