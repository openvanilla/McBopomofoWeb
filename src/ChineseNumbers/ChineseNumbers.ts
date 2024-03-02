import {
  TrimZerosAtStart,
  TrimZerosAtEnd as TrimZerosAtEnd,
} from "./StringUtils";

export enum Case {
  lowercase,
  uppercase,
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String(typeof padString !== "undefined" ? padString : " ");
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

function digits(numberCase: Case) {
  switch (numberCase) {
    case Case.lowercase:
      return new Map<string, string>([
        ["0", "〇"],
        ["1", "一"],
        ["2", "二"],
        ["3", "三"],
        ["4", "四"],
        ["5", "五"],
        ["6", "六"],
        ["7", "七"],
        ["8", "八"],
        ["9", "九"],
      ]);
    case Case.uppercase:
      return new Map<string, string>([
        ["0", "零"],
        ["1", "壹"],
        ["2", "貳"],
        ["3", "參"],
        ["4", "肆"],
        ["5", "伍"],
        ["6", "陸"],
        ["7", "柒"],
        ["8", "捌"],
        ["9", "玖"],
      ]);
    default:
      throw new Error("Invalid case");
  }
}

function places(numberCase: Case) {
  switch (numberCase) {
    case Case.lowercase:
      return ["千", "百", "十", ""];
    case Case.uppercase:
      return ["仟", "佰", "拾", ""];
    default:
      throw new Error("Invalid case");
  }
}

let higherPlaces = ["", "萬", "億", "兆", "京", "垓", "秭", "穰"];

export class ChineseNumbers {
  private static convert4Digits(
    subString: string,
    numberCase: Case,
    zeroEverHappened: boolean = false
  ): string {
    let zeroHappened = zeroEverHappened;
    let output = "";
    let currentDigits = digits(numberCase);
    for (let i = 0; i < 4; i++) {
      let c: string = subString[i];
      switch (c) {
        case " ":
          continue;
        case "0":
          zeroHappened = true;
          continue;
        default:
          if (zeroHappened) {
            output += currentDigits.get("0");
          }
          zeroHappened = false;
          output += currentDigits.get(c);
          output += places(numberCase)[i];
      }
    }
    return output;
  }

  static generate(intPart: string, decPart: string, numberCase: Case): string {
    let intTrimmed = TrimZerosAtStart(intPart);
    let decTrimmed = TrimZerosAtEnd(decPart);
    let output = "";
    let currentDigits = digits(numberCase);

    if (intPart.length === 0) {
      output += currentDigits.get("0");
    } else {
      let intSectionCount = Math.ceil(intTrimmed.length / 4);
      let filledLength = intSectionCount * 4;
      let filled = intTrimmed.padStart(filledLength, " ");
      let readHead = 0;
      let zeroEverHappened = false;
      while (readHead < filledLength) {
        let subString = filled.slice(readHead, readHead + 4);
        if (subString === "0000") {
          zeroEverHappened = true;
          readHead += 4;
          continue;
        }
        let subOutput = this.convert4Digits(
          subString,
          numberCase,
          zeroEverHappened
        );
        zeroEverHappened = false;
        output += subOutput;
        let place = (filledLength - readHead) / 4 - 1;
        output += higherPlaces[place];
        readHead += 4;
      }
    }

    if (decTrimmed.length > 0) {
      output += "點";
      for (let i = 0; i < decTrimmed.length; i++) {
        output += currentDigits.get(decTrimmed[i]);
      }
    }
    if (output.length === 0) {
      return currentDigits.get("0") as string;
    }
    return output;
  }
}
