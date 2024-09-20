/** Represents the half-width punctuations. */
export enum HalfWidthPunctuation {
  period = ".",
  comma = ",",
  semicolon = ";",
  dash = "'",
  questionMark = "?",
  exclamationMark = "!",
  colon = ":",
  slash = "-",
  star = "*",
  dotDotDot = "...",
  singleQuotationMarkLeft = "‘",
  singleQuotationMarkRight = "’",
  doubleQuotationMarkLeft = "“",
  doubleQuotationMarkRight = "”",
  parenthesesLeft = "(",
  parenthesesRight = ")",
  bracketLeft = "[",
  bracketRight = "]",
}

export namespace HalfWidthPunctuation {
  const map = new Map<HalfWidthPunctuation, string>([
    [HalfWidthPunctuation.period, "⠲"],
    [HalfWidthPunctuation.comma, "⠂"],
    [HalfWidthPunctuation.semicolon, "⠒"],
    [HalfWidthPunctuation.dash, "⠄"],
    [HalfWidthPunctuation.questionMark, "⠦"],
    [HalfWidthPunctuation.exclamationMark, "⠖"],
    [HalfWidthPunctuation.colon, "⠒"],
    [HalfWidthPunctuation.slash, "⠤"],
    [HalfWidthPunctuation.star, "⠔⠔"],
    [HalfWidthPunctuation.dotDotDot, "⠄⠄⠄"],
    [HalfWidthPunctuation.singleQuotationMarkLeft, "⠠⠦"],
    [HalfWidthPunctuation.singleQuotationMarkRight, "⠴⠄"],
    [HalfWidthPunctuation.doubleQuotationMarkLeft, "⠦"],
    [HalfWidthPunctuation.doubleQuotationMarkRight, "⠴"],
    [HalfWidthPunctuation.parenthesesLeft, "⠶"],
    [HalfWidthPunctuation.parenthesesRight, "⠶"],
    [HalfWidthPunctuation.bracketLeft, "⠠⠶"],
    [HalfWidthPunctuation.bracketRight, "⠶⠄"],
  ]);

  export const allPunctuation: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values());

  export function fromPunctuation(b: string): HalfWidthPunctuation | undefined {
    if (map.has(b as HalfWidthPunctuation)) {
      return b as HalfWidthPunctuation;
    }
    return undefined;
  }
  export function fromBraille(b: string): HalfWidthPunctuation | undefined {
    for (let [key, value] of map) {
      if (value === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: HalfWidthPunctuation): string {
    return c;
  }
  export function toBraille(c: HalfWidthPunctuation): string {
    return map.get(c) as string;
  }
}
