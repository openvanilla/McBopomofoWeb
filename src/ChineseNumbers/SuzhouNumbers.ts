import { TrimZerosAtEnd, TrimZerosAtStart } from "./StringUtils";

export class SuzhouNumbers {
  private static verticalDigits = new Map<string, string>([
    ["0", "〇"],
    ["1", "〡"],
    ["2", "〢"],
    ["3", "〣"],
    ["4", "〤"],
    ["5", "〥"],
    ["6", "〦"],
    ["7", "〧"],
    ["8", "〨"],
    ["9", "〩"],
  ]);
  private static horizontalDigits = new Map<string, string>([
    ["1", "一"],
    ["2", "二"],
    ["3", "三"],
  ]);
  private static placeNames: string[] = [
    "",
    "十",
    "百",
    "千",
    "万",
    "十万",
    "百万",
    "千万",
    "億",
    "十億",
    "百億",
    "千億",
    "兆",
    "十兆",
    "百兆",
    "千兆",
    "京",
    "十京",
    "百京",
    "千京",
    "垓",
    "十垓",
    "百垓",
    "千垓",
    "秭",
    "十秭",
    "百秭",
    "千秭",
    "穰",
    "十穰",
    "百穰",
    "千穰",
  ];

  public static generate(
    intPart: string,
    decPart: string,
    unit: string = "",
    preferInitialVertical: boolean = true
  ) {
    let intTrimmed = TrimZerosAtStart(intPart);
    let decTrimmed = TrimZerosAtEnd(decPart);

    let output = "";
    let trimmedZeroCounts = 0;

    if (decTrimmed.length === 0) {
      let trimmed = TrimZerosAtEnd(intTrimmed);
      trimmedZeroCounts = intTrimmed.length - trimmed.length;
      intTrimmed = trimmed;
    }
    if (intTrimmed.length === 0) {
      intTrimmed = "0";
    }

    let joined = intTrimmed + decTrimmed;
    var isVertical = preferInitialVertical;
    for (const c of joined) {
      if (c === "1" || c === "2" || c === "3") {
        output += isVertical
          ? SuzhouNumbers.verticalDigits.get(c)
          : SuzhouNumbers.horizontalDigits.get(c);
        isVertical = !isVertical;
      } else {
        output += SuzhouNumbers.verticalDigits.get(c);
        isVertical = preferInitialVertical;
      }
    }

    if (joined.length === 1 && trimmedZeroCounts === 0) {
      return output + unit;
    }
    if (output.length === 1 && trimmedZeroCounts === 1) {
      const c = intTrimmed[0];
      switch (c) {
        case "1":
          return "〸" + unit;
        case "2":
          return "〹" + unit;
        case "3":
          return "〺" + unit;
        default:
          break;
      }
    }
    const place = intTrimmed.length + trimmedZeroCounts - 1;
    return (
      output +
      (output.length > 1 ? "\n" : "") +
      SuzhouNumbers.placeNames[place] +
      unit
    );
  }
}
