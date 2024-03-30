import { BopomofoBrailleConverter } from "./Converter";

describe("Test BopomofoBrailleConverter", () => {
  test("Test 1 bopomofo syllable", () => {
    let input = "ㄊㄞˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test 2 bopomofo syllables", () => {
    let input = "ㄊㄞˊㄨㄢ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂⠻⠄");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test 3 bopomofo syllables 1", () => {
    let input = "ㄊㄞˊㄨㄢㄖㄣˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂⠻⠄⠛⠥⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
  test("Test 3 bopomofo syllables 2", () => {
    let input = "ㄏㄨㄤˊㄈㄟㄏㄨㄥˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test bopomofo syllables and punctuation 1", () => {
    let input = "ㄏㄨㄤˊㄈㄟㄏㄨㄥˊ，";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠗⠸⠂⠟⠴⠄⠗⠯⠂⠆");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test bopomofo syllables and punctuation 2 ", () => {
    let input = "『『ㄊㄞˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤⠋⠺⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test long phrase", () => {
    let input =
      "『『ㄊㄞˊㄨㄢㄖㄣˊㄒㄩㄧㄠˋㄏㄣˇㄉㄨㄛㄉㄜ˙ㄒㄧㄠㄆㄛㄎㄨㄞˋ』』";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤⠋⠺⠂⠻⠄⠛⠥⠂⠑⠳⠄⠪⠐⠗⠥⠈⠙⠒⠄⠙⠮⠁⠑⠪⠄⠏⠣⠄⠇⠶⠐⠤⠆⠤⠆⠤⠆⠤⠆");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test punctuation 1", () => {
    let input = "『";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test punctuation 2", () => {
    let input = "『『";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test bopomofo syllables and lower case letter", () => {
    let input = "ㄊㄞˊabc";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠁⠃⠉");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ abc");
  });

  test("Test bopomofo syllables and upper case letter - 1", () => {
    let input = "ㄊㄞˊAbc";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠠⠁⠃⠉");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ Abc");
  });

  test("Test bopomofo syllables and upper case letter - 2", () => {
    let input = "Abcㄊㄞˊ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠠⠁⠃⠉ ⠋⠺⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("Abc ㄊㄞˊ");
  });

  test("Test bopomofo syllables and digit 1 - 1", () => {
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

  test("Test digit 1 - 2", () => {
    let input = "2234";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("2234");
  });

  test("Test digit 1 - 3", () => {
    let input = "22.34";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("22.34");
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

  test("Test Text and Digits 1", () => {
    let input = "ㄉㄧˋ1";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠼⠂");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄉㄧˋ 1");
  });

  test("Test letter 1 - 1", () => {
    let input = "name";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠝⠁⠍⠑");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("name");
  });

  test("Test mix 1 - 1", () => {
    let input = "ㄒㄧㄠˇㄇㄞˋ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋ");
  });

  test("Test mix 1 - 2", () => {
    let input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ");
  });

  test("Test mix 1 - 3", () => {
    let input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 2.5";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄ ⠼⠆⠨⠢");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 2.5");
  });

  test("Test mix 1 - 4", () => {
    let input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25%";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄ ⠼⠆⠢⠈⠴");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25%");
  });

  test("Test mix 1 - 5", () => {
    let input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25°C";
    let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄ ⠼⠆⠢⠘⠨⠡ ⠰⠠⠉");
    let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25°C");
  });
});
