import { BopomofoBrailleSyllable } from "./BopomofoBraille";
import { Digit } from "./Digits";
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
      // console.log("state" + state);
      if (state === ConverterState.digits) {
        let substring = bopomofo.charAt(readHead);
        if (substring >= "0" && substring <= "9") {
          output += Digit.toBraille(Digit.fromDigit(substring) as Digit);
          readHead += 1;
          continue;
        } else {
          state = ConverterState.initial;
          output += " ";
        }
      } else if (state === ConverterState.letters) {
        let substring = bopomofo.charAt(readHead);
        let lowered = substring.toLowerCase();
        if (lowered >= "a" && lowered <= "z") {
          if (substring >= "A" && substring <= "Z") {
            output += "⠠";
          }
          output += Letter.toBraille(Letter.fromLetter(substring) as Letter);
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
          // console.log("end of letters");
          output += " ";
        }
      }
      {
        let target = Math.min(4, length - readHead);
        let found = false;
        // console.log(
        //   "readHead " + readHead + " " + length + "//" + (length - readHead)
        // );
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = bopomofo.substring(start, end);
          // console.log("substring : " + substring);
          try {
            let b = BopomofoBrailleSyllable.fromBpmf(substring);
            output += b.braille;
            readHead = end;
            state = ConverterState.bpmf;
            found = true;
            // console.log("break?");
            break;
          } catch (e) {
            // pass
          }
        }
        if (found) {
          // console.log(
          //   "read head is now " +
          //     readHead +
          //     " " +
          //     length +
          //     "//" +
          //     (length - readHead)
          // );
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
          // console.log("start of digits");
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
          // console.log("start of letters");
          output += " ";
        }
        if (substring >= "A" && substring <= "Z") {
          output += "⠠";
        }
        output += Letter.toBraille(Letter.fromLetter(substring) as Letter);
        readHead += 1;
        state = ConverterState.letters;
        continue;
      }
      if (HalfWidthPunctuation.allPunctuation.includes(substring)) {
        if (state === ConverterState.bpmf) {
          // console.log("start of letters");
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
        // console.log("readHead " + readHead + " " + length);
        // console.log("substring " + substring);
        // console.log("state === ConverterState.bpmf");
        output += " ";
      }
      state = ConverterState.initial;
      output += substring;
      readHead += 1;
    }
    return output;
  }

  static convertBrailleToBpmf(braille: string): string {
    let output = "";
    let readHead = 0;
    let length = braille.length;
    while (readHead < length) {
      let target = Math.min(3, length - readHead);
      let found = false;
      if (target > 0) {
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          try {
            let b = BopomofoBrailleSyllable.fromBraille(substring);
            if (b != undefined) {
              output += b.bpmf;
              readHead = end;
              found = true;
              break;
            }
          } catch (e) {
            // pass
          }
        }
      }
      if (!found) {
        target = Math.min(4, length - readHead);
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          let punctuation = FullWidthPunctuation.fromBraille(substring);
          if (punctuation != undefined) {
            output += FullWidthPunctuation.toBpmf(punctuation);
            readHead = end;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        let substring = braille.substring(readHead, readHead + 1);
        output += substring;
        readHead += 1;
      }
    }

    return output;
  }

  static convertBrailleToTokens(
    braille: string
  ): (BopomofoBrailleSyllable | string)[] {
    var output: any[] = [];
    let text = "";
    let readHead = 0;
    let length = braille.length;
    while (readHead < length) {
      let target = Math.min(3, length - readHead);
      let found = false;
      if (target > 0) {
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          try {
            let b = BopomofoBrailleSyllable.fromBraille(substring);
            if (b != undefined) {
              if (text.length > 0) {
                output.push(text);
                text = "";
              }
              output.push(b);
              readHead = end;
              found = true;
              break;
            }
          } catch (e) {
            // pass
          }
        }
      }
      if (!found) {
        target = Math.min(4, length - readHead);
        for (let i = target; i >= 0; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          let punctuation = FullWidthPunctuation.fromBraille(substring);
          if (punctuation != undefined) {
            text += FullWidthPunctuation.toBpmf(punctuation);
            readHead = end;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        let substring = braille.substring(readHead, readHead + 1);
        text += substring;
        readHead += 1;
      }
    }

    if (text.length > 0) {
      output.push(text);
      text = "";
    }

    return output;
  }
}
