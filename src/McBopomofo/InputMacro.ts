/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";

/**
 * The interface of input macros.
 *
 * Input macros are a kind of formatted text that can be converted when the
 * input method is running, For example, "MACRO@DATE_TODAY_SHORT" would be
 * converted to the exact date of today.
 */
abstract class InputMacro {
  /** The name of the macro. */
  abstract get name(): string;
  /** The dynamic content to replace the content of the macro. */
  abstract get replacement(): string;
}

/**
 * Macro to get the current year in plain format.
 */
class InputMacroThisYearPlain implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_PLAIN";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("YYYY年");
  }
}

/**
 * Macro to get the current year in plain format with the era.
 */
class InputMacroThisYearPlainWithEra implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_PLAIN_WITH_ERA";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("西元YYYY年");
  }
}

/**
 * Macro to get the current year in ROC format.
 */
class InputMacroThisYearRoc implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_ROC";
  }

  get replacement() {
    const year = dayjs().subtract(1911, "year").year();
    return "民國" + year + "年";
  }
}

/**
 * Macro to get the current year in Japanese format (not supported yet).
 */
class InputMacroThisYearJapanese implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get the previous year in plain format.
 */
class InputMacroLastYearPlain implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_PLAIN";
  }

  get replacement() {
    const day = dayjs().subtract(1, "year");
    return day.locale("zh-tw").format("YYYY年");
  }
}

/**
 * Macro to get the previous year in plain format with the era.
 */
class InputMacroLastYearPlainWithEra implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_PLAIN_WITH_ERA";
  }

  get replacement() {
    const day = dayjs().subtract(1, "year");
    return day.locale("zh-tw").format("西元YYYY年");
  }
}

/**
 * Macro to get the previous year in ROC format.
 */
class InputMacroLastYearRoc implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_ROC";
  }

  get replacement() {
    const year = dayjs().subtract(1, "year").subtract(1911, "year").year();
    return "民國" + year + "年";
  }
}

/**
 * Macro to get the previous year in Japanese format (not supported yet).
 */
class InputMacroLastYearJapanese implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get the next year in plain format.
 */
class InputMacroNextYearPlain implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_PLAIN";
  }

  get replacement() {
    const day = dayjs().add(1, "year");
    return day.locale("zh-tw").format("YYYY年");
  }
}

/**
 * Macro to get the next year in plain format with the era.
 */
class InputMacroNextYearPlainWithEra implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_PLAIN_WITH_ERA";
  }

  get replacement() {
    const day = dayjs().add(1, "year");
    return day.locale("zh-tw").format("西元YYYY年");
  }
}

/**
 * Macro to get the next year in ROC format.
 */
class InputMacroNextYearRoc implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_ROC";
  }

  get replacement() {
    const year = dayjs().add(1, "year").subtract(1911, "year").year();
    return "民國" + year + "年";
  }
}

/**
 * Macro to get the next year in Japanese format (not supported yet).
 */
class InputMacroNextYearJapanese implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get today's date in short format.
 */
class InputMacroDateTodayShort implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_SHORT";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("L");
  }
}

/**
 * Macro to get yesterday's date in short format.
 */
class InputMacroDateYesterdayShort implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_SHORT";
  }

  get replacement() {
    const day = dayjs().subtract(1, "day");
    return day.locale("zh-tw").format("L");
  }
}

/**
 * Macro to get tomorrow's date in short format.
 */
class InputMacroDateTomorrowShort implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_SHORT";
  }

  get replacement() {
    const day = dayjs().add(1, "day");
    return day.locale("zh-tw").format("L");
  }
}

/**
 * Macro to get today's date in medium format.
 */
class InputMacroDateTodayMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("LL");
  }
}

/**
 * Macro to get yesterday's date in medium format.
 */
class InputMacroDateYesterdayMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM";
  }

  get replacement() {
    const day = dayjs().subtract(1, "day");
    return day.locale("zh-tw").format("LL");
  }
}

/**
 * Macro to get tomorrow's date in medium format.
 */
class InputMacroDateTomorrowMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM";
  }

  get replacement() {
    const day = dayjs().add(1, "day");
    return day.locale("zh-tw").format("LL");
  }
}

/**
 * Macro to get today's date in medium ROC format.
 */
class InputMacroDateTodayMediumRoc implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM_ROC";
  }

  get replacement() {
    const day = dayjs().subtract(1911, "year");
    return "民國" + day.year() + "年" + day.locale("zh-tw").format("M月D日");
  }
}

/**
 * Macro to get yesterday's date in medium ROC format.
 */
class InputMacroDateYesterdayMediumRoc implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM_ROC";
  }

  get replacement() {
    const day = dayjs().subtract(1, "day").subtract(1911, "year");
    return "民國" + day.year() + "年" + day.locale("zh-tw").format("M月D日");
  }
}

/**
 * Macro to get tomorrow's date in medium ROC format.
 */
class InputMacroDateTomorrowMediumRoc implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM_ROC";
  }

  get replacement() {
    const day = dayjs().add(1, "day").subtract(1911, "year");
    return "民國" + day.year() + "年" + day.locale("zh-tw").format("M月D日");
  }
}

