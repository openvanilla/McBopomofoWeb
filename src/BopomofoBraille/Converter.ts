/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoSyllable } from "./Tokens/BopomofoSyllable";
import { Digit, DigitRelated } from "./Tokens/Digits";
import { FullWidthPunctuation } from "./Tokens/FullWidthPunctuation";
import { HalfWidthPunctuation } from "./Tokens/HalfWidthPunctuation";
import { Letter } from "./Tokens/Letter";

/**
 * The state of the converter.
 * - initial: The initial state
 * - bpmf: The converter is converting Bopomofo syllables to Braille, and vice
 *   versa.
 * - digits: The converter is converting digits to Braille, and vice versa.
 * - letters: The converter is converting letters to Braille, and vice versa.
 * @internal
 */
const enum ConverterState {
  initial = 0,
  bpmf = 1,
  digits = 2,
  letters = 3,
}

class StringCursor {
  private text: string;
  private index: number = 0;

  constructor(text: string) {
    this.text = text;
  }

  get isAtEnd(): boolean {
    return this.index >= this.text.length;
  }

  get current(): string {
    return this.text.charAt(this.index);
  }

  peek(offset: number = 0): string {
    return this.text.charAt(this.index + offset);
  }

  substring(length: number): string {
    return this.text.substring(this.index, this.index + length);
  }

  advance(n: number = 1): void {
    this.index += n;
  }

  get remaining(): number {
    return this.text.length - this.index;
  }
}

/**
 * Helps to convert Bopomofo syllables to Braille and vice versa.
 */
export class BopomofoBrailleConverter {
  /**
   * Converts Bopomofo syllables to Braille.
   * @param bopomofo Bopomofo syllables in Unicode.
   * @returns Converted Braille in Unicode.
   *
   * @example
   * ``` ts
   * BopomofoBrailleConverter.convertBpmfToBraille("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ");
   * ```
   * It should return converted Taiwanese Braille in Unicode.
   */
  public static convertBpmfToBraille(bopomofo: string): string {
    let state: ConverterState = ConverterState.initial;
    let output = "";
    const cursor = new StringCursor(bopomofo);

    while (!cursor.isAtEnd) {
      /// Prevent duplicate spaces
      if (cursor.current === " ") {
        if (output.charAt(output.length - 1) !== " ") {
          output += " ";
        }
        cursor.advance();
        state = ConverterState.initial;
        continue;
      }

      /// If the state is `digits`, try to convert digits to Braille. If it fails, reset the state.œ
      if (state === ConverterState.digits) {
        const result = this.bpmf2br_HandleDigitsState(cursor);
        if (result) {
          output += result;
          continue;
        }
        state = ConverterState.initial;
        output += " ";
      }

      /// If the state is `letters`, try to convert letters to Braille. If it fails, reset the state.
      if (state === ConverterState.letters) {
        const result = this.bpmf2br_HandleLettersState(cursor);
        if (result) {
          output += result;
          continue;
        }
        state = ConverterState.initial;
        output += " ";
      }

      /// Try to convert Bopomofo syllables to Braille. If it fails, reset the state.
      const bpmfResult = this.bpmf2br_ProcessBopomofo(cursor);
      if (bpmfResult) {
        output += bpmfResult;
        state = ConverterState.bpmf;
        continue;
      }

      /// Try to convert FullWidthPunctuation to Braille. If it fails, reset the state.
      const fwPunctResult = this.bpmf2br_ProcessFullWidthPunctuation(cursor);
      if (fwPunctResult) {
        output += fwPunctResult;
        state = ConverterState.bpmf;
        continue;
      }

      /// Try to convert Digits to Braille. If it fails, reset the state.
      const digitResult = this.bpmf2br_ProcessDigits(cursor);
      if (digitResult) {
        if (state !== ConverterState.initial) {
          output += " ";
        }
        output += digitResult;
        state = ConverterState.digits;
        continue;
      }

      /// Try to convert Letters to Braille. If it fails, reset the state.
      const letterResult = this.bpmf2br_ProcessLetters(cursor);
      if (letterResult) {
        if (state !== ConverterState.initial) {
          output += " ";
        }
        output += letterResult;
        state = ConverterState.letters;
        continue;
      }

      /// Try to convert HalfWidthPunctuation to Braille. If it fails, reset the state.
      const hwPunctResult = this.bpmf2br_ProcessHalfWidthPunctuation(cursor);
      if (hwPunctResult) {
        if (state === ConverterState.initial) {
          output += " ";
        }
        output += hwPunctResult;
        state = ConverterState.letters;
        continue;
      }

      if (cursor.isAtEnd) {
        break;
      }

      /// If the state is not `initial`, add a space.
      if (state !== ConverterState.initial) {
        output += " ";
      }
      state = ConverterState.initial;
      output += cursor.current;
      cursor.advance();
    }
    return output;
  }

