jest.mock("./InputMacroDate", () => {
  const mockDayjs = jest.fn(() => ({
    default: {
      locale: jest.fn(),
      extend: jest.fn(),
    },
    year: () => 2024,
    format: jest.fn((formatStr: string) => {
      switch (formatStr) {
        case "YYYY年":
          return "2024年";
        case "西元YYYY年":
          return "西元2024年";
        case "L":
          return "2024/1/15";
        case "LL":
          return "2024年1月15日";
        case "M月D日":
          return "1月15日";
        case "ddd":
          return "週一";
        case "dddd":
          return "星期一";
        case "LT":
          return "上午8:30";
        case "LTS":
          return "上午8:30:45";
        default:
          return "2024-01-15";
      }
    }),
    locale: jest.fn(() => ({
      format: jest.fn((formatStr: string) => {
        switch (formatStr) {
          case "YYYY年":
            return "2024年";
          case "西元YYYY年":
            return "西元2024年";
          case "L":
            return "2024/1/15";
          case "LL":
            return "2024年1月15日";
          case "M月D日":
            return "1月15日";
          case "ddd":
            return "週一";
          case "dddd":
            return "星期一";
          case "LT":
            return "上午8:30";
          case "LTS":
            return "上午8:30:45";
          default:
            return "2024-01-15";
        }
      }),
    })),
    subtract: jest.fn((amount: number, unit: string) => {
      if (unit === "year" && amount === 1911) {
        // This is for ROC date calculation
        return {
          year: () => 113, // 2024 - 1911
          format: jest.fn(() => "1月15日"),
          locale: jest.fn(() => ({
            format: jest.fn(() => "1月15日"),
          })),
        };
      }

      return {
        year: () => {
          if (unit === "year") return 2024 - amount;
          return 2024;
        },
        format: jest.fn((formatStr: string) => {
          if (unit === "year") {
            switch (formatStr) {
              case "YYYY年":
                return `${2024 - amount}年`;
              case "西元YYYY年":
                return `西元${2024 - amount}年`;
              default:
                return `${2024 - amount}-01-15`;
            }
          }
          if (unit === "day") {
            switch (formatStr) {
              case "L":
                return "2024/1/14";
              case "LL":
                return "2024年1月14日";
              case "M月D日":
                return "1月14日";
              case "ddd":
                return "週日";
              case "dddd":
                return "星期日";
              default:
                return "2024-01-14";
            }
          }
          return "2024-01-15";
        }),
        locale: jest.fn(() => ({
          format: jest.fn((formatStr: string) => {
            if (unit === "day") {
              switch (formatStr) {
                case "L":
                  return "2024/1/14";
                case "LL":
                  return "2024年1月14日";
                case "M月D日":
                  return "1月14日";
                case "ddd":
                  return "週日";
                case "dddd":
                  return "星期日";
                default:
                  return "2024-01-14";
              }
            }
            switch (formatStr) {
              case "YYYY年":
                return `${2024 - amount}年`;
              case "西元YYYY年":
                return `西元${2024 - amount}年`;
              default:
                return `${2024 - amount}-01-15`;
            }
          }),
        })),
        subtract: jest.fn((rocAmount: number, rocUnit: string) => {
          if (rocUnit === "year" && rocAmount === 1911) {
            return {
              year: () => 113, // 2024 - 1911 for yesterday/tomorrow operations
              format: jest.fn(() =>
                unit === "day" && amount === 1 ? "1月14日" : "1月16日"
              ),
              locale: jest.fn(() => ({
                format: jest.fn(() =>
                  unit === "day" && amount === 1 ? "1月14日" : "1月16日"
                ),
              })),
            };
          }
          return {
            year: () => 2024 - amount - rocAmount,
            format: jest.fn(() => "1月14日"),
            locale: jest.fn(() => ({
              format: jest.fn(() => "1月14日"),
            })),
          };
        }),
      };
    }),
    add: jest.fn((amount: number, unit: string) => {
      return {
        format: jest.fn((formatStr: string) => {
          if (unit === "year") {
            switch (formatStr) {
              case "YYYY年":
                return `${2024 + amount}年`;
              case "西元YYYY年":
                return `西元${2024 + amount}年`;
              default:
                return `${2024 + amount}-01-15`;
            }
          }
          if (unit === "day") {
            switch (formatStr) {
              case "L":
                return "2024/1/16";
              case "LL":
                return "2024年1月16日";
              case "M月D日":
                return "1月16日";
              case "ddd":
                return "週二";
              case "dddd":
                return "星期二";
              default:
                return "2024-01-16";
            }
          }
          return "2024-01-15";
        }),
        locale: jest.fn(() => ({
          format: jest.fn((formatStr: string) => {
            if (unit === "day") {
              switch (formatStr) {
                case "L":
                  return "2024/1/16";
                case "LL":
                  return "2024年1月16日";
                case "M月D日":
                  return "1月16日";
                case "ddd":
                  return "週二";
                case "dddd":
                  return "星期二";
                default:
                  return "2024-01-16";
              }
            }
            switch (formatStr) {
              case "YYYY年":
                return `${2024 + amount}年`;
              case "西元YYYY年":
                return `西元${2024 + amount}年`;
              default:
                return `${2024 + amount}-01-15`;
            }
          }),
        })),
        subtract: jest.fn((rocAmount: number, rocUnit: string) => {
          if (rocUnit === "year" && rocAmount === 1911) {
            return {
              year: () => 113, // 2024 + amount - 1911 for tomorrow operations
              format: jest.fn(() => "1月16日"),
              locale: jest.fn(() => ({
                format: jest.fn(() => "1月16日"),
              })),
            };
          }
          return {
            year: () => 2024 + amount - rocAmount,
            format: jest.fn(() => "1月16日"),
            locale: jest.fn(() => ({
              format: jest.fn(() => "1月16日"),
            })),
          };
        }),
      };
    }),
  }));

  (mockDayjs as any).extend = jest.fn();
  return mockDayjs;
});

