/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";

abstract class InputMacro {
  abstract get name(): string;
  abstract get replacement(): string;
}

class InputMacroThisYear implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("YYYY年");
  }
}

class InputMacroThisYearROC implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_ROC";
  }

  get replacement() {
    const day = dayjs().subtract(1911, "year");
    return day.locale("zh-tw").format("民國YYY年");
  }
}

// note: not supported yet.
class InputMacroThisYearJapanese implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroLastYear implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR";
  }

  get replacement() {
    const day = dayjs().subtract(1, "year");
    return day.locale("zh-tw").format("YYYY年");
  }
}

class InputMacroLastYearROC implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_ROC";
  }

  get replacement() {
    const day = dayjs().subtract(1, "year").subtract(1911, "year");
    return day.locale("zh-tw").format("民國YYY年");
  }
}

// note: not supported yet.
class InputMacroLastYearJapanese implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroNextYear implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR";
  }

  get replacement() {
    const day = dayjs().add(1, "year");
    return day.locale("zh-tw").format("YYYY年");
  }
}

class InputMacroNextYearROC implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_ROC";
  }

  get replacement() {
    const day = dayjs().add(1, "year").subtract(1911, "year");
    return day.locale("zh-tw").format("民國YYY年");
  }
}

// note: not supported yet.
class InputMacroNextYearJapanese implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTodayShort implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_SHORT";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("L");
  }
}

class InputMacroDateYesterdayShort implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_SHORT";
  }

  get replacement() {
    const day = dayjs().subtract(1, "day");
    return day.locale("zh-tw").format("L");
  }
}

class InputMacroDateTomorrowShort implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_SHORT";
  }

  get replacement() {
    const day = dayjs().add(1, "day");
    return day.locale("zh-tw").format("L");
  }
}

class InputMacroDateTodayMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("LL");
  }
}

class InputMacroDateYesterdayMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM";
  }

  get replacement() {
    const day = dayjs().subtract(1, "day");
    return day.locale("zh-tw").format("LL");
  }
}

class InputMacroDateTomorrowMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM";
  }

  get replacement() {
    const day = dayjs().add(1, "day");
    return day.locale("zh-tw").format("LL");
  }
}

class InputMacroDateTodayMediumROC implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM_ROC";
  }

  get replacement() {
    const day = dayjs().subtract(1911, "year");
    return day.locale("zh-tw").format("民國YYY年M月D日");
  }
}

class InputMacroDateYesterdayMediumROC implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM_ROC";
  }

  get replacement() {
    const day = dayjs().subtract(1, "day").subtract(1911, "year");
    return day.locale("zh-tw").format("民國YYY年M月D日");
  }
}

class InputMacroDateTomorrowMediumROC implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM_ROC";
  }

  get replacement() {
    const day = dayjs().add(1, "day").subtract(1911, "year");
    return day.locale("zh-tw").format("民國YYY年M月D日");
  }
}

// Note: not supported yet.
class InputMacroDateTodayMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

// Note: not supported yet.
class InputMacroDateYesterdayMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

// Note: not supported yet.
class InputMacroDateTomorrowMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

// Note: not supported yet.
class InputMacroDateTodayFullJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_FULL_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

// Note: not supported yet.
class InputMacroDateYesterdayFullJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_FULL_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

// Note: not supported yet.
class InputMacroDateTomorrowFullJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_FULL_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroTimeNowShort implements InputMacro {
  get name() {
    return "MACRO@TIME_NOW_SHORT";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("LT");
  }
}

class InputMacroTimeNowMedium implements InputMacro {
  get name() {
    return "MACRO@TIME_NOW_MEDIUM";
  }

  get replacement() {
    const day = dayjs();
    return day.locale("zh-tw").format("LTS");
  }
}

// note: not supported yet.
class InputMacroTimeZoneStandard implements InputMacro {
  get name() {
    return "MACRO@TIMEZONE_STANDARD";
  }

  get replacement() {
    return "";
  }
}

// note: not supported yet.
class InputMacroTimeZoneShortGeneric implements InputMacro {
  get name() {
    return "MACRO@TIMEZONE_GENERIC_SHORT";
  }

  get replacement() {
    return "";
  }
}

class InputMacroThisYearGanZhi implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_GANZHI";
  }

  get replacement() {
    return "";
  }
}

class InputMacroLastYearGanZhi implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_GANZHI";
  }

  get replacement() {
    return "";
  }
}

class InputMacroNextYearGanZhi implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_GANZHI";
  }

  get replacement() {
    return "";
  }
}

class InputMacroThisYearChineseZodiac implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_CHINESE_ZODIAC";
  }

  get replacement() {
    return "";
  }
}

class InputMacroLastYearChineseZodiac implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_CHINESE_ZODIAC";
  }

  get replacement() {
    return "";
  }
}

class InputMacroNextYearChineseZodiac implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_CHINESE_ZODIAC";
  }

  get replacement() {
    return "";
  }
}

/**
 * Helps to convert the input macros.
 */
class InputMacroController {
  private macroMap = new Map<string, InputMacro>();
  constructor() {
    require("dayjs/locale/zh-tw");
    var localizedFormat = require("dayjs/plugin/localizedFormat");
    dayjs.extend(localizedFormat);

    let macros: InputMacro[] = [
      new InputMacroThisYear(),
      new InputMacroThisYearROC(),
      new InputMacroThisYearJapanese(),
      new InputMacroLastYear(),
      new InputMacroLastYearROC(),
      new InputMacroLastYearJapanese(),
      new InputMacroNextYear(),
      new InputMacroNextYearROC(),
      new InputMacroNextYearJapanese(),
      new InputMacroDateTodayShort(),
      new InputMacroDateYesterdayShort(),
      new InputMacroDateTomorrowShort(),
      new InputMacroDateTodayMedium(),
      new InputMacroDateYesterdayMedium(),
      new InputMacroDateTomorrowMedium(),
      new InputMacroDateTodayMediumROC(),
      new InputMacroDateYesterdayMediumROC(),
      new InputMacroDateTomorrowMediumROC(),
      new InputMacroDateTodayMediumChinese(),
      new InputMacroDateYesterdayMediumChinese(),
      new InputMacroDateTomorrowMediumChinese(),
      new InputMacroDateTodayFullJapanese(),
      new InputMacroDateYesterdayFullJapanese(),
      new InputMacroDateTomorrowFullJapanese(),
      new InputMacroTimeNowShort(),
      new InputMacroTimeNowMedium(),
      new InputMacroTimeZoneStandard(),
      new InputMacroTimeZoneShortGeneric(),
      new InputMacroThisYearGanZhi(),
      new InputMacroLastYearGanZhi(),
      new InputMacroNextYearGanZhi(),
      new InputMacroThisYearChineseZodiac(),
      new InputMacroLastYearChineseZodiac(),
      new InputMacroNextYearChineseZodiac(),
    ];
    for (let macro of macros) {
      this.macroMap.set(macro.name, macro);
    }
  }

  /**
   * Handles the input text.
   * @param input The input text.
   * @returns The converted text.
   */
  public handle(input: string) {
    let macro = this.macroMap.get(input);
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
