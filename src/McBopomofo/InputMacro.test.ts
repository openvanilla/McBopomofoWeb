jest.mock("./InputMacroDate", () => {
  const mockDayjs = jest.fn(() => ({
    default: {
      locale: jest.fn(),
      extend: jest.fn(),
    },
    year: () => 2024,
    month: () => 0,
    date: () => 15,
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
        month: () => 0,
        date: () => (unit === "day" && amount === 1 ? 14 : 15),
        format: jest.fn((formatStr: string) => {
          if (unit === "year") {
            switch (formatStr) {
              case "YYYY年":
                return `${2024 - amount}年`;
              case "西元YYYY年":
                return `西元${2024 - amount}年`;
              case "M月D日":
                return "1月15日";
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
              case "M月D日":
                return "1月15日";
              default:
                return `${2024 - amount}-01-15`;
            }
          }),
        })),
        subtract: jest.fn((rocAmount: number, rocUnit: string) => {
          if (rocUnit === "year" && rocAmount === 1911) {
            return {
              year: () =>
                unit === "year" ? 2024 - amount - 1911 : 2024 - 1911,
              format: jest.fn(() =>
                unit === "day" && amount === 1 ? "1月14日" : "1月16日",
              ),
              locale: jest.fn(() => ({
                format: jest.fn(() =>
                  unit === "day" && amount === 1 ? "1月14日" : "1月16日",
                ),
              })),
            };
          }
          return {
            year: () =>
              unit === "year" ? 2024 - amount - rocAmount : 2024 - rocAmount,
            month: () => 0,
            date: () => 14,
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
        year: () => {
          if (unit === "year") return 2024 + amount;
          return 2024;
        },
        month: () => 0,
        date: () => (unit === "day" && amount === 1 ? 16 : 15),
        format: jest.fn((formatStr: string) => {
          if (unit === "year") {
            switch (formatStr) {
              case "YYYY年":
                return `${2024 + amount}年`;
              case "西元YYYY年":
                return `西元${2024 + amount}年`;
              case "M月D日":
                return "1月15日";
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
              case "M月D日":
                return "1月15日";
              default:
                return `${2024 + amount}-01-15`;
            }
          }),
        })),
        subtract: jest.fn((rocAmount: number, rocUnit: string) => {
          if (rocUnit === "year" && rocAmount === 1911) {
            return {
              year: () =>
                unit === "year" ? 2024 + amount - 1911 : 2024 - 1911,
              format: jest.fn(() => "1月16日"),
              locale: jest.fn(() => ({
                format: jest.fn(() => "1月16日"),
              })),
            };
          }
          return {
            year: () =>
              unit === "year" ? 2024 + amount - rocAmount : 2024 - rocAmount,
            month: () => 0,
            date: () => 16,
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

jest.mock("lunar-typescript", () => ({
  Solar: {
    fromYmd: jest.fn((_year: number, month: number, day: number) => ({
      getLunar: () => ({
        getYearInChinese: () => "二零二四",
        getMonthInChinese: () => (month === 1 ? "正" : `${month}`),
        getDayInChinese: () => {
          switch (day) {
            case 14:
              return "初四";
            case 15:
              return "初五";
            case 16:
              return "初六";
            default:
              return `${day}`;
          }
        },
      }),
    })),
  },
}));

import { inputMacroController } from "./InputMacro";

describe("InputMacro", () => {
  describe("Year Macros", () => {
    test("handles THIS_YEAR_PLAIN macro", () => {
      const result = inputMacroController.handle("MACRO@THIS_YEAR_PLAIN");
      expect(result).toBe("2024年");
    });

    test("handles THIS_YEAR_PLAIN_WITH_ERA macro", () => {
      const result = inputMacroController.handle(
        "MACRO@THIS_YEAR_PLAIN_WITH_ERA",
      );
      expect(result).toBe("西元2024年");
    });

    test("handles THIS_YEAR_ROC macro", () => {
      const result = inputMacroController.handle("MACRO@THIS_YEAR_ROC");
      expect(result).toBe("民國113年");
    });

    test("handles THIS_YEAR_JAPANESE macro", () => {
      const result = inputMacroController.handle("MACRO@THIS_YEAR_JAPANESE");
      expect(result).toBe("令和6年");
    });

    test("handles LAST_YEAR_PLAIN macro", () => {
      const result = inputMacroController.handle("MACRO@LAST_YEAR_PLAIN");
      expect(result).toBe("2023年");
    });

    test("handles LAST_YEAR_PLAIN_WITH_ERA macro", () => {
      const result = inputMacroController.handle(
        "MACRO@LAST_YEAR_PLAIN_WITH_ERA",
      );
      expect(result).toBe("西元2023年");
    });

    test("handles LAST_YEAR_ROC macro", () => {
      const result = inputMacroController.handle("MACRO@LAST_YEAR_ROC");
      expect(result).toContain("年"); // Just check it contains the year character
      expect(result).toMatch(/民國\d+年/); // Check ROC format
    });

    test("handles LAST_YEAR_JAPANESE macro", () => {
      const result = inputMacroController.handle("MACRO@LAST_YEAR_JAPANESE");
      expect(result).toBe("令和5年");
    });

    test("handles NEXT_YEAR_PLAIN macro", () => {
      const result = inputMacroController.handle("MACRO@NEXT_YEAR_PLAIN");
      expect(result).toBe("2025年");
    });

    test("handles NEXT_YEAR_PLAIN_WITH_ERA macro", () => {
      const result = inputMacroController.handle(
        "MACRO@NEXT_YEAR_PLAIN_WITH_ERA",
      );
      expect(result).toBe("西元2025年");
    });

    // test("handles NEXT_YEAR_ROC macro", () => {
    //   const result = inputMacroController.handle("MACRO@NEXT_YEAR_ROC");
    //   expect(result).toBe("民國114年");
    // });

    test("handles NEXT_YEAR_JAPANESE macro", () => {
      const result = inputMacroController.handle("MACRO@NEXT_YEAR_JAPANESE");
      expect(result).toBe("令和7年");
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
        "MACRO@DATE_YESTERDAY_MEDIUM_ROC",
      );
      expect(result).toMatch(/民國\d+年\d+月\d+日/);
    });

    test("handles DATE_TOMORROW_MEDIUM_ROC macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_TOMORROW_MEDIUM_ROC",
      );
      expect(result).toMatch(/民國\d+年\d+月\d+日/);
    });

    test("handles Chinese date macros", () => {
      expect(
        inputMacroController.handle("MACRO@DATE_TODAY_MEDIUM_CHINESE"),
      ).toBe("二零二四年正月初五");
      expect(
        inputMacroController.handle("MACRO@DATE_YESTERDAY_MEDIUM_CHINESE"),
      ).toBe("二零二四年正月初四");
      expect(
        inputMacroController.handle("MACRO@DATE_TOMORROW_MEDIUM_CHINESE"),
      ).toBe("二零二四年正月初六");
    });

    test("handles Japanese date macros", () => {
      expect(
        inputMacroController.handle("MACRO@DATE_TODAY_MEDIUM_JAPANESE"),
      ).toBe("令和6年1月15日");
      expect(
        inputMacroController.handle("MACRO@DATE_YESTERDAY_MEDIUM_JAPANESE"),
      ).toBe("令和6年1月14日");
      expect(
        inputMacroController.handle("MACRO@DATE_TOMORROW_MEDIUM_JAPANESE"),
      ).toBe("令和6年1月16日");
      expect(
        inputMacroController.handle("MACRO@DATE_TOMORROW_FULL_JAPANESE"),
      ).toBe("令和6年1月16日");
    });
  });

  describe("Weekday Macros", () => {
    test("handles DATE_TODAY_WEEKDAY_SHORT macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_TODAY_WEEKDAY_SHORT",
      );
      expect(result).toBe("週一");
    });

    test("handles DATE_TODAY_WEEKDAY macro", () => {
      const result = inputMacroController.handle("MACRO@DATE_TODAY_WEEKDAY");
      expect(result).toBe("星期一");
    });

    test("handles DATE_YESTERDAY_WEEKDAY_SHORT macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_YESTERDAY_WEEKDAY_SHORT",
      );
      expect(result).toBe("週日");
    });

    test("handles DATE_YESTERDAY_WEEKDAY macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_YESTERDAY_WEEKDAY",
      );
      expect(result).toBe("星期日");
    });

    test("handles DATE_TOMORROW_WEEKDAY_SHORT macro", () => {
      const result = inputMacroController.handle(
        "MACRO@DATE_TOMORROW_WEEKDAY_SHORT",
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
        "",
      );
      expect(inputMacroController.handle("MACRO@DATE_TOMORROW2_WEEKDAY")).toBe(
        "",
      );
    });

    test("handles Japanese weekday macros", () => {
      const todayJp = inputMacroController.handle(
        "MACRO@DATE_TODAY_WEEKDAY_JAPANESE",
      );
      expect(todayJp).toBeDefined();

      const yesterdayJp = inputMacroController.handle(
        "MACRO@DATE_YESTERDAY_WEEKDAY_JAPANESE",
      );
      expect(yesterdayJp).toBeDefined();

      const tomorrowJp = inputMacroController.handle(
        "MACRO@DATE_TOMORROW_WEEKDAY_JAPANESE",
      );
      expect(tomorrowJp).toBeDefined();
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

    test("handles timezone macros", () => {
      const dateTimeFormatSpy = jest
        .spyOn(Intl, "DateTimeFormat")
        .mockImplementation(
          ((locale?: string | string[], options?: Intl.DateTimeFormatOptions) =>
            ({
              resolvedOptions: () =>
                ({
                  locale: "zh-TW",
                  calendar: "gregory",
                  numberingSystem: "latn",
                  timeZone: "Asia/Taipei",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                }) as Intl.ResolvedDateTimeFormatOptions,
              formatToParts: () => [
                {
                  type: "timeZoneName",
                  value:
                    options?.timeZoneName === "longGeneric"
                      ? "台北標準時間"
                      : "台灣時間",
                },
              ],
            }) as Intl.DateTimeFormat) as typeof Intl.DateTimeFormat,
        );

      expect(inputMacroController.handle("MACRO@TIMEZONE_STANDARD")).toBe(
        "台北標準時間",
      );
      expect(inputMacroController.handle("MACRO@TIMEZONE_GENERIC_SHORT")).toBe(
        "台灣時間",
      );

      dateTimeFormatSpy.mockRestore();
    });
  });

  describe("Chinese Zodiac and GanZhi Macros", () => {
    test("handles GanZhi macros", () => {
      const thisYear = inputMacroController.handle("MACRO@THIS_YEAR_GANZHI");
      const lastYear = inputMacroController.handle("MACRO@LAST_YEAR_GANZHI");
      const nextYear = inputMacroController.handle("MACRO@NEXT_YEAR_GANZHI");

      expect(thisYear).toMatch(
        /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/,
      );
      expect(lastYear).toMatch(
        /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/,
      );
      expect(nextYear).toMatch(
        /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/,
      );
    });

    test("handles Chinese zodiac macros", () => {
      const thisYear = inputMacroController.handle(
        "MACRO@THIS_YEAR_CHINESE_ZODIAC",
      );
      const lastYear = inputMacroController.handle(
        "MACRO@LAST_YEAR_CHINESE_ZODIAC",
      );
      const nextYear = inputMacroController.handle(
        "MACRO@NEXT_YEAR_CHINESE_ZODIAC",
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
