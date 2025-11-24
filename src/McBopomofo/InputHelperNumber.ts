import { Case, ChineseNumbers, SuzhouNumbers } from "../ChineseNumbers";
import { Candidate, LanguageModel } from "../Gramambular2";
import { RomanNumbers, RomanNumbersStyle } from "../RomanNumbers";

export class NumberInputHelper {
  static fillCandidates(number: string, lm: LanguageModel): Candidate[] {
    const candidateStrings = this.fillCandidateStrings(number, lm);
    return candidateStrings.map((s) => new Candidate(number, s, s));
  }

  static fillCandidateStrings(number: string, lm: LanguageModel): string[] {
    if (number.length === 0) {
      return [];
    }
    let result: string[] = [];

    let intPart = "";
    let decPart = "";
    const components = number.split(".");
    if (components.length >= 1) {
      intPart = components[0];
    }
    if (components.length >= 2) {
      decPart = components[1];
    }
    let chineseNumberLowerCases = ChineseNumbers.generate(
      intPart,
      decPart,
      Case.lowercase
    );
    result.push(chineseNumberLowerCases);
    let chineseNumberUpperCases = ChineseNumbers.generate(
      intPart,
      decPart,
      Case.uppercase
    );
    result.push(chineseNumberUpperCases);

    let intNumber = parseInt(intPart, 10);
    if (intNumber > 0 && intNumber <= 3999 && decPart.length === 0) {
      let romanNumberAlphabets = RomanNumbers.convert(
        intNumber,
        RomanNumbersStyle.Alphabets
      );
      result.push(romanNumberAlphabets);
      let romanNumberFullWidthUpper = RomanNumbers.convert(
        intNumber,
        RomanNumbersStyle.FullWidthUpper
      );
      result.push(romanNumberFullWidthUpper);
      let romanNumberFullWidthLower = RomanNumbers.convert(
        intNumber,
        RomanNumbersStyle.FullWidthLower
      );
      result.push(romanNumberFullWidthLower);
    }

    const key = "_number_" + number;
    if (lm.hasUnigrams(key)) {
      const unigrams = lm.getUnigrams(key);
      for (const unigram of unigrams) {
        if (result.indexOf(unigram.value) === -1) {
          result.push(unigram.value);
        }
      }
    }

    let suzhouNumber = SuzhouNumbers.generate(intPart, decPart, "[單位]", true);
    result.push(suzhouNumber);
    return result;
  }
}
