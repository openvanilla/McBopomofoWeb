import { BopomofoBrailleConverter } from "./Converter";

describe("Test BopomofoBrailleConverter", () => {
  test("Test Phonetic only 1", () => {
    let input = "ㄊㄞˊㄨㄢㄖㄣˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂⠻⠄⠛⠥⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
  test("Test Phonetic only 2", () => {
    let input = "ㄏㄨㄤˊㄈㄟㄏㄨㄥˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
  test("Test Phonetic and Punctuation", () => {
    let input = "ㄏㄨㄤˊㄈㄟㄏㄨㄥˊ，";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠗⠸⠂⠟⠴⠄⠗⠯⠂⠆");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
  test("Test Long Phrase", () => {
    let input =
      "『『ㄊㄞˊㄨㄢㄖㄣˊㄒㄩㄧㄠˋㄏㄣˇㄉㄨㄛㄉㄜ˙ㄒㄧㄠㄆㄛㄎㄨㄞˋ』』";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤⠋⠺⠂⠻⠄⠛⠥⠂⠑⠳⠄⠪⠐⠗⠥⠈⠙⠒⠄⠙⠮⠁⠑⠪⠄⠏⠣⠄⠇⠶⠐⠤⠆⠤⠆⠤⠆⠤⠆");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
  test("Test Punctuation 1", () => {
    let input = "『";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test Punctuation 2", () => {
    let input = "『『";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test Punctuation 3", () => {
    let input = "『『ㄊㄞˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤⠋⠺⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
});
