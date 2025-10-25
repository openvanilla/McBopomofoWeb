/**
 * Error thrown when a Roman numeral conversion receives unsupported input.
 */
export class RomanNumbersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RomanNumbersError";
  }
}

/**
 * Output variants for Roman numeral conversion.
 */
export enum RomanNumbersStyle {
  Alphabets = "alphabets",
  FullWidthUpper = "fullWidthUpper",
  FullWidthLower = "fullWidthLower",
}

interface DigitsMap {
  digits: string[];
  tens: string[];
  hundreds: string[];
  thousands: string[];
}

function getDigitsMap(style: RomanNumbersStyle): DigitsMap {
  switch (style) {
    case RomanNumbersStyle.Alphabets:
      return {
        digits: ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        tens: ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],
        hundreds: ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"],
        thousands: ["", "M", "MM", "MMM"],
      };
    case RomanNumbersStyle.FullWidthUpper:
      return {
        digits: ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ"],
        tens: ["", "Ⅹ", "ⅩⅩ", "ⅩⅩⅩ", "ⅩⅬ", "Ⅼ", "ⅬⅩ", "ⅬⅩⅩ", "ⅬⅩⅩⅩ", "ⅩⅭ"],
        hundreds: ["", "Ⅽ", "ⅭⅭ", "ⅭⅭⅭ", "ⅭⅮ", "Ⅾ", "ⅮⅭ", "ⅮⅭⅭ", "ⅮⅭⅭⅭ", "ⅭⅯ"],
        thousands: ["", "Ⅿ", "ⅯⅯ", "ⅯⅯⅯ"],
      };
    case RomanNumbersStyle.FullWidthLower:
      return {
        digits: ["", "ⅰ", "ⅱ", "ⅲ", "ⅳ", "ⅴ", "ⅵ", "ⅶ", "ⅷ", "ⅸ"],
        tens: ["", "ⅹ", "ⅹⅹ", "ⅹⅹⅹ", "ⅹⅼ", "ⅼ", "ⅼⅹ", "ⅼⅹⅹ", "ⅼⅹⅹⅹ", "ⅹⅽ"],
        hundreds: ["", "ⅽ", "ⅽⅽ", "ⅽⅽⅽ", "ⅽⅾ", "ⅾ", "ⅾⅽ", "ⅾⅽⅽ", "ⅾⅽⅽⅽ", "ⅽⅿ"],
        thousands: ["", "ⅿ", "ⅿⅿ", "ⅿⅿⅿ"],
      };
  }
}

/**
 * Utilities for converting numbers into Unicode Roman numerals.
 */
export class RomanNumbers {
  /**
   * Convert a numeric value to a Roman numeral string.
   *
   * @param input Value between 0 and 3999 (inclusive) to convert.
   * @param style Output styling to apply; defaults to ASCII letters.
   * @returns The Roman numeral representation of `input` in the desired style.
   * @throws RomanNumbersError If the value is outside the supported range.
   */
  static convert(
    input: number,
    style: RomanNumbersStyle = RomanNumbersStyle.Alphabets
  ): string {
    if (input > 3999) {
      throw new RomanNumbersError("Cannot be larger than 3999");
    }
    if (input < 0) {
      throw new RomanNumbersError("Cannot be less than 0");
    }

    if (style === RomanNumbersStyle.FullWidthUpper) {
      switch (input) {
        case 11:
          return "Ⅺ";
        case 12:
          return "Ⅻ";
      }
    }

    if (style === RomanNumbersStyle.FullWidthLower) {
      switch (input) {
        case 11:
          return "ⅺ";
        case 12:
          return "ⅻ";
      }
    }

    const thou = Math.floor(input / 1000);
    const hund = Math.floor((input % 1000) / 100);
    const ten = Math.floor((input % 100) / 10);
    const digit = input % 10;

    const map = getDigitsMap(style);

    const result =
      map.thousands[thou] +
      map.hundreds[hund] +
      map.tens[ten] +
      map.digits[digit];
    return result;
  }

  /**
   * Parse a string and convert it to a Roman numeral string.
   *
   * @param input String containing a base-10 integer representation.
   * @param style Output styling to apply; defaults to ASCII letters.
   * @returns The Roman numeral representation of the parsed number.
   * @throws RomanNumbersError If parsing fails or the value is unsupported.
   */
  static convertString(
    input: string,
    style: RomanNumbersStyle = RomanNumbersStyle.Alphabets
  ): string {
    const number = parseInt(input, 10);
    if (isNaN(number)) {
      throw new RomanNumbersError("Input is not a valid integer");
    }
    return this.convert(number, style);
  }
}