  private static bpmf2br_HandleDigitsState(
    cursor: StringCursor
  ): string | null {
    const substring = cursor.current;
    if (Digit.allDigits.includes(substring)) {
      cursor.advance();
      return Digit.toBraille(Digit.fromDigit(substring) as Digit);
    }
    const target = Math.min(2, cursor.remaining);
    for (let i = target; i >= 1; i--) {
      const substring = cursor.substring(i);
      const punctuation = DigitRelated.fromPunctuation(substring);
      if (punctuation !== undefined) {
        cursor.advance(i);
        return DigitRelated.toBraille(punctuation);
      }
    }
    return null;
  }

  private static bpmf2br_HandleLettersState(
    cursor: StringCursor
  ): string | null {
    const substring = cursor.current;
    const lowered = substring.toLowerCase();
    if (lowered >= "a" && lowered <= "z") {
      let output = "";
      if (substring >= "A" && substring <= "Z") {
        output += "⠠";
      }
      output += Letter.toBraille(Letter.fromLetter(lowered) as Letter);
      cursor.advance();
      return output;
    }
    if (HalfWidthPunctuation.allPunctuation.includes(substring)) {
      cursor.advance();
      return HalfWidthPunctuation.toBraille(
        HalfWidthPunctuation.fromPunctuation(substring) as HalfWidthPunctuation
      );
    }
    return null;
  }

  private static bpmf2br_ProcessBopomofo(cursor: StringCursor): string | null {
    const target = Math.min(4, cursor.remaining);
    for (let i = target; i >= 1; i--) {
      const substring = cursor.substring(i);
      try {
        const b = BopomofoSyllable.fromBpmf(substring);
        cursor.advance(i);
        return b.braille;
      } catch (e) {}
    }
    return null;
  }

  private static bpmf2br_ProcessFullWidthPunctuation(
    cursor: StringCursor
  ): string | null {
    const substring = cursor.current;
    const punctuation = FullWidthPunctuation.fromBpmf(substring);
    if (punctuation !== undefined) {
      cursor.advance();
      return FullWidthPunctuation.toBraille(punctuation);
    }
    return null;
  }

  private static bpmf2br_ProcessDigits(cursor: StringCursor): string | null {
    const substring = cursor.current;
    if (substring >= "0" && substring <= "9") {
      cursor.advance();
      return "⠼" + Digit.toBraille(Digit.fromDigit(substring) as Digit);
    }
    return null;
  }

  private static bpmf2br_ProcessLetters(cursor: StringCursor): string | null {
    const substring = cursor.current;
    const lowered = substring.toLowerCase();
    if (lowered >= "a" && lowered <= "z") {
      let output = "";
      if (substring >= "A" && substring <= "Z") {
        output += "⠠";
      }
      output += Letter.toBraille(Letter.fromLetter(lowered) as Letter);
      cursor.advance();
      return output;
    }
    return null;
  }

  private static bpmf2br_ProcessHalfWidthPunctuation(
    cursor: StringCursor
  ): string | null {
    const substring = cursor.current;
    if (HalfWidthPunctuation.allPunctuation.includes(substring)) {
      cursor.advance();
      return HalfWidthPunctuation.toBraille(
        HalfWidthPunctuation.fromPunctuation(substring) as HalfWidthPunctuation
      );
    }
    return null;
  }

