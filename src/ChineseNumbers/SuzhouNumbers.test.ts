import { SuzhouNumbers } from "./SuzhouNumbers";

describe("Test Chinese Numbers", () => {
  test("Suzhou 1", () => {
    let output = SuzhouNumbers.generate("0001", "", "", true);
    expect(output).toBe("〡");
  });

  test("Suzhou 123", () => {
    let output = SuzhouNumbers.generate("123", "", "", true);
    expect(output).toBe("〡二〣\n百");
  });

  test("Suzhou 1234", () => {
    let output = SuzhouNumbers.generate("1234", "", "", true);
    expect(output).toBe("〡二〣〤\n千");
  });
});
