export enum Punctuation {
  period = "。",
  dot = "·",
  comma = "，",
  semicolon = "；",
  ideographicComma = "、",
  questionMark = "？",
  exclamationMark = "！",
  colon = "：",
  personNameMark = "╴",
  slash = "—",
  bookNameMark = "﹏",
  ellipsis = "…",
  referenceMark = "※",
  doubleRing = "◎",
  singleQuotationMarkLeft = "「",
  singleQuotationMarkRight = "」",
  doubleQuotationMarkLeft = "『",
  doubleQuotationMarkRight = "』",
  parenthesesLeft = "（",
  parenthesesRight = "）",
  bracketLeft = "〔",
  bracketRight = "〕",
  braceLeft = "｛",
  braceRight = "｝",
}

export namespace Punctuation {
  const map = new Map<Punctuation, string>([
    [Punctuation.period, "⠤"],
    [Punctuation.dot, "⠤"],
    [Punctuation.comma, "⠆"],
    [Punctuation.semicolon, "⠰"],
    [Punctuation.ideographicComma, "⠠"],
    [Punctuation.questionMark, "⠕"],
    [Punctuation.exclamationMark, "⠇"],
    [Punctuation.colon, "⠒⠒"],
    [Punctuation.personNameMark, "⠰⠰"],
    [Punctuation.slash, "⠐⠂"],
    [Punctuation.bookNameMark, "⠠⠤"],
    [Punctuation.ellipsis, "⠐⠐⠐"],
    [Punctuation.referenceMark, "⠼"],
    [Punctuation.doubleRing, "⠪⠕"],
    [Punctuation.singleQuotationMarkLeft, "⠰⠤"],
    [Punctuation.singleQuotationMarkRight, "⠤⠆"],
    [Punctuation.doubleQuotationMarkLeft, "⠰⠤⠰⠤"],
    [Punctuation.doubleQuotationMarkRight, "⠤⠆⠤⠆"],
    [Punctuation.parenthesesLeft, "⠪"],
    [Punctuation.parenthesesRight, "⠕"],
    [Punctuation.bracketLeft, "⠯"],
    [Punctuation.bracketRight, "⠽"],
    [Punctuation.braceLeft, "⠦"],
    [Punctuation.braceRight, "⠴"],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values());

  export function fromBpmf(b: string): Punctuation | undefined {
    if (map.has(b as Punctuation)) {
      return b as Punctuation;
    }
    return undefined;
  }
  export function fromBraille(b: string): Punctuation | undefined {
    for (let [key, value] of map) {
      if (value === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: Punctuation): string {
    return c;
  }
  export function toBraille(c: Punctuation): string {
    return map.get(c) as string;
  }
}