  /**
   * Converts a Braille string to tokens. The tokens could be BopomofoSyllable
   * objects or strings
   *
   * The method is part of the the feature to convert Braille to Chinese
   * characters. After extracting the tokens, an application can then use a
   * smart Bopomofo input method to convert the BopomofoSyllable objects to
   * Chinese characters, then append the plain strings.
   *
   * @param braille Braille in Unicode.
   * @returns Tokens. A token could be a BopomofoSyllable object or a string.
   *
   * @privateRemarks
   * The converter tokenizes the input string by trying to find three kinds of
   * tokens, Bopomofo syllables, digits, and letters. However, it converts
   * digits and letters into strings since the users of the method only need to
   * know about the range of the Bopomofo syllables, so they can convert the
   * Bopomofo syllables into Chinese characters using McBopomofo's input method
   * module.
   *
   * What the converters does are including.
   * - Set the state of the converter to initial.
   * - Tries to find if there is a valid Bopomofo syllable in the begin of the
   *   input string.
   * - If failed, tries to find a full-width punctuation. Please note that some
   *   punctuation should not be in the beginning of sentences, such as comma,
   *   so such punctuations will be ignored.
   * - If failed, tries to find a digit. A digit starts with "⠼". If a digit is
   *   found , we let the convert enter digits state and keep finding digits.
   * - If failed, tries to find a letter. If a letter is found, we let the
   *   converter enter letters state and keep finding letters.
   * - If there is a space, reset the state of the converter to initial, and
   *   continue to parse incoming characters.
   * @example
   * ``` ts
   * BopomofoBrailleConverter.convertBrailleToTokens("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄");
   * ```
   */
  static convertBrailleToTokens(
    braille: string
  ): (BopomofoSyllable | string)[] {
    let state: ConverterState = ConverterState.initial;
    var output: any[] = [];
    let nonBpmfText = "";
    const cursor = new StringCursor(braille);

    while (!cursor.isAtEnd) {
      if (cursor.current === " ") {
        if (nonBpmfText.length === 0) {
          nonBpmfText += " ";
        } else if (nonBpmfText.charAt(nonBpmfText.length - 1) !== " ") {
          nonBpmfText += " ";
        }
        cursor.advance();
        state = ConverterState.initial;
        continue;
      }

      /// If the state is `digits`, try to convert digits to Bopomofo. If it fails, reset the state.
      if (state === ConverterState.digits) {
        const result = this.br2t_HandleDigitsState(cursor);
        if (result) {
          nonBpmfText += result;
          continue;
        }
        state = ConverterState.initial;
      }

      /// If the state is `letters`, try to convert letters to Bopomofo. If it fails, reset the state.
      if (state === ConverterState.letters) {
        const result = this.br2t_HandleLettersState(cursor);
        if (result) {
          nonBpmfText += result;
          continue;
        }
        state = ConverterState.initial;
      }

      /// Try to convert Braille to Bopomofo. If it fails, reset the state.
      const bpmfResult = this.br2t_ProcessBopomofo(cursor);
      if (bpmfResult) {
        if (nonBpmfText.length > 0) {
          output.push(nonBpmfText);
          nonBpmfText = "";
        }
        output.push(bpmfResult);
        state = ConverterState.bpmf;
        continue;
      }

      /// Try to convert FullWidthPunctuation to Bopomofo. If it fails, reset the state.
      const fwPunctResult = this.br2t_ProcessFullWidthPunctuation(
        cursor,
        state
      );
      if (fwPunctResult) {
        nonBpmfText += fwPunctResult;
        state = ConverterState.bpmf;
        continue;
      }

      const digitResult = this.br2t_ProcessDigits(cursor);
      if (digitResult) {
        nonBpmfText += digitResult;
        state = ConverterState.digits;
        continue;
      }

      const letterResult = this.br2t_ProcessLetters(cursor);
      if (letterResult) {
        nonBpmfText += letterResult;
        state = ConverterState.letters;
        continue;
      }

      const hwPunctResult = this.br2t_ProcessHalfWidthPunctuation(cursor);
      if (hwPunctResult) {
        nonBpmfText += hwPunctResult;
        state = ConverterState.letters;
        continue;
      }

      if (cursor.isAtEnd) {
        break;
      }

      nonBpmfText += cursor.current;
      cursor.advance();
    }

    if (nonBpmfText.length > 0) {
      output.push(nonBpmfText);
      nonBpmfText = "";
    }

    return output;
  }

  private static br2t_HandleDigitsState(cursor: StringCursor): string | null {
    const substring = cursor.current;
    const digit = Digit.fromBraille(substring);
    if (digit !== undefined) {
      cursor.advance();
      return digit;
    }

    const target = Math.min(7, cursor.remaining);
    for (let i = target; i >= 1; i--) {
      const substring = cursor.substring(i);
      const punctuation = DigitRelated.fromBraille(substring);
      if (punctuation !== undefined) {
        cursor.advance(i);
        return DigitRelated.toPunctuation(punctuation);
      }
    }
    return null;
  }

