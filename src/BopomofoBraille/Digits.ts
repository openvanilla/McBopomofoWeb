export enum Digit {
  zero = "0",
  one = "1",
  two = "2",
  three = "3",
  four = "4",
  five = "5",
  six = "6",
  seven = "7",
  eight = "8",
  nine = "9",
}

export namespace Digit {
  const map = new Map<Digit, string>([
    [Digit.zero, "⠴"],
    [Digit.one, "⠂"],
    [Digit.two, "⠆"],
    [Digit.three, "⠒"],
    [Digit.four, "⠲"],
    [Digit.five, "⠢"],
    [Digit.six, "⠖"],
    [Digit.seven, "⠶"],
    [Digit.eight, "⠦"],
    [Digit.nine, "⠔"],
  ]);

  export const allDigits: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values());

  export function fromDigit(b: string): Digit | undefined {
    if (map.has(b as Digit)) {
      return b as Digit;
    }
    return undefined;
  }
  export function fromBraille(b: string): Digit | undefined {
    for (let [key, value] of map) {
      if (value === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toDigit(c: Digit): string {
    return c;
  }
  export function toBraille(c: Digit): string {
    return map.get(c) as string;
  }
}