/**
 * Macro to get today's date in medium Chinese format (not supported yet).
 */
class InputMacroDateTodayMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get today's date in medium Japanese format.
 */
class InputMacroDateTodayMediumJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get yesterday's date in medium Chinese format (not supported yet).
 */
class InputMacroDateYesterdayMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get tomorrow's date in medium Chinese format (not supported yet).
 */
class InputMacroDateTomorrowMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get tomorrow's date in medium Japanese format (not supported yet).
 */
class InputMacroDateTomorrowMediumJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get yesterday's date in medium Japanese format (not supported yet).
 */
class InputMacroDateYesterdayMediumJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get tomorrow's date in full Japanese format (not supported yet).
 */
class InputMacroDateTomorrowFullJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_FULL_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get the current time in short format.
 */
class InputMacroDateTimeNowShort implements InputMacro {
  get name() {
    return "MACRO@TIME_NOW_SHORT";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("LT");
  }
}

/**
 * Macro to get the current time in medium format.
 */
class InputMacroDateTimeNowMedium implements InputMacro {
  get name() {
    return "MACRO@TIME_NOW_MEDIUM";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("LTS");
  }
}

/**
 * Macro to get the standard time zone (not supported yet).
 */
class InputMacroTimeZoneStandard implements InputMacro {
  get name() {
    return "MACRO@TIMEZONE_STANDARD";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get the short generic time zone (not supported yet).
 */
class InputMacroTimeZoneShortGeneric implements InputMacro {
  get name() {
    return "MACRO@TIMEZONE_GENERIC_SHORT";
  }

  get replacement() {
    return "";
  }
}

// Ganzhi

function getYearBase(year: number): [number, number] {
  const base: number = year < 4 ? 60 - ((year * -1 + 2) % 60) : (year - 3) % 60;
  return [base % 10, base % 12];
}

function ganzhi(year: number): string {
  const gan: string[] = [
    ...["癸", "甲", "乙", "丙", "丁"],
    ...["戊", "己", "庚", "辛", "壬"],
  ];
  const zhi: string[] = [
    ...["亥", "子", "丑", "寅", "卯", "辰"],
    ...["巳", "午", "未", "申", "酉", "戌"],
  ];
  const [ganBase, zhiBase] = getYearBase(year);
  return gan[ganBase] + zhi[zhiBase] + "年";
}

function chineseZodiac(year: number): string {
  const gan = [
    ...["水", "木", "木", "火", "火"],
    ...["土", "土", "金", "金", "水"],
  ];
  const zhi = [
    ...["豬", "鼠", "牛", "虎", "兔", "龍"],
    ...["蛇", "馬", "羊", "猴", "雞", "狗"],
  ];
  const [ganBase, zhiBase] = getYearBase(year);
  return gan[ganBase] + zhi[zhiBase] + "年";
}

/**
 * Macro to get the current year in Ganzhi format.
 */
class InputMacroThisYearGanZhi implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_GANZHI";
  }

  get replacement() {
    return ganzhi(dayjs().year());
  }
}

/**
 * Macro to get the previous year in Ganzhi format.
 */
class InputMacroLastYearGanZhi implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_GANZHI";
  }

  get replacement() {
    return ganzhi(dayjs().subtract(1, "year").year());
  }
}

/**
 * Macro to get the next year in Ganzhi format.
 */
class InputMacroNextYearGanZhi implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_GANZHI";
  }

  get replacement() {
    return ganzhi(dayjs().add(1, "year").year());
  }
}

/**
 * Macro to get the current year in Chinese Zodiac format.
 */
class InputMacroThisYearChineseZodiac implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_CHINESE_ZODIAC";
  }

  get replacement() {
    return chineseZodiac(dayjs().year());
  }
}

/**
 * Macro to get the previous year in Chinese Zodiac format.
 */
class InputMacroLastYearChineseZodiac implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_CHINESE_ZODIAC";
  }

  get replacement() {
    return chineseZodiac(dayjs().subtract(1, "year").year());
  }
}

/**
 * Macro to get the next year in Chinese Zodiac format.
 */
class InputMacroNextYearChineseZodiac implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_CHINESE_ZODIAC";
  }

  get replacement() {
    return chineseZodiac(dayjs().subtract(1, "year").year());
  }
}

/**
 * Macro to get today's weekday in short format.
 */
class InputMacroWeekdayTodayShort implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_WEEKDAY_SHORT";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("ddd");
  }
}

/**
 * Macro to get today's weekday in full format.
 */
class InputMacroWeekdayToday implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_WEEKDAY";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("dddd");
  }
}

/**
 * Macro to get today's weekday in an alternative format (not supported yet).
 */
class InputMacroWeekdayToday2 implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY2_WEEKDAY";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get today's weekday in Japanese format.
 */
class InputMacroWeekdayTodayJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_WEEKDAY_JAPANESE";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("ja").format("dddd");
  }
}

/**
 * Macro to get yesterday's weekday in short format.
 */
class InputMacroWeekdayYesterdayShort implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_WEEKDAY_SHORT";
  }

  get replacement() {
    const day = dayjs();
    return day.subtract(1, "day").locale("zh-tw").format("ddd");
  }
}

