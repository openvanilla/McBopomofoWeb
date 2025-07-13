import { SuzhouNumbers } from "./SuzhouNumbers";

describe("Test Chinese Numbers", () => {
  describe("Basic number generation", () => {
    test("Suzhou 1", () => {
      const output = SuzhouNumbers.generate("0001", "", "", true);
      expect(output).toBe("〡");
    });

    test("Suzhou 123", () => {
      const output = SuzhouNumbers.generate("123", "", "", true);
      expect(output).toBe("〡二〣\n百");
    });

    test("Suzhou 1234", () => {
      const output = SuzhouNumbers.generate("1234", "", "", true);
      expect(output).toBe("〡二〣〤\n千");
    });
  });

  describe("Single digit tests", () => {
    test("should handle zero", () => {
      const output = SuzhouNumbers.generate("0", "", "", true);
      expect(output).toBe("〇");
    });

    test("should handle all single digits", () => {
      const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const expected = ["〡", "〢", "〣", "〤", "〥", "〦", "〧", "〨", "〩"];

      digits.forEach((digit, index) => {
        const output = SuzhouNumbers.generate(digit, "", "", true);
        expect(output).toBe(expected[index]);
      });
    });
  });

  describe("Two digit numbers with special forms", () => {
    test("should handle tens with special forms", () => {
      expect(SuzhouNumbers.generate("10", "", "", true)).toBe("〸");
      expect(SuzhouNumbers.generate("20", "", "", true)).toBe("〹");
      expect(SuzhouNumbers.generate("30", "", "", true)).toBe("〺");
    });

    test("should handle other two digit numbers", () => {
      expect(SuzhouNumbers.generate("40", "", "", true)).toBe("〤十");
      expect(SuzhouNumbers.generate("50", "", "", true)).toBe("〥十");
      expect(SuzhouNumbers.generate("11", "", "", true)).toBe("〡一\n十");
      expect(SuzhouNumbers.generate("22", "", "", true)).toBe("〢二\n十");
      expect(SuzhouNumbers.generate("33", "", "", true)).toBe("〣三\n十");
    });
  });

  describe("Vertical and horizontal alternation", () => {
    test("should alternate between vertical and horizontal for 1,2,3", () => {
      // With preferInitialVertical = true (default)
      expect(SuzhouNumbers.generate("12", "", "", true)).toBe("〡二\n十");
      expect(SuzhouNumbers.generate("21", "", "", true)).toBe("〢一\n十");
      expect(SuzhouNumbers.generate("123", "", "", true)).toBe("〡二〣\n百");
    });

    test("should alternate with preferInitialVertical = false", () => {
      expect(SuzhouNumbers.generate("12", "", "", false)).toBe("一〢\n十");
      expect(SuzhouNumbers.generate("21", "", "", false)).toBe("二〡\n十");
      expect(SuzhouNumbers.generate("123", "", "", false)).toBe("一〢三\n百");
    });

    test("should reset alternation for non-1,2,3 digits", () => {
      expect(SuzhouNumbers.generate("141", "", "", true)).toBe("〡〤〡\n百");
      expect(SuzhouNumbers.generate("242", "", "", true)).toBe("〢〤〢\n百");
    });
  });

  describe("Large numbers", () => {
    test("should handle thousands", () => {
      expect(SuzhouNumbers.generate("5000", "", "", true)).toBe("〥千");
      expect(SuzhouNumbers.generate("9876", "", "", true)).toBe("〩〨〧〦\n千");
    });

    test("should handle ten thousands", () => {
      expect(SuzhouNumbers.generate("12345", "", "", true)).toBe(
        "〡二〣〤〥\n万"
      );
    });

    test("should handle hundred thousands", () => {
      expect(SuzhouNumbers.generate("123456", "", "", true)).toBe(
        "〡二〣〤〥〦\n十万"
      );
    });

    test("should handle millions", () => {
      expect(SuzhouNumbers.generate("1234567", "", "", true)).toBe(
        "〡二〣〤〥〦〧\n百万"
      );
    });

    test("should handle very large numbers", () => {
      expect(SuzhouNumbers.generate("12345678", "", "", true)).toBe(
        "〡二〣〤〥〦〧〨\n千万"
      );
      expect(SuzhouNumbers.generate("123456789", "", "", true)).toBe(
        "〡二〣〤〥〦〧〨〩\n億"
      );
    });
  });

  describe("Decimal parts", () => {
    test("should handle decimal parts", () => {
      const output = SuzhouNumbers.generate("12", "34", "", true);
      expect(output).toBe("〡二〣〤\n十");
    });

    test("should handle decimal with zeros", () => {
      const output = SuzhouNumbers.generate("12", "300", "", true);
      expect(output).toBe("〡二〣\n十");
    });

    test("should handle only decimal part", () => {
      const output = SuzhouNumbers.generate("0", "123", "", true);
      expect(output).toBe("〇〡二〣\n");
    });

    test("should handle empty decimal part", () => {
      const output = SuzhouNumbers.generate("123", "", "", true);
      expect(output).toBe("〡二〣\n百");
    });
  });

  describe("Leading and trailing zeros", () => {
    test("should trim leading zeros", () => {
      expect(SuzhouNumbers.generate("00123", "", "", true)).toBe("〡二〣\n百");
      expect(SuzhouNumbers.generate("000001", "", "", true)).toBe("〡");
    });

    test("should handle all zeros", () => {
      expect(SuzhouNumbers.generate("000", "", "", true)).toBe("〇");
      expect(SuzhouNumbers.generate("0000", "", "", true)).toBe("〇");
    });

    test("should trim trailing zeros in decimal part", () => {
      const output = SuzhouNumbers.generate("123", "4500", "", true);
      expect(output).toBe("〡二〣〤〥\n百");
    });

    test("should handle zeros in middle", () => {
      expect(SuzhouNumbers.generate("1005", "", "", true)).toBe("〡〇〇〥\n千");
      expect(SuzhouNumbers.generate("1050", "", "", true)).toBe("〡〇〥\n千");
    });
  });

  describe("Units", () => {
    test("should append units to single digit", () => {
      const output = SuzhouNumbers.generate("5", "", "個", true);
      expect(output).toBe("〥個");
    });

    test("should append units to multi-digit", () => {
      const output = SuzhouNumbers.generate("123", "", "個", true);
      expect(output).toBe("〡二〣\n百個");
    });

    test("should append units to special forms", () => {
      expect(SuzhouNumbers.generate("10", "", "個", true)).toBe("〸個");
      expect(SuzhouNumbers.generate("20", "", "斤", true)).toBe("〹斤");
      expect(SuzhouNumbers.generate("30", "", "元", true)).toBe("〺元");
    });

    test("should handle empty unit", () => {
      const output = SuzhouNumbers.generate("123", "", "", true);
      expect(output).toBe("〡二〣\n百");
    });
  });

  describe("Edge cases", () => {
    test("should handle empty strings", () => {
      const output = SuzhouNumbers.generate("", "", "", true);
      expect(output).toBe("〇");
    });

    test("should handle string with only zeros", () => {
      expect(SuzhouNumbers.generate("0", "0", "", true)).toBe("〇");
      expect(SuzhouNumbers.generate("00", "00", "", true)).toBe("〇");
    });

    test("should handle mixed zeros", () => {
      expect(SuzhouNumbers.generate("0", "100", "", true)).toBe("〇〡\n");
      expect(SuzhouNumbers.generate("100", "0", "", true)).toBe("〡百");
    });
  });

  describe("Place names coverage", () => {
    test("should use correct place names for all positions", () => {
      const testCases = [
        { input: "1", expected: "〡" }, // no place name for single digit
        { input: "10", expected: "〸" }, // special form
        { input: "11", expected: "〡一\n十" },
        { input: "111", expected: "〡一〡\n百" }, // Fixed: alternation resets for non-1,2,3
        { input: "1111", expected: "〡一〡一\n千" },
      ];

      testCases.forEach(({ input, expected }) => {
        const output = SuzhouNumbers.generate(input, "", "", true);
        expect(output).toBe(expected);
      });
    });

    test("should handle larger place values", () => {
      const places = [
        { digits: 5, name: "万" },
        { digits: 6, name: "十万" },
        { digits: 7, name: "百万" },
        { digits: 8, name: "千万" },
        { digits: 9, name: "億" },
      ];

      places.forEach(({ digits, name }) => {
        const input = "1" + "0".repeat(digits - 1);
        const output = SuzhouNumbers.generate(input, "", "", true);
        expect(output).toContain(name);
      });
    });
  });

  describe("Complex scenarios", () => {
    test("should handle real-world numbers", () => {
      // Year 2024 - fixed alternation pattern
      expect(SuzhouNumbers.generate("2024", "", "年", true)).toBe(
        "〢〇〢〤\n千年"
      );

      // Price 1299 yuan
      expect(SuzhouNumbers.generate("1299", "", "元", true)).toBe(
        "〡二〩〩\n千元"
      );

      // Population 1400000000 (1.4 billion)
      const billion = "1" + "4" + "0".repeat(8);
      const output = SuzhouNumbers.generate(billion, "", "人", true);
      expect(output).toContain("億");
      expect(output).toContain("人");
    });

    test("should handle decimal currency", () => {
      const output = SuzhouNumbers.generate("123", "45", "元", true);
      expect(output).toBe("〡二〣〤〥\n百元");
    });

    test("should maintain consistency with alternation patterns", () => {
      // Test that the same digits produce consistent alternation
      const pattern1 = SuzhouNumbers.generate("131313", "", "", true);
      const pattern2 = SuzhouNumbers.generate("131313", "", "", false);

      expect(pattern1).toContain("〡");
      expect(pattern2).toContain("一");

      // Both should have the same length structure
      expect(pattern1.split("\n").length).toBe(pattern2.split("\n").length);
    });
  });
});
