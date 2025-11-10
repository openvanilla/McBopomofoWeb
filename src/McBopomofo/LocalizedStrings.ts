/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

export class LocalizedStrings {
  characterInfo(): string {
    if (this.languageCode === "zh-TW") {
      return `字元資訊`;
    }
    return `Character Information`;
  }
  /* istanbul ignore next */
  lookUp(selectedString: string, name: string): string {
    if (this.languageCode === "zh-TW") {
      return `在「${name}」查找「${selectedString}」`;
    }
    return `Look up "${selectedString}" in ${name}`;
  }
  languageCode: string = "";

  /* istanbul ignore next */
  cursorIsBetweenSyllables(prevReading: string, nextReading: string): string {
    if (this.languageCode === "zh-TW") {
      return "游標正在 " + prevReading + " 與 " + nextReading + " 之間";
    }
    return (
      "Cursor is between syllables " + prevReading + " and " + nextReading + "."
    );
  }

  /* istanbul ignore next */
  syllablesRequired(count: number) {
    if (this.languageCode === "zh-TW") {
      return "最少需要 " + count + " 字元";
    }
    return count + " syllables required.";
  }

  /* istanbul ignore next */
  syllableMaximum(count: number) {
    if (this.languageCode === "zh-TW") {
      return "最多只能 " + count + " 字元";
    }
    return count + " syllables maximum";
  }

  /* istanbul ignore next */
  phraseAlreadyExists() {
    if (this.languageCode === "zh-TW") {
      return "詞彙已存在";
    }
    return "phrase already exists";
  }

  /* istanbul ignore next */
  pressEnterToAddThePhrase() {
    if (this.languageCode === "zh-TW") {
      return "按下 Enter 加入詞彙";
    }

    return "press Enter to add the phrase";
  }

  /* istanbul ignore next */
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

  boostTitle(phrase: string) {
    if (this.languageCode === "zh-TW") {
      return "您想要增加「" + phrase + "」這個詞彙的權重嗎？";
    }
    return 'Do you wan to boost the phrase "' + phrase + '"?';
  }

  excludeTitle(phrase: string) {
    if (this.languageCode === "zh-TW") {
      return "您想要排除「" + phrase + "」這個詞彙嗎？？";
    }
    return 'Do you wan to exclude the phrase "' + phrase + '"?';
  }

  boost() {
    if (this.languageCode === "zh-TW") {
      return "增加權重";
    }
    return "Boost";
  }

  exclude() {
    if (this.languageCode === "zh-TW") {
      return "排除";
    }
    return "Exclude";
  }

  cancel() {
    if (this.languageCode === "zh-TW") {
      return "取消";
    }
    return "Cancel";
  }
}
