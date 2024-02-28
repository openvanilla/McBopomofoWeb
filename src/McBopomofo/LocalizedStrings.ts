/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

export class LocalizedStrings {
  lookUp(selectedString: string, name: string): string {
    if (this.languageCode === "zh-TW") {
      return `在「${name}」查找「${selectedString}」`;
    }
    return `Look up "${selectedString}" in ${name}`;
  }
  languageCode: string = "";

  cursorIsBetweenSyllables(prevReading: string, nextReading: string): string {
    if (this.languageCode === "zh-TW") {
      return "游標正在 " + prevReading + " 與 " + nextReading + " 之間";
    }
    return (
      "Cursor is between syllables " + prevReading + " and " + nextReading + "."
    );
  }

  syllablesRequired(count: number) {
    if (this.languageCode === "zh-TW") {
      return "最少需要 " + count + " 字元";
    }
    return count + " syllables required.";
  }

  syllableMaximum(count: number) {
    if (this.languageCode === "zh-TW") {
      return "最多只能 " + count + " 字元";
    }
    return count + " syllables maximum";
  }

  phraseAlreadyExists() {
    if (this.languageCode === "zh-TW") {
      return "詞彙已存在";
    }
    return "phrase already exists";
  }

  pressEnterToAddThePhrase() {
    if (this.languageCode === "zh-TW") {
      return "按下 Enter 加入詞彙";
    }

    return "press Enter to add the phrase";
  }

  markedWithSyllablesAndStatus(
    marked: string,
    readingUiText: string,
    status: string
  ) {
    if (this.languageCode === "zh-TW") {
      return "已選取： " + marked + "， 注音: " + readingUiText + "，" + status;
    }

    return (
      "Marked: " + marked + ", syllables: " + readingUiText + ", " + status
    );
  }
}
