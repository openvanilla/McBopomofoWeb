/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import {
  InputState,
  Empty,
  EmptyIgnoringPrevious,
  Committing,
  NotEmpty,
  Inputting,
  ChoosingCandidate,
  Marking,
  SelectingDictionary,
  ChineseNumber,
  ChineseNumbersStateStyle,
  Big5,
  EnclosingNumber,
  SelectingDateMacro,
  Feature,
  SelectingFeature,
  CustomMenuEntry,
  CustomMenu,
  RomanNumber,
  RomanNumberStateStyle,
} from "./InputState";
import { Candidate } from "../Gramambular2";

describe("InputState classes", () => {
  describe("Empty", () => {
    it("creates empty state", () => {
      const empty = new Empty();
      expect(empty).toBeInstanceOf(Empty);
      expect(empty).toBeInstanceOf(Object);
    });

    it("has correct toString", () => {
      const empty = new Empty();
      expect(empty.toString()).toBe("Empty");
    });
  });

  describe("EmptyIgnoringPrevious", () => {
    it("creates empty ignoring previous state", () => {
      const empty = new EmptyIgnoringPrevious();
      expect(empty).toBeInstanceOf(EmptyIgnoringPrevious);
      expect(empty).toBeInstanceOf(Object);
    });

    it("has correct toString", () => {
      const empty = new EmptyIgnoringPrevious();
      expect(empty.toString()).toBe("EmptyIgnoringPrevious");
    });
  });

  describe("Committing", () => {
    it("creates committing state with text", () => {
      const text = "測試文字";
      const committing = new Committing(text);
      expect(committing).toBeInstanceOf(Committing);
      expect(committing.text).toBe(text);
    });

    it("has correct toString", () => {
      const text = "測試";
      const committing = new Committing(text);
      expect(committing.toString()).toBe("Committing 測試");
    });

    it("handles empty text", () => {
      const committing = new Committing("");
      expect(committing.text).toBe("");
      expect(committing.toString()).toBe("Committing ");
    });

    it("handles special characters", () => {
      const text = "Hello! @#$%^&*()";
      const committing = new Committing(text);
      expect(committing.text).toBe(text);
    });
  });

  describe("NotEmpty", () => {
    it("creates not empty state with required parameters", () => {
      const buffer = "測試";
      const index = 2;
      const notEmpty = new NotEmpty(buffer, index);

      expect(notEmpty).toBeInstanceOf(NotEmpty);
      expect(notEmpty.composingBuffer).toBe(buffer);
      expect(notEmpty.cursorIndex).toBe(index);
      expect(notEmpty.tooltip).toBe("");
    });

    it("creates not empty state with tooltip", () => {
      const buffer = "測試";
      const index = 1;
      const tooltip = "測試提示";
      const notEmpty = new NotEmpty(buffer, index, tooltip);

      expect(notEmpty.composingBuffer).toBe(buffer);
      expect(notEmpty.cursorIndex).toBe(index);
      expect(notEmpty.tooltip).toBe(tooltip);
    });

    it("has correct toString", () => {
      const notEmpty = new NotEmpty("test", 1);
      expect(notEmpty.toString()).toBe("NotEmpty");
    });

    it("handles zero cursor index", () => {
      const notEmpty = new NotEmpty("test", 0);
      expect(notEmpty.cursorIndex).toBe(0);
    });
  });

  describe("Inputting", () => {
    it("creates inputting state", () => {
      const buffer = "輸入中";
      const index = 3;
      const inputting = new Inputting(buffer, index);

      expect(inputting).toBeInstanceOf(Inputting);
      expect(inputting).toBeInstanceOf(NotEmpty);
      expect(inputting.composingBuffer).toBe(buffer);
      expect(inputting.cursorIndex).toBe(index);
    });

    it("creates inputting state with tooltip", () => {
      const buffer = "輸入中";
      const index = 2;
      const tooltip = "輸入提示";
      const inputting = new Inputting(buffer, index, tooltip);

      expect(inputting.tooltip).toBe(tooltip);
    });

    it("has correct toString", () => {
      const inputting = new Inputting("測試", 1, "提示");
      expect(inputting.toString()).toBe("Inputting 測試 tooltip:提示");
    });

    it("handles empty tooltip in toString", () => {
      const inputting = new Inputting("測試", 1);
      expect(inputting.toString()).toBe("Inputting 測試 tooltip:");
    });
  });

  describe("ChoosingCandidate", () => {
    const mockCandidates = [
      new Candidate("test1", "測試1", "測試1"),
      new Candidate("test2", "測試2", "測試2"),
    ];

    it("creates choosing candidate state", () => {
      const buffer = "選擇候選";
      const index = 2;
      const originalIndex = 1;
      const choosing = new ChoosingCandidate(
        buffer,
        index,
        mockCandidates,
        originalIndex
      );

      expect(choosing).toBeInstanceOf(ChoosingCandidate);
      expect(choosing).toBeInstanceOf(NotEmpty);
      expect(choosing.composingBuffer).toBe(buffer);
      expect(choosing.cursorIndex).toBe(index);
      expect(choosing.candidates).toBe(mockCandidates);
      expect(choosing.originalCursorIndex).toBe(originalIndex);
    });

    it("handles empty candidates", () => {
      const choosing = new ChoosingCandidate("test", 1, [], 0);
      expect(choosing.candidates).toEqual([]);
    });

    it("has correct toString", () => {
      const choosing = new ChoosingCandidate("test", 1, mockCandidates, 0);
      expect(choosing.toString()).toContain("ChoosingCandidate");
    });
  });

  describe("Marking", () => {
    it("creates marking state with all parameters", () => {
      const buffer = "標記文字";
      const index = 2;
      const tooltip = "標記提示";
      const startIndex = 0;
      const head = "前";
      const marked = "標記";
      const tail = "後";
      const reading = "ㄅㄧㄠ-ㄐㄧˋ";
      const acceptable = true;

      const marking = new Marking(
        buffer,
        index,
        tooltip,
        startIndex,
        head,
        marked,
        tail,
        reading,
        acceptable
      );

      expect(marking).toBeInstanceOf(Marking);
      expect(marking).toBeInstanceOf(NotEmpty);
      expect(marking.composingBuffer).toBe(buffer);
      expect(marking.cursorIndex).toBe(index);
      expect(marking.tooltip).toBe(tooltip);
      expect(marking.markStartGridCursorIndex).toBe(startIndex);
      expect(marking.head).toBe(head);
      expect(marking.markedText).toBe(marked);
      expect(marking.tail).toBe(tail);
      expect(marking.reading).toBe(reading);
      expect(marking.acceptable).toBe(acceptable);
    });

    it("creates marking state with false acceptable", () => {
      const marking = new Marking(
        "test",
        1,
        "",
        0,
        "",
        "mark",
        "",
        "reading",
        false
      );
      expect(marking.acceptable).toBe(false);
    });

    it("has correct toString", () => {
      const marking = new Marking("test", 3, "", 1, "", "", "", "", true);
      expect(marking.toString()).toBe("Marking 13");
    });
  });

  describe("SelectingDictionary", () => {
    it("creates selecting dictionary state", () => {
      const previousState = new Inputting("前狀態", 2, "提示");
      const phrase = "選擇詞彙";
      const index = 1;
      const menu = ["字典1", "字典2", "字典3"];

      const selecting = new SelectingDictionary(
        previousState,
        phrase,
        index,
        menu
      );

      expect(selecting).toBeInstanceOf(SelectingDictionary);
      expect(selecting).toBeInstanceOf(NotEmpty);
      expect(selecting.previousState).toBe(previousState);
      expect(selecting.selectedPrase).toBe(phrase);
      expect(selecting.selectedIndex).toBe(index);
      expect(selecting.menu).toBe(menu);

      // Should inherit from previous state
      expect(selecting.composingBuffer).toBe(previousState.composingBuffer);
      expect(selecting.cursorIndex).toBe(previousState.cursorIndex);
      expect(selecting.tooltip).toBe(previousState.tooltip);
    });

    it("handles empty menu", () => {
      const previousState = new NotEmpty("test", 1);
      const selecting = new SelectingDictionary(previousState, "phrase", 0, []);
      expect(selecting.menu).toEqual([]);
    });
  });

  describe("ChineseNumberStyle enum", () => {
    it("has correct enum values", () => {
      expect(ChineseNumbersStateStyle.Lowercase).toBe(0);
      expect(ChineseNumbersStateStyle.Uppercase).toBe(1);
      expect(ChineseNumbersStateStyle.Suzhou).toBe(2);
    });
  });

  describe("ChineseNumber", () => {
    it("creates chinese number state", () => {
      const number = "123";
      const style = ChineseNumbersStateStyle.Lowercase;
      const chineseNumber = new ChineseNumber(number, style);

      expect(chineseNumber).toBeInstanceOf(ChineseNumber);
      expect(chineseNumber.number).toBe(number);
      expect(chineseNumber.style).toBe(style);
    });

    it("has correct composing buffer for lowercase style", () => {
      const chineseNumber = new ChineseNumber(
        "123",
        ChineseNumbersStateStyle.Lowercase
      );
      expect(chineseNumber.composingBuffer).toBe("[中文數字] 123");
    });

    it("has correct composing buffer for uppercase style", () => {
      const chineseNumber = new ChineseNumber(
        "456",
        ChineseNumbersStateStyle.Uppercase
      );
      expect(chineseNumber.composingBuffer).toBe("[大寫數字] 456");
    });

    it("has correct composing buffer for Suzhou style", () => {
      const chineseNumber = new ChineseNumber(
        "789",
        ChineseNumbersStateStyle.Suzhou
      );
      expect(chineseNumber.composingBuffer).toBe("[蘇州碼] 789");
    });

    it("handles empty number", () => {
      const chineseNumber = new ChineseNumber(
        "",
        ChineseNumbersStateStyle.Lowercase
      );
      expect(chineseNumber.composingBuffer).toBe("[中文數字] ");
    });
  });

  describe("Big5", () => {
    it("creates Big5 state with default empty code", () => {
      const big5 = new Big5();
      expect(big5).toBeInstanceOf(Big5);
      expect(big5.code).toBe("");
    });

    it("creates Big5 state with code", () => {
      const code = "A440";
      const big5 = new Big5(code);
      expect(big5.code).toBe(code);
    });

    it("has correct composing buffer", () => {
      const big5 = new Big5("A440");
      expect(big5.composingBuffer).toBe("[內碼] A440");
    });

    it("handles empty code in composing buffer", () => {
      const big5 = new Big5();
      expect(big5.composingBuffer).toBe("[內碼] ");
    });
  });

  describe("EnclosingNumber", () => {
    it("creates enclosing number state with default empty number", () => {
      const enclosing = new EnclosingNumber();
      expect(enclosing).toBeInstanceOf(EnclosingNumber);
      expect(enclosing.number).toBe("");
    });

    it("creates enclosing number state with number", () => {
      const number = "123";
      const enclosing = new EnclosingNumber(number);
      expect(enclosing.number).toBe(number);
    });

    it("has correct composing buffer", () => {
      const enclosing = new EnclosingNumber("123");
      expect(enclosing.composingBuffer).toBe("[標題數字] 123");
    });

    it("handles empty number in composing buffer", () => {
      const enclosing = new EnclosingNumber();
      expect(enclosing.composingBuffer).toBe("[標題數字] ");
    });
  });

  describe("SelectingDateMacro", () => {
    const mockConverter = jest.fn((input: string) => {
      const conversions: { [key: string]: string } = {
        "MACRO@DATE_TODAY_SHORT": "2025/7/14",
        "MACRO@DATE_TODAY_MEDIUM": "2025年7月14日",
        "MACRO@TIME_NOW_SHORT": "14:30",
      };
      return conversions[input] || "";
    });

    it("creates selecting date macro state", () => {
      const selecting = new SelectingDateMacro(mockConverter);
      expect(selecting).toBeInstanceOf(SelectingDateMacro);
      expect(selecting.menu).toBeInstanceOf(Array);
    });

    it("has static macros array", () => {
      expect(SelectingDateMacro.macros).toBeInstanceOf(Array);
      expect(SelectingDateMacro.macros.length).toBeGreaterThan(0);
      expect(SelectingDateMacro.macros).toContain("MACRO@DATE_TODAY_SHORT");
    });

    it("converts macros using converter", () => {
      const selecting = new SelectingDateMacro(mockConverter);
      expect(selecting.menu).toContain("2025/7/14");
      expect(selecting.menu).toContain("2025年7月14日");
      expect(selecting.menu).toContain("14:30");
    });

    it("filters out empty conversions", () => {
      const limitedConverter = (input: string) => {
        return input === "MACRO@DATE_TODAY_SHORT" ? "2025/7/14" : "";
      };
      const selecting = new SelectingDateMacro(limitedConverter);
      // Should only include non-empty results
      expect(selecting.menu).toContain("2025/7/14");
      expect(selecting.menu.length).toBe(1);
    });
  });

  describe("Feature", () => {
    it("creates feature with name and next state function", () => {
      const name = "測試功能";
      const nextState = () => new Empty();
      const feature = new Feature(name, nextState);

      expect(feature).toBeInstanceOf(Feature);
      expect(feature.name).toBe(name);
      expect(feature.nextState).toBe(nextState);
    });

    it("has correct toString", () => {
      const feature = new Feature("功能名稱", () => new Empty());
      expect(feature.toString()).toBe("功能名稱");
    });

    it("executes next state function", () => {
      const mockNextState = jest.fn(() => new Committing("test"));
      const feature = new Feature("test", mockNextState);

      const result = feature.nextState();
      expect(mockNextState).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Committing);
    });
  });

  describe("SelectingFeature", () => {
    const mockConverter = jest.fn((input: string) => input + "_converted");

    it("creates selecting feature state", () => {
      const selecting = new SelectingFeature(mockConverter);
      expect(selecting).toBeInstanceOf(SelectingFeature);
      expect(selecting.converter).toBe(mockConverter);
      expect(selecting.features).toBeInstanceOf(Array);
    });

    it("has predefined features", () => {
      const selecting = new SelectingFeature(mockConverter);
      expect(selecting.features.length).toBeGreaterThan(0);

      const featureNames = selecting.features.map((f) => f.name);
      expect(featureNames).toContain("日期與時間");
      expect(featureNames).toContain("標題數字");
      expect(featureNames).toContain("中文數字");
      expect(featureNames).toContain("大寫數字");
      expect(featureNames).toContain("蘇州碼");
    });

    it("creates correct next states for features", () => {
      const selecting = new SelectingFeature(mockConverter);

      // Find specific features and test their next states
      const dateFeature = selecting.features.find(
        (f) => f.name === "日期與時間"
      );
      const numberFeature = selecting.features.find(
        (f) => f.name === "標題數字"
      );
      const chineseFeature = selecting.features.find(
        (f) => f.name === "中文數字"
      );

      expect(dateFeature?.nextState()).toBeInstanceOf(SelectingDateMacro);
      expect(numberFeature?.nextState()).toBeInstanceOf(EnclosingNumber);
      expect(chineseFeature?.nextState()).toBeInstanceOf(ChineseNumber);
    });

    it("includes Big5 feature when TextDecoder supports it", () => {
      // This test depends on the environment supporting Big5
      const selecting = new SelectingFeature(mockConverter);
      const featureNames = selecting.features.map((f) => f.name);

      // Check if Big5 is available (may vary by environment)
      const hasBig5 = featureNames.includes("Big5 內碼輸入");
      if (hasBig5) {
        const big5Feature = selecting.features.find(
          (f) => f.name === "Big5 內碼輸入"
        );
        expect(big5Feature?.nextState()).toBeInstanceOf(Big5);
      }
    });
  });

  describe("CustomMenuEntry", () => {
    it("creates custom menu entry", () => {
      const title = "選單項目";
      const callback = jest.fn();
      const entry = new CustomMenuEntry(title, callback);

      expect(entry).toBeInstanceOf(CustomMenuEntry);
      expect(entry.title).toBe(title);
      expect(entry.callback).toBe(callback);
    });

    it("executes callback", () => {
      const callback = jest.fn();
      const entry = new CustomMenuEntry("test", callback);

      entry.callback();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("CustomMenu", () => {
    const mockEntries = [
      new CustomMenuEntry("項目1", () => {}),
      new CustomMenuEntry("項目2", () => {}),
    ];

    it("creates custom menu state", () => {
      const buffer = "自定義選單";
      const index = 2;
      const title = "選單標題";
      const menu = new CustomMenu(buffer, index, title, mockEntries);

      expect(menu).toBeInstanceOf(CustomMenu);
      expect(menu).toBeInstanceOf(NotEmpty);
      expect(menu.composingBuffer).toBe(buffer);
      expect(menu.cursorIndex).toBe(index);
      expect(menu.tooltip).toBe(title);
      expect(menu.entries).toBe(mockEntries);
    });

    it("has correct toString", () => {
      const menu = new CustomMenu("test", 1, "選單標題", mockEntries);
      expect(menu.toString()).toBe("CustomMenuEntry 選單標題");
    });

    it("handles empty entries", () => {
      const menu = new CustomMenu("test", 1, "title", []);
      expect(menu.entries).toEqual([]);
    });
  });

  describe("RomanNumberStyle enum", () => {
    it("has correct enum values", () => {
      expect(RomanNumberStateStyle.Alphabets).toBe(0);
      expect(RomanNumberStateStyle.FullWidthUpper).toBe(1);
      expect(RomanNumberStateStyle.FullWidthLower).toBe(2);
    });
  });

  describe("RomanNumber", () => {
    it("creates roman number state", () => {
      const number = "XII";
      const style = RomanNumberStateStyle.Alphabets;
      const romanNumber = new RomanNumber(number, style);

      expect(romanNumber).toBeInstanceOf(RomanNumber);
      expect(romanNumber.number).toBe(number);
      expect(romanNumber.style).toBe(style);
    });

    it("has correct composing buffer for Alphabets style", () => {
      const romanNumber = new RomanNumber(
        "XV",
        RomanNumberStateStyle.Alphabets
      );
      expect(romanNumber.composingBuffer).toBe("[羅馬數字 (字母)] XV");
    });

    it("has correct composing buffer for FullWidthUpper style", () => {
      const romanNumber = new RomanNumber(
        "XX",
        RomanNumberStateStyle.FullWidthUpper
      );
      expect(romanNumber.composingBuffer).toBe("[羅馬數字 (全形大寫)] XX");
    });

    it("has correct composing buffer for FullWidthLower style", () => {
      const romanNumber = new RomanNumber(
        "IX",
        RomanNumberStateStyle.FullWidthLower
      );
      expect(romanNumber.composingBuffer).toBe("[羅馬數字 (全形小寫)] IX");
    });

    it("handles empty number", () => {
      const romanNumber = new RomanNumber("", RomanNumberStateStyle.Alphabets);
      expect(romanNumber.composingBuffer).toBe("[羅馬數字 (字母)] ");
    });
  });

  describe("Interface compliance", () => {
    it("implements InputState interface", () => {
      const states: InputState[] = [
        new Empty(),
        new EmptyIgnoringPrevious(),
        new Committing("test"),
        new Inputting("test", 1),
        new ChoosingCandidate("test", 1, [], 0),
        new Marking("test", 1, "", 0, "", "", "", "", true),
        new SelectingDictionary(new NotEmpty("test", 1), "phrase", 0, []),
        new ChineseNumber("123", ChineseNumbersStateStyle.Lowercase),
        new RomanNumber("123", RomanNumberStateStyle.FullWidthLower),
        new Big5("A440"),
        new EnclosingNumber("123"),
        new SelectingDateMacro(() => "converted"),
        new SelectingFeature(() => "converted"),
        new CustomMenu("test", 1, "title", []),
      ];

      states.forEach((state) => {
        expect(state).toBeDefined();
        // All states should be objects (implementing InputState interface)
        expect(typeof state).toBe("object");
      });
    });
  });
});
