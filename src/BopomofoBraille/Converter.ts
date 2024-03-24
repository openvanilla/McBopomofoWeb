import { BopomofoSyllable } from "./Tokens/BopomofoSyllable";
import { Digit, DigitRelated } from "./Tokens/Digits";
import { FullWidthPunctuation } from "./Tokens/FullWidthPunctuation";
import { HalfWidthPunctuation } from "./Tokens/HalfWidthPunctuation";
import { Letter } from "./Tokens/Letter";

enum ConverterState {
  initial = 0,
  bpmf = 1,
  digits = 2,
  letters = 3,
}

/**
 * Helps to convert Bopomofo syllables to Braille and vice versa.
 */
export class BopomofoBrailleConverter {
  /**
   * Converts Bopomofo syllables to Braille.
   * @param bopomofo Bopomofo syllables in Unicode.
   * @returns Converted Braille in Unicode.
   */
  public static convertBpmfToBraille(bopomofo: string): string {
    let state: ConverterState = ConverterState.initial;
    let output = "";
    let readHead = 0;
    const length = bopomofo.length;

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
            let b = BopomofoSyllable.fromBpmf(substring);
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

  /**
   * Converts Braille to tokens. The tokens could be  BopomofoSyllable objects
   * or strings
   * @param braille Braille in Unicode.
   * @returns Tokens.
   */
  static convertBrailleToTokens(
    braille: string
  ): (BopomofoSyllable | string)[] {
    let state: ConverterState = ConverterState.initial;
    var output: any[] = [];
    let nonBpmfText = "";
    let readHead = 0;
    const length = braille.length;

    while (readHead < length) {
      if (braille.charAt(readHead) === " ") {
        if (nonBpmfText.charAt(output.length - 1) != " ") {
          nonBpmfText += " ";
        }
        readHead += 1;
        state = ConverterState.initial;
        continue;
      }

      if (state === ConverterState.digits) {
        let substring = braille.charAt(readHead);
        let digit = Digit.fromBraille(substring);
        if (digit != undefined) {
          nonBpmfText += digit;
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
              nonBpmfText += DigitRelated.toPunctuation(punctuation);
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
          // Uppercase
          readHead += 1;
          isUppercase = true;
          substring = braille.charAt(readHead);
        }
        let letter = Letter.fromBraille(substring);
        if (letter != undefined) {
          if (isUppercase) {
            nonBpmfText += letter.toUpperCase();
          } else {
            nonBpmfText += letter;
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
              nonBpmfText += HalfWidthPunctuation.toBpmf(punctuation);
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

      // Tried to find a Bopomofo syllable
      {
        let target = Math.min(3, length - readHead);
        let found = false;
        if (target > 0) {
          for (let i = target; i >= 1; i--) {
            let start = readHead;
            let end = readHead + i;
            let substring = braille.substring(start, end);
            if (substring[substring.length - 1] === " ") {
              // For example, "⠋⠺ " is valid since it could be see as "ㄊㄞ ",
              // but we want to keep the space in the output.
              continue;
            }

            try {
              let b = BopomofoSyllable.fromBraille(substring);
              if (b != undefined) {
                if (nonBpmfText.length > 0) {
                  output.push(nonBpmfText);
                  nonBpmfText = "";
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

      // Tried to find a full-width punctuation
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
            if (state === ConverterState.initial) {
              if (!FullWidthPunctuation.supposedToBeAtStart(punctuation)) {
                continue;
              }
            }

            nonBpmfText += FullWidthPunctuation.toBpmf(punctuation);
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
          nonBpmfText += digit;
          readHead += 2;
          state = ConverterState.digits;
          continue;
        }
      }

      if (substring === "⠠" && readHead + 1 < length) {
        let letter = Letter.fromBraille(braille.charAt(readHead + 1));
        if (letter != undefined) {
          nonBpmfText += letter.toUpperCase();
          readHead += 2;
          state = ConverterState.letters;
          continue;
        }
      }

      let letter = Letter.fromBraille(braille.charAt(readHead));
      if (letter != undefined) {
        nonBpmfText += letter;
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
            nonBpmfText += HalfWidthPunctuation.toBpmf(punctuation);
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
      nonBpmfText += substring;
      readHead += 1;
    }

    if (nonBpmfText.length > 0) {
      output.push(nonBpmfText);
      nonBpmfText = "";
    }

    return output;
  }

  /**
   * Converts Braille to Bopomofo syllables.
   * @param braille Braille in Unicode.
   * @returns Converted Bopomofo syllables in Unicode.
   */
  static convertBrailleToBpmf(braille: string): string {
    let tokens = this.convertBrailleToTokens(braille);
    let output = "";
    for (let token of tokens) {
      if (token instanceof BopomofoSyllable) {
        output += token.bpmf;
      } else {
        output += token;
      }
    }
    return output;
  }
}
