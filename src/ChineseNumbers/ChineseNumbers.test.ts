import { Case, ChineseNumbers } from "./ChineseNumbers";
import { TrimZerosAtStart } from "./StringUtils";

describe("Test Chinese Numbers", () => {
  test("TrimZerosAtStart 1", () => {
    let output = TrimZerosAtStart("0001");
    expect(output).toBe("1");
  });

  test("TrimZerosAtStart 2", () => {
    let output = TrimZerosAtStart("0002");
    expect(output).toBe("2");
  });

  test("TrimZerosAtStart 3", () => {
    let output = TrimZerosAtStart("0012");
    expect(output).toBe("12");
  });
});

describe("Test Chinese Numbers", () => {
  test("Test Chinese Numbers 1", () => {
    let output = ChineseNumbers.generate("1", "", Case.lowercase);
    expect(output).toBe("一");
  });

  test("Test Chinese Numbers 2", () => {
    let output = ChineseNumbers.generate("12", "", Case.lowercase);
    expect(output).toBe("一十二");
  });

  test("Test Chinese Numbers 3", () => {
    let output = ChineseNumbers.generate("1234", "", Case.lowercase);
    expect(output).toBe("一千二百三十四");
  });

  test("Test Chinese Numbers 4", () => {
    let output = ChineseNumbers.generate("1234", "", Case.uppercase);
    expect(output).toBe("壹仟貳佰參拾肆");
  });
});
