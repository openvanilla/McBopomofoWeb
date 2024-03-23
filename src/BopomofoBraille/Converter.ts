import { read } from "fs";
import { BopomofoBrailleSyllable } from "./BopomofoBraille";
import { Digit, DigitRelated } from "./Digits";
import { FullWidthPunctuation } from "./FullWidthPunctuation";
import { HalfWidthPunctuation } from "./HalfWidthPunctuation";
import { Letter } from "./Letter";

enum ConverterState {
  initial = 0,
  bpmf = 1,
  digits = 2,
  letters = 3,
}

export class BopomofoBrailleConverter {
  static convertBpmfToBraille(bopomofo: string): string {
    let state: ConverterState = ConverterState.initial;
    let output = "";
    let readHead = 0;
    let length = bopomofo.length;

    while (readHead < length) {
      if (bopomofo.charAt(readHead) === " ") {
        if (output.charAt(output.length - 1) != " ") {
          output += " ";
        }
        readHead += 1;
        state = ConverterState.initial;
        continue;
      }

      if (state === ConverterState.digits) {
        let substring = bopomofo.charAt(readHead);
        if (Digit.allDigits.includes(substring)) {
          output += Digit.toBraille(Digit.fromDigit(substring) as Digit);
          readHead += 1;
          continue;
        }
        {
          let target = Math.min(2, length - readHead);
          let found = false;
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = bopomofo.substring(start, end);
            let punctuation = DigitRelated.fromPunctuation(substring);
            if (punctuation != undefined) {
              output += DigitRelated.toBraille(punctuation);
              readHead = end;
              found = true;
              break;
            }
          }
          if (found) {
            continue;
          }
        }
        state = ConverterState.initial;
        output += " ";
      } else if (state === ConverterState.letters) {
        let substring = bopomofo.charAt(readHead);
        let lowered = substring.toLowerCase();
        if (lowered >= "a" && lowered <= "z") {
          if (substring >= "A" && substring <= "Z") {
            output += "⠠";
          }
          output += Letter.toBraille(Letter.fromLetter(lowered) as Letter);
          readHead += 1;
          continue;
        } else if (HalfWidthPunctuation.allPunctuation.includes(substring)) {
          output += HalfWidthPunctuation.toBraille(
            HalfWidthPunctuation.fromPunctuation(
              substring
            ) as HalfWidthPunctuation
          );
          readHead += 1;
          continue;
        } else {
          state = ConverterState.initial;
          output += " ";
        }
      }
      {
        let target = Math.min(4, length - readHead);
        let found = false;
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = bopomofo.substring(start, end);
          try {
            let b = BopomofoBrailleSyllable.fromBpmf(substring);
            output += b.braille;
            readHead = end;
            state = ConverterState.bpmf;
            found = true;
            break;
          } catch (e) {}
        }
        if (found) {
          continue;
        }
      }

      {
        let substring = bopomofo.charAt(readHead);
        let punctuation = FullWidthPunctuation.fromBpmf(substring);
        if (punctuation != undefined) {
          output += FullWidthPunctuation.toBraille(punctuation);
          readHead += 1;
          state = ConverterState.bpmf;
          continue;
        }
      }

      let substring = bopomofo.charAt(readHead);

      if (substring >= "0" && substring <= "9") {
        if (state === ConverterState.bpmf) {
          output += " ";
        }
        output += "⠼";
        output += Digit.toBraille(Digit.fromDigit(substring) as Digit);
        readHead += 1;
        state = ConverterState.digits;
        continue;
      }

      let lowered = substring.toLowerCase();
      if (lowered >= "a" && lowered <= "z") {
        if (state === ConverterState.bpmf) {
          output += " ";
        }
        if (substring >= "A" && substring <= "Z") {
          output += "⠠";
        }
        output += Letter.toBraille(Letter.fromLetter(lowered) as Letter);
        readHead += 1;
        state = ConverterState.letters;
        continue;
      }
      if (HalfWidthPunctuation.allPunctuation.includes(substring)) {
        if (state === ConverterState.bpmf) {
          output += " ";
        }
        output += HalfWidthPunctuation.toBraille(
          HalfWidthPunctuation.fromPunctuation(
            substring
          ) as HalfWidthPunctuation
        );
        readHead += 1;
        state = ConverterState.letters;
        continue;
      }

      if (readHead === length) {
        break;
      }