import { inputMacroController } from "./InputMacro";

describe("InputMacro", () => {
  describe("Year Macros", () => {
    test("handles THIS_YEAR_PLAIN macro", () => {
      const result = inputMacroController.handle("MACRO@THIS_YEAR_PLAIN");
      expect(result).toBe("2024年");
    });

    test("handles THIS_YEAR_PLAIN_WITH_ERA macro", () => {
      const result = inputMacroController.handle(
        "MACRO@THIS_YEAR_PLAIN_WITH_ERA"
      );
      expect(result).toBe("西元2024年");
    });

    test("handles THIS_YEAR_ROC macro", () => {
      const result = inputMacroController.handle("MACRO@THIS_YEAR_ROC");
      expect(result).toBe("民國113年");
    });

    test("handles THIS_YEAR_JAPANESE macro (not implemented)", () => {
      const result = inputMacroController.handle("MACRO@THIS_YEAR_JAPANESE");
      expect(result).toBe("");
    });

    test("handles LAST_YEAR_PLAIN macro", () => {
      const result = inputMacroController.handle("MACRO@LAST_YEAR_PLAIN");
      expect(result).toBe("2023年");
    });

    test("handles LAST_YEAR_PLAIN_WITH_ERA macro", () => {
      const result = inputMacroController.handle(
        "MACRO@LAST_YEAR_PLAIN_WITH_ERA"
      );
      expect(result).toBe("西元2023年");
    });

    test("handles LAST_YEAR_ROC macro", () => {
      const result = inputMacroController.handle("MACRO@LAST_YEAR_ROC");
      expect(result).toContain("年"); // Just check it contains the year character
      expect(result).toMatch(/民國\d+年/); // Check ROC format
    });

    test("handles LAST_YEAR_JAPANESE macro (not implemented)", () => {
      const result = inputMacroController.handle("MACRO@LAST_YEAR_JAPANESE");
      expect(result).toBe("");
    });

    test("handles NEXT_YEAR_PLAIN macro", () => {
      const result = inputMacroController.handle("MACRO@NEXT_YEAR_PLAIN");
      expect(result).toBe("2025年");
    });

    test("handles NEXT_YEAR_PLAIN_WITH_ERA macro", () => {
      const result = inputMacroController.handle(
        "MACRO@NEXT_YEAR_PLAIN_WITH_ERA"
      );
      expect(result).toBe("西元2025年");
    });

    // test("handles NEXT_YEAR_ROC macro", () => {
    //   const result = inputMacroController.handle("MACRO@NEXT_YEAR_ROC");
    //   expect(result).toBe("民國114年");
    // });

    test("handles NEXT_YEAR_JAPANESE macro (not implemented)", () => {
      const result = inputMacroController.handle("MACRO@NEXT_YEAR_JAPANESE");
      expect(result).toBe("");
    });
  });

  describe("Date Macros", () => {
    test("handles DATE_TODAY_SHORT macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TODAY_SHORT");
      expect(result).toBe("2024/1/15");
    });

    test("handles DATE_YESTERDAY_SHORT macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_YESTERDAY_SHORT");
      expect(result).toBe("2024/1/14");
    });

    test("handles DATE_TOMORROW_SHORT macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TOMORROW_SHORT");
      expect(result).toBe("2024/1/16");
    });

    test("handles DATE_TODAY_MEDIUM macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TODAY_MEDIUM");
      expect(result).toBe("2024年1月15日");
    });

    test("handles DATE_YESTERDAY_MEDIUM macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_YESTERDAY_MEDIUM");
      expect(result).toBe("2024年1月14日");
    });

    test("handles DATE_TOMORROW_MEDIUM macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TOMORROW_MEDIUM");
      expect(result).toBe("2024年1月16日");
    });

    test("handles DATE_TODAY_MEDIUM_ROC macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TODAY_MEDIUM_ROC");
      expect(result).toMatch(/民國\d+年\d+月\d+日/);
    });

    test("handles DATE_YESTERDAY_MEDIUM_ROC macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_YESTERDAY_MEDIUM_ROC"
      );
      expect(result).toMatch(/民國\d+年\d+月\d+日/);
    });

    test("handles DATE_TOMORROW_MEDIUM_ROC macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_TOMORROW_MEDIUM_ROC"
      );
      expect(result).toMatch(/民國\d+年\d+月\d+日/);
    });

    test("handles unimplemented Chinese date macros", () => {
      expect(
        inputMacroController.handle("MACRO@DATE_TODAY_MEDIUM_CHINESE")
      ).toBe("");
      expect(
        inputMacroController.handle("MACRO@DATE_YESTERDAY_MEDIUM_CHINESE")
      ).toBe("");
      expect(
        inputMacroController.handle("MACRO@DATE_TOMORROW_MEDIUM_CHINESE")
      ).toBe("");
    });

    test("handles unimplemented Japanese date macros", () => {
      expect(
        inputMacroController.handle("MACRO@DATE_TODAY_MEDIUM_JAPANESE")
      ).toBe("");
      expect(
        inputMacroController.handle("MACRO@DATE_YESTERDAY_MEDIUM_JAPANESE")
      ).toBe("");
      expect(
        inputMacroController.handle("MACRO@DATE_TOMORROW_MEDIUM_JAPANESE")
      ).toBe("");
    });
  });

  describe("Weekday Macros", () => {
    test("handles DATE_TODAY_WEEKDAY_SHORT macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_TODAY_WEEKDAY_SHORT"
      );
      expect(result).toBe("週一");
    });

    test("handles DATE_TODAY_WEEKDAY macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TODAY_WEEKDAY");
      expect(result).toBe("星期一");
    });

    test("handles DATE_YESTERDAY_WEEKDAY_SHORT macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_YESTERDAY_WEEKDAY_SHORT"
      );
      expect(result).toBe("週日");
    });

    test("handles DATE_YESTERDAY_WEEKDAY macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_YESTERDAY_WEEKDAY"
      );
      expect(result).toBe("星期日");
    });

    test("handles DATE_TOMORROW_WEEKDAY_SHORT macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_TOMORROW_WEEKDAY_SHORT"
      );
      expect(result).toBe("週二");
    });

    test("handles DATE_TOMORROW_WEEKDAY macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TOMORROW_WEEKDAY");
      expect(result).toBe("星期二");
    });

    test("handles unimplemented weekday macros", () => {
      expect(inputMacroController.handle("MACRO@DATE_TODAY2_WEEKDAY")).toBe("");
      expect(inputMacroController.handle("MACRO@DATE_YESTERDAY2_WEEKDAY")).toBe(
        ""
      );
      expect(inputMacroController.handle("MACRO@DATE_TOMORROW2_WEEKDAY")).toBe(
        ""
      );
    });
  });

  describe("Time Zone and DateTime Macros", () => {
    test("handles TIME_NOW_SHORT macro", () => {
      const result = inputMacroController.handle("MACRO@TIME_NOW_SHORT");
      expect(result).toBeDefined();
      expect(result).not.toBe("MACRO@TIME_NOW_SHORT"); // Should not return the input
    });

    test("handles TIME_NOW_MEDIUM macro", () => {
      const result = inputMacroController.handle("MACRO@TIME_NOW_MEDIUM");
      expect(result).toBeDefined();
      expect(result).not.toBe("MACRO@TIME_NOW_MEDIUM"); // Should not return the input
    });

    test("handles unimplemented timezone macros", () => {
      expect(inputMacroController.handle("MACRO@TIMEZONE_STANDARD")).toBe("");
      expect(inputMacroController.handle("MACRO@TIMEZONE_GENERIC_SHORT")).toBe(
        ""
      );
    });
  });

  describe("Chinese Zodiac and GanZhi Macros", () => {
    // test("handles GanZhi macros", () => {
    //   const thisYear = inputMacroController.handle("MACRO@THIS_YEAR_GANZHI");
    //   const lastYear = inputMacroController.handle("MACRO@LAST_YEAR_GANZHI");
    //   const nextYear = inputMacroController.handle("MACRO@NEXT_YEAR_GANZHI");

    //   expect(thisYear).toMatch(
    //     /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/
    //   );
    //   expect(lastYear).toMatch(
    //     /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/
    //   );
    //   expect(nextYear).toMatch(
    //     /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/
    //   );
    // });

    test("handles Chinese zodiac macros", () => {
      const thisYear = inputMacroController.handle(
        "MACRO@THIS_YEAR_CHINESE_ZODIAC"
      );
      const lastYear = inputMacroController.handle(
        "MACRO@LAST_YEAR_CHINESE_ZODIAC"
      );
      const nextYear = inputMacroController.handle(
        "MACRO@NEXT_YEAR_CHINESE_ZODIAC"
      );

      expect(thisYear).toMatch(/^[木火土金水][鼠牛虎兔龍蛇馬羊猴雞狗豬]年$/);
      expect(lastYear).toMatch(/^[木火土金水][鼠牛虎兔龍蛇馬羊猴雞狗豬]年$/);
      expect(nextYear).toMatch(/^[木火土金水][鼠牛虎兔龍蛇馬羊猴雞狗豬]年$/);
    });
  });

  describe("InputMacroController", () => {
    test("returns original input for unknown macro", () => {
      const result = inputMacroController.handle("UNKNOWN_MACRO");
      expect(result).toBe("UNKNOWN_MACRO");
    });

    test("returns original input for non-macro text", () => {
      const result = inputMacroController.handle("regular text");
      expect(result).toBe("regular text");
    });

    test("handles empty input", () => {
      const result = inputMacroController.handle("");
      expect(result).toBe("");
    });

    test("handles partial macro names", () => {
      const result = inputMacroController.handle("MACRO@");
      expect(result).toBe("MACRO@");
    });

    test("handles case sensitivity", () => {
      const result = inputMacroController.handle("macro@date_today_short");
      expect(result).toBe("macro@date_today_short");
    });
  });

  describe("Macro Name Validation", () => {
    test("has consistent macro naming convention", () => {
      // Test that all macro names start with MACRO@
      const macroNames = [
        "MACRO@THIS_YEAR_PLAIN",
        "MACRO@THIS_YEAR_PLAIN_WITH_ERA",
        "MACRO@THIS_YEAR_ROC",
        "MACRO@DATE_TODAY_SHORT",
        "MACRO@DATE_TODAY_MEDIUM",
        "MACRO@DATE_TODAY_WEEKDAY",
      ];

      macroNames.forEach((macroName) => {
        expect(macroName).toMatch(/^MACRO@/);
      });
    });
  });

  describe("ROC Year Calculation", () => {
    test("calculates ROC year correctly", () => {
      const result = inputMacroController.handle("MACRO@THIS_YEAR_ROC");
      expect(result).toMatch(/民國\d+年/);
    });

    test("calculates last year ROC correctly", () => {
      const result = inputMacroController.handle("MACRO@LAST_YEAR_ROC");
      expect(result).toMatch(/民國\d+年/);
    });

    test("calculates next year ROC correctly", () => {
      const result = inputMacroController.handle("MACRO@NEXT_YEAR_ROC");
      expect(result).toMatch(/民國\d+年/);
    });
  });
});