/**
 * Macro to get yesterday's weekday in full format.
 */
class InputMacroWeekdayYesterday implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_WEEKDAY";
  }

  get replacement() {
    const day = dayjs();
    return day.subtract(1, "day").locale("zh-tw").format("dddd");
  }
}

/**
 * Macro to get yesterday's weekday in an alternative format (not supported yet).
 */
class InputMacroWeekdayYesterday2 implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY2_WEEKDAY";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get yesterday's weekday in Japanese format.
 */
class InputMacroWeekdayYesterdayJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_WEEKDAY_JAPANESE";
  }

  get replacement() {
    const day = dayjs();
    return day.subtract(1, "day").locale("ja").format("dddd");
  }
}

/**
 * Macro to get tomorrow's weekday in short format.
 */
class InputMacroWeekdayTomorrowShort implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_WEEKDAY_SHORT";
  }

  get replacement() {
    const day = dayjs();
    return day.add(1, "day").locale("zh-tw").format("ddd");
  }
}

/**
 * Macro to get tomorrow's weekday in full format.
 */
class InputMacroWeekdayTomorrow implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_WEEKDAY";
  }

  get replacement() {
    const day = dayjs();
    return day.add(1, "day").locale("zh-tw").format("dddd");
  }
}

/**
 * Macro to get tomorrow's weekday in an alternative format (not supported yet).
 */
class InputMacroWeekdayTomorrow2 implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW2_WEEKDAY";
  }

  get replacement() {
    return "";
  }
}

/**
 * Macro to get tomorrow's weekday in Japanese format.
 */
class InputMacroWeekdayTomorrowJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_WEEKDAY_JAPANESE";
  }

  get replacement() {
    const day = dayjs();
    return day.add(1, "day").locale("ja").format("dddd");
  }
}

/**
 * Helps to convert the input macros.
 */
class InputMacroController {
  private macroMap = new Map<string, InputMacro>();
  constructor() {
    require("dayjs/locale/zh-tw");
    require("dayjs/locale/ja");
    var localizedFormat = require("dayjs/plugin/localizedFormat");
    dayjs.extend(localizedFormat);

    const macros: InputMacro[] = [
      new InputMacroDateTodayShort(),
      new InputMacroDateTodayMedium(),
      new InputMacroDateTodayMediumRoc(),
      new InputMacroDateTodayMediumChinese(),
      new InputMacroDateTodayMediumJapanese(),
      new InputMacroThisYearPlain(),
      new InputMacroThisYearPlainWithEra(),
      new InputMacroThisYearRoc(),
      new InputMacroThisYearJapanese(),
      new InputMacroLastYearPlain(),
      new InputMacroLastYearPlainWithEra(),
      new InputMacroLastYearRoc(),
      new InputMacroLastYearJapanese(),
      new InputMacroNextYearPlain(),
      new InputMacroNextYearPlainWithEra(),
      new InputMacroNextYearRoc(),
      new InputMacroNextYearJapanese(),
      new InputMacroWeekdayTodayShort(),
      new InputMacroWeekdayToday(),
      new InputMacroWeekdayToday2(),
      new InputMacroWeekdayTodayJapanese(),
      new InputMacroWeekdayYesterdayShort(),
      new InputMacroWeekdayYesterday(),
      new InputMacroWeekdayYesterday2(),
      new InputMacroWeekdayYesterdayJapanese(),
      new InputMacroWeekdayTomorrowShort(),
      new InputMacroWeekdayTomorrow(),
      new InputMacroWeekdayTomorrow2(),
      new InputMacroWeekdayTomorrowJapanese(),
      new InputMacroDateYesterdayShort(),
      new InputMacroDateYesterdayMedium(),
      new InputMacroDateYesterdayMediumRoc(),
      new InputMacroDateYesterdayMediumChinese(),
      new InputMacroDateYesterdayMediumJapanese(),
      new InputMacroDateTomorrowShort(),
      new InputMacroDateTomorrowMedium(),
      new InputMacroDateTomorrowMediumRoc(),
      new InputMacroDateTomorrowMediumChinese(),
      new InputMacroDateTomorrowMediumJapanese(),
      new InputMacroDateTimeNowShort(),
      new InputMacroDateTimeNowMedium(),
      new InputMacroTimeZoneStandard(),
      new InputMacroTimeZoneShortGeneric(),
      new InputMacroThisYearGanZhi(),
      new InputMacroLastYearGanZhi(),
      new InputMacroNextYearGanZhi(),
      new InputMacroThisYearChineseZodiac(),
      new InputMacroLastYearChineseZodiac(),
      new InputMacroNextYearChineseZodiac(),
    ];
    for (const macro of macros) {
      this.macroMap.set(macro.name, macro);
    }
  }

  /**
   * Handles the input text.
   * @param input The input text.
   * @returns The converted text.
   */
  public handle(input: string) {
    const macro = this.macroMap.get(input);
    if (macro) {
      return macro.replacement;
    }
    return input;
  }
}

/**
 * The singleton instance of InputMacroController.
 */
export var inputMacroController = new InputMacroController();