  private static br2t_HandleLettersState(cursor: StringCursor): string | null {
    let substring = cursor.current;
    let isUppercase = false;
    let consumed = 1;
    if (substring === "⠠") {
      isUppercase = true;
      substring = cursor.peek(1);
      consumed = 2;
    }
    const letter = Letter.fromBraille(substring);
    if (letter !== undefined) {
      cursor.advance(consumed);
      return isUppercase ? letter.toUpperCase() : letter;
    }

    const target = Math.min(3, cursor.remaining);
    for (let i = target; i >= 1; i--) {
      const substring = cursor.substring(i);
      const punctuation = HalfWidthPunctuation.fromBraille(substring);
      if (punctuation !== undefined) {
        cursor.advance(i);
        return HalfWidthPunctuation.toBpmf(punctuation);
      }
    }
    return null;
  }

  private static br2t_ProcessBopomofo(
    cursor: StringCursor
  ): BopomofoSyllable | null {
    const target = Math.min(3, cursor.remaining);
    if (target > 0) {
      for (let i = target; i >= 1; i--) {
        const substring = cursor.substring(i);
        if (substring[substring.length - 1] === " ") {
          continue;
        }

        try {
          const b = BopomofoSyllable.fromBraille(substring);
          if (b !== undefined) {
            cursor.advance(i);
            return b;
          }
        } catch (e) {}
      }
    }
    return null;
  }

  private static br2t_ProcessFullWidthPunctuation(
    cursor: StringCursor,
    state: ConverterState
  ): string | null {
    const target = Math.min(4, cursor.remaining);
    for (let i = target; i >= 0; i--) {
      const substring = cursor.substring(i);
      if (substring[substring.length - 1] === " ") {
        continue;
      }

      const punctuation = FullWidthPunctuation.fromBraille(substring);
      if (punctuation !== undefined) {
        if (state === ConverterState.initial) {
          if (!FullWidthPunctuation.supposedToBeAtStart(punctuation)) {
            continue;
          }
        }
        cursor.advance(i);
        return FullWidthPunctuation.toBpmf(punctuation);
      }
    }
    return null;
  }

  private static br2t_ProcessDigits(cursor: StringCursor): string | null {
    const substring = cursor.current;
    if (substring === "⠼") {
      const digit = Digit.fromBraille(cursor.peek(1));
      if (digit !== undefined) {
        cursor.advance(2);
        return digit;
      }
    }
    return null;
  }

  private static br2t_ProcessLetters(cursor: StringCursor): string | null {
    const substring = cursor.current;
    if (substring === "⠠" && cursor.remaining > 1) {
      const letter = Letter.fromBraille(cursor.peek(1));
      if (letter !== undefined) {
        cursor.advance(2);
        return letter.toUpperCase();
      }
    }

    const letter = Letter.fromBraille(cursor.current);
    if (letter !== undefined) {
      cursor.advance();
      return letter;
    }
    return null;
  }

  private static br2t_ProcessHalfWidthPunctuation(
    cursor: StringCursor
  ): string | null {
    const target = Math.min(3, cursor.remaining);
    for (let i = target; i >= 1; i--) {
      const substring = cursor.substring(i);
      const punctuation = HalfWidthPunctuation.fromBraille(substring);
      if (punctuation !== undefined) {
        cursor.advance(i);
        return HalfWidthPunctuation.toBpmf(punctuation);
      }
    }
    return null;
  }

  /**
   * Converts Braille to Bopomofo syllables.
   *
   * The method calls `convertBrailleToTokens` to convert the input string to
   * tokens, and then connects the tokens to form a string.
   *
   * @param braille Braille in Unicode.
   * @returns Converted Bopomofo syllables in Unicode.
   *
   * @example
   * ``` ts
   * BopomofoBrailleConverter.convertBrailleToBpmf("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄");
   * ```
   */
  static convertBrailleToBpmf(braille: string): string {
    const tokens = this.convertBrailleToTokens(braille);
    let output = "";
    for (const token of tokens) {
      if (token instanceof BopomofoSyllable) {
        output += token.bpmf;
      } else {
        output += token;
      }
    }
    return output;
  }
}
