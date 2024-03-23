import { BopomofoBrailleConverter } from "./Converter";

describe("Test BopomofoBrailleConverter", () => {
  test("Test Phonetic only 1 - 1", () => {
    let input = "ㄊㄞˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test Phonetic only 2 - 1", () => {
    let input = "ㄊㄞˊㄨㄢ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂⠻⠄");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test Phonetic only 3 - 1", () => {
    let input = "ㄊㄞˊㄨㄢㄖㄣˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂⠻⠄⠛⠥⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
  test("Test Phonetic only 3 - 2", () => {
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

  test("Test Phonetic and letter 1 - 1", () => {
    let input = "ㄊㄞˊabc";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠁⠃⠉");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ abc");
  });

  test("Test Phonetic and letter 1 - 2", () => {
    let input = "ㄊㄞˊAbc";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠠⠁⠃⠉");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ Abc");
  });

  test("Test Phonetic and digit 1 - 1", () => {
    let input = "ㄊㄞˊ1234";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠼⠂⠆⠒⠲");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ 1234");
  });

  test("Test digit 1 - 1", () => {
    let input = "1234";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠼⠂⠆⠒⠲");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("1234");
  });

  test("Test digit and letter 1 - 1", () => {
    let input = "ABCD 1234";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠠⠁⠠⠃⠠⠉⠠⠙ ⠼⠂⠆⠒⠲");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ABCD 1234");
  });

  test("Test digit and letter 2 - 1", () => {
    let input = "1234 ABCD";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠼⠂⠆⠒⠲ ⠠⠁⠠⠃⠠⠉⠠⠙");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("1234 ABCD");
  });

  test("Test digit 1 - 1", () => {
    let input = "name";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠝⠁⠍⠑");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("name");
  });
});
