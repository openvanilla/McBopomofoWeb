abstract class InputMacro {
  abstract get name(): string;
  abstract get replacement(): string;
}

class InputMacroThisYear implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR";
  }

  get replacement() {
    return "";
  }
}

class InputMacroThisYearROC implements InputMacro {
  get name() {
    return "MACRO@THIS_YEAR_ROC";
  }

  get replacement() {
    return "";
  }
}

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
    return "";
  }
}

class InputMacroLastYearROC implements InputMacro {
  get name() {
    return "MACRO@LAST_YEAR_ROC";
  }

  get replacement() {
    return "";
  }
}

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
    return "";
  }
}

class InputMacroNextYearROC implements InputMacro {
  get name() {
    return "MACRO@NEXT_YEAR_ROC";
  }

  get replacement() {
    return "";
  }
}

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
    return "";
  }
}

class InputMacroDateYesterdayShort implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_SHORT";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTomorrowShort implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_SHORT";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTodayMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateYesterdayMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTomorrowMedium implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTodayMediumROC implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM_ROC";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateYesterdayMediumROC implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM_ROC";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTomorrowMediumROC implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM_ROC";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTodayMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateYesterdayMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTomorrowMediumChinese implements InputMacro {
  get name() {
    return "MACRO@DATE_TOMORROW_MEDIUM_CHINESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateTodayFullJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_TODAY_FULL_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

class InputMacroDateYesterdayFullJapanese implements InputMacro {
  get name() {
    return "MACRO@DATE_YESTERDAY_FULL_JAPANESE";
  }

  get replacement() {
    return "";
  }
}

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
    return "";
  }
}

class InputMacroTimeNowMedium implements InputMacro {
  get name() {
    return "MACRO@TIME_NOW_MEDIUM";
  }

  get replacement() {
    return "";
  }
}

class InputMacroTimeZoneStandard implements InputMacro {
  get name() {
    return "MACRO@TIMEZONE_STANDARD";
  }

  get replacement() {
    return "";
  }
}

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

class InputMacroController {
  private macroMap = new Map<string, InputMacro>();
  constructor() {
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

  public handle(input: string) {
    let macro = this.macroMap.get(input);
    if (macro) {
      return macro.replacement;
    }
    return input;
  }
}

export var inputMacroController = new InputMacroController();