      if (state === ConverterState.bpmf) {
        output += " ";
      }
      state = ConverterState.initial;
      output += substring;
      readHead += 1;
    }
    return output;
  }

  static convertBrailleToBpmf(braille: string): string {
    let state: ConverterState = ConverterState.initial;
    let output = "";
    let readHead = 0;
    let length = braille.length;
    while (readHead < length) {
      if (braille.charAt(readHead) === " ") {
        if (output.charAt(output.length - 1) != " ") {
          output += " ";
        }
        readHead += 1;
        state = ConverterState.initial;
        continue;
      }

      if (state === ConverterState.digits) {
        let substring = braille.charAt(readHead);
        let digit = Digit.fromBraille(substring);
        if (digit != undefined) {
          output += digit;
          readHead += 1;
          continue;
        }

        {
          let target = Math.min(7, length - readHead);
          let found = false;
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = braille.substring(start, end);
            let punctuation = DigitRelated.fromBraille(substring);
            if (punctuation != undefined) {
              output += DigitRelated.toPunctuation(punctuation);
              readHead = end;
              found = true;
              break;
            }
          }
          if (found) {
            continue;
          }
        }

        state = ConverterState.initial;
      }
      if (state === ConverterState.letters) {
        let substring = braille.charAt(readHead);
        let isUppercase = false;
        if (substring === "⠠") {
          readHead += 1;
          isUppercase = true;
          substring = braille.charAt(readHead);
        }
        let letter = Letter.fromBraille(substring);
        if (letter != undefined) {
          if (isUppercase) {
            output += letter.toUpperCase();
          } else {
            output += letter;
          }
          readHead += 1;
          continue;
        } else {
          let found = false;
          let target = Math.min(3, length - readHead);
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = braille.substring(start, end);
            let punctuation = HalfWidthPunctuation.fromBraille(substring);
            if (punctuation != undefined) {
              output += HalfWidthPunctuation.toBpmf(punctuation);
              readHead = end;
              found = true;
              break;
            }
          }
          if (found) {
            continue;
          }
          state = ConverterState.initial;
        }
      }

      {
        let target = Math.min(3, length - readHead);
        let found = false;
        if (target > 0) {
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = braille.substring(start, end);
            if (substring[substring.length - 1] === " ") {
              continue;
            }
            try {
              let b = BopomofoBrailleSyllable.fromBraille(substring);
              if (b != undefined) {
                output += b.bpmf;
                readHead = end;
                state = ConverterState.bpmf;
                found = true;
                break;
              }
            } catch (e) {
              // pass
            }
          }
        }
        if (found) {
          continue;
        }
      }
      {
        let target = Math.min(4, length - readHead);
        let found = false;
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          if (substring[substring.length - 1] === " ") {
            continue;
          }

          let punctuation = FullWidthPunctuation.fromBraille(substring);
          if (punctuation != undefined) {
            output += FullWidthPunctuation.toBpmf(punctuation);
            readHead = end;
            state = ConverterState.bpmf;
            found = true;
            break;
          }
        }
        if (found) {
          continue;
        }
      }
      let substring = braille.charAt(readHead);
      if (substring === "⠼") {
        let digit = Digit.fromBraille(braille.charAt(readHead + 1));
        if (digit != undefined) {
          output += digit;
          readHead += 2;
          state = ConverterState.digits;
          continue;
        }
      }
      if (substring === "⠠" && readHead + 1 < length) {
        let letter = Letter.fromBraille(braille.charAt(readHead + 1));
        if (letter != undefined) {
          output += letter.toUpperCase();
          readHead += 2;
          state = ConverterState.letters;
          continue;
        }
      }
      let letter = Letter.fromBraille(braille.charAt(readHead));
      if (letter != undefined) {
        output += letter;
        readHead += 1;
        state = ConverterState.letters;
        continue;
      }

      {
        let found = false;
        let target = Math.min(3, length - readHead);
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          let punctuation = HalfWidthPunctuation.fromBraille(substring);
          if (punctuation != undefined) {
            output += HalfWidthPunctuation.toBpmf(punctuation);
            readHead = end;
            state = ConverterState.letters;
            found = true;
            break;
          }
        }
        if (found) {
          continue;
        }
      }

      if (readHead === length) {
        break;
      }

      substring = braille.substring(readHead, readHead + 1);
      output += substring;
      readHead += 1;
    }

    return output;
  }

  static convertBrailleToTokens(
    braille: string
  ): (BopomofoBrailleSyllable | string)[] {
    let state: ConverterState = ConverterState.initial;
    var output: any[] = [];
    let text = "";
    let readHead = 0;
    let length = braille.length;
    while (readHead < length) {
      if (braille.charAt(readHead) === " ") {
        if (text.charAt(output.length - 1) != " ") {
          text += " ";
        }
        readHead += 1;
        state = ConverterState.initial;
        continue;
      }

      if (state === ConverterState.digits) {
        let substring = braille.charAt(readHead);
        let digit = Digit.fromBraille(substring);
        if (digit != undefined) {
          text += digit;
          readHead += 1;
          continue;
        }

        {
          let target = Math.min(7, length - readHead);
          let found = false;
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = braille.substring(start, end);
            let punctuation = DigitRelated.fromBraille(substring);
            if (punctuation != undefined) {
              text += DigitRelated.toPunctuation(punctuation);
              readHead = end;
              found = true;
              break;
            }
          }
          if (found) {
            continue;
          }
        }

        state = ConverterState.initial;
      }
      if (state === ConverterState.letters) {
        let substring = braille.charAt(readHead);
        let isUppercase = false;
        if (substring === "⠠") {
          readHead += 1;
          isUppercase = true;
          substring = braille.charAt(readHead);
        }
        let letter = Letter.fromBraille(substring);
        if (letter != undefined) {
          if (isUppercase) {
            text += letter.toUpperCase();
          } else {
            text += letter;
          }
          readHead += 1;
          continue;
        } else {
          let found = false;
          let target = Math.min(3, length - readHead);
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = braille.substring(start, end);
            let punctuation = HalfWidthPunctuation.fromBraille(substring);
            if (punctuation != undefined) {
              text += HalfWidthPunctuation.toBpmf(punctuation);
              readHead = end;
              state = ConverterState.bpmf;
              found = true;
              break;
            }
          }
          if (found) {
            continue;
          }
          state = ConverterState.initial;
        }
      }

      {
        let target = Math.min(3, length - readHead);
        let found = false;
        if (target > 0) {
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = braille.substring(start, end);
            if (substring[substring.length - 1] === " ") {
              continue;
            }

            try {
              let b = BopomofoBrailleSyllable.fromBraille(substring);
              if (b != undefined) {
                if (text.length > 0) {
                  output.push(text);
                  text = "";
                }
                output.push(b);
                readHead = end;
                state = ConverterState.bpmf;
                found = true;
                break;
              }
            } catch (e) {
              // pass
            }
          }
        }
        if (found) {
          continue;
        }
      }
      {
        let found = false;
        let target = Math.min(4, length - readHead);
        for (let i = target; i >= 0; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          if (substring[substring.length - 1] === " ") {
            continue;
          }

          let punctuation = FullWidthPunctuation.fromBraille(substring);
          if (punctuation != undefined) {
            text += FullWidthPunctuation.toBpmf(punctuation);
            readHead = end;
            state = ConverterState.bpmf;
            found = true;
            break;
          }
        }
        if (found) {
          continue;
        }
      }

      let substring = braille.charAt(readHead);
      if (substring === "⠼") {
        let digit = Digit.fromBraille(braille.charAt(readHead + 1));
        if (digit != undefined) {
          text += digit;
          readHead += 2;
          state = ConverterState.digits;
          continue;
        }
      }
      if (substring === "⠠" && readHead + 1 < length) {
        let letter = Letter.fromBraille(braille.charAt(readHead + 1));
        if (letter != undefined) {
          text += letter.toUpperCase();
          readHead += 2;
          state = ConverterState.letters;
          continue;
        }
      }
      let letter = Letter.fromBraille(braille.charAt(readHead));
      if (letter != undefined) {
        text += letter;
        readHead += 1;
        state = ConverterState.letters;
        continue;
      }

      {
        let found = false;
        let target = Math.min(3, length - readHead);
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          let punctuation = HalfWidthPunctuation.fromBraille(substring);
          if (punctuation != undefined) {
            text += HalfWidthPunctuation.toBpmf(punctuation);
            readHead = end;
            state = ConverterState.letters;
            found = true;
            break;
          }
        }
        if (found) {
          continue;
        }
      }

      if (readHead === length) {
        break;
      }

      substring = braille.substring(readHead, readHead + 1);
      text += substring;
      readHead += 1;
    }

    if (text.length > 0) {
      output.push(text);
      text = "";
    }

    return output;
  }
}
