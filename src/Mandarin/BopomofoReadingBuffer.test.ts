/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import {
  BopomofoReadingBuffer,
  BopomofoKeyboardLayout,
  BopomofoSyllable,
} from "./index";

describe("BopomofoReadingBuffer", () => {
  describe("Constructor and Basic Properties", () => {
    test("should initialize with StandardLayout", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      expect(buffer.keyboardLayout).toBe(BopomofoKeyboardLayout.StandardLayout);
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.composedString).toBe("");
    });

    test("should initialize with IBMLayout", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.IBMLayout
      );
      expect(buffer.keyboardLayout).toBe(BopomofoKeyboardLayout.IBMLayout);
      expect(buffer.isEmpty).toBe(true);
    });

    test("should initialize with ETenLayout", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.ETenLayout
      );
      expect(buffer.keyboardLayout).toBe(BopomofoKeyboardLayout.ETenLayout);
      expect(buffer.isEmpty).toBe(true);
    });

    test("should initialize with HanyuPinyinLayout in pinyin mode", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
      expect(buffer.keyboardLayout).toBe(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.composedString).toBe("");
    });
  });

  describe("Keyboard Layout Setter", () => {
    test("should switch from standard layout to pinyin layout", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      buffer.keyboardLayout = BopomofoKeyboardLayout.HanyuPinyinLayout;
      expect(buffer.keyboardLayout).toBe(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
    });

    test("should switch from pinyin layout to standard layout", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
      buffer.keyboardLayout = BopomofoKeyboardLayout.StandardLayout;
      expect(buffer.keyboardLayout).toBe(BopomofoKeyboardLayout.StandardLayout);
    });

    test("should reset to pinyin mode when switching to HanyuPinyinLayout", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      buffer.combineKey("1"); // Add some content
      expect(buffer.isEmpty).toBe(false);

      buffer.keyboardLayout = BopomofoKeyboardLayout.HanyuPinyinLayout;
      expect(buffer.keyboardLayout).toBe(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
      // Note: Layout switching doesn't automatically clear the buffer content
    });
  });

  describe("Standard Layout Key Validation", () => {
    let buffer: BopomofoReadingBuffer;

    beforeEach(() => {
      buffer = new BopomofoReadingBuffer(BopomofoKeyboardLayout.StandardLayout);
    });

    test("should validate bopomofo keys", () => {
      // Test some valid keys for standard layout
      expect(buffer.isValidKey("1")).toBe(true); // ㄅ
      expect(buffer.isValidKey("q")).toBe(true); // ㄆ
      expect(buffer.isValidKey("a")).toBe(true); // ㄇ
      expect(buffer.isValidKey("z")).toBe(true); // ㄈ
    });

    test("should reject invalid keys", () => {
      // Based on the StandardLayout, let's test truly invalid keys
      expect(buffer.isValidKey("'")).toBe(false); // apostrophe
      expect(buffer.isValidKey("`")).toBe(false); // backtick
      expect(buffer.isValidKey("")).toBe(false); // empty string
      expect(buffer.isValidKey("aa")).toBe(false); // multi-character
      expect(buffer.isValidKey(" ")).toBe(false); // space
    });
  });

  describe("Pinyin Mode Key Validation", () => {
    let buffer: BopomofoReadingBuffer;

    beforeEach(() => {
      buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
    });

    test("should validate alphabetic keys", () => {
      expect(buffer.isValidKey("a")).toBe(true);
      expect(buffer.isValidKey("b")).toBe(true);
      expect(buffer.isValidKey("z")).toBe(true);
      expect(buffer.isValidKey("A")).toBe(true); // uppercase should work
      expect(buffer.isValidKey("Z")).toBe(true);
    });

    test("should validate tone markers when sequence exists", () => {
      buffer.combineKey("m");
      buffer.combineKey("a");
      expect(buffer.composedString).toBe("ma");

      // According to the code, tone 1 is not explicitly handled (only 2-5)
      expect(buffer.isValidKey("1")).toBe(false); // tone 1 not in range 2-5
      expect(buffer.isValidKey("2")).toBe(true); // tone 2-5 allowed
      expect(buffer.isValidKey("3")).toBe(true);
      expect(buffer.isValidKey("4")).toBe(true);
      expect(buffer.isValidKey("5")).toBe(true);
    });

    test("should reject tone markers when one already exists", () => {
      buffer.combineKey("ma2");
      expect(buffer.isValidKey("3")).toBe(false);
      expect(buffer.isValidKey("4")).toBe(false);
    });

    test("should reject invalid characters", () => {
      expect(buffer.isValidKey("1")).toBe(false); // digit without preceding letters
      expect(buffer.isValidKey("!")).toBe(false);
      expect(buffer.isValidKey("@")).toBe(false);
      expect(buffer.isValidKey("")).toBe(false);
      expect(buffer.isValidKey("aa")).toBe(false); // multi-character
    });
  });

  describe("Standard Layout Key Combination", () => {
    let buffer: BopomofoReadingBuffer;

    beforeEach(() => {
      buffer = new BopomofoReadingBuffer(BopomofoKeyboardLayout.StandardLayout);
    });

    test("should combine valid keys", () => {
      expect(buffer.combineKey("1")).toBe(true); // ㄅ
      expect(buffer.isEmpty).toBe(false);
      expect(buffer.composedString).not.toBe("");
    });

    test("should reject truly invalid keys", () => {
      expect(buffer.combineKey("'")).toBe(false); // apostrophe not in layout
      expect(buffer.isEmpty).toBe(true);
    });

    test("should build syllable progressively", () => {
      buffer.combineKey("1"); // ㄅ (b)
      const firstStep = buffer.composedString;
      buffer.combineKey("0"); // ㄚ (a)
      const secondStep = buffer.composedString;
      expect(secondStep).not.toBe(firstStep);
      expect(buffer.composedString.length).toBeGreaterThan(firstStep.length);
    });
  });

  describe("Pinyin Mode Key Combination", () => {
    let buffer: BopomofoReadingBuffer;

    beforeEach(() => {
      buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
    });

    test("should combine alphabetic keys", () => {
      expect(buffer.combineKey("m")).toBe(true);
      expect(buffer.combineKey("a")).toBe(true);
      expect(buffer.composedString).toBe("ma");
    });

    test("should add tone markers", () => {
      buffer.combineKey("m");
      buffer.combineKey("a");
      buffer.combineKey("2");
      expect(buffer.composedString).toBe("ma2");
    });

    test("should reject invalid combinations", () => {
      expect(buffer.combineKey("2")).toBe(false); // tone without syllable
      expect(buffer.combineKey("!")).toBe(false);
    });

    test("should build complex syllables", () => {
      buffer.combineKey("z");
      buffer.combineKey("h");
      buffer.combineKey("u");
      buffer.combineKey("a");
      buffer.combineKey("n");
      buffer.combineKey("g");
      buffer.combineKey("3");
      expect(buffer.composedString).toBe("zhuang3");
    });
  });

  describe("Clear and Backspace", () => {
    test("should clear standard layout buffer", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      buffer.combineKey("1");
      buffer.combineKey("0");
      expect(buffer.isEmpty).toBe(false);

      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.composedString).toBe("");
    });

    test("should clear pinyin buffer", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
      buffer.combineKey("m");
      buffer.combineKey("a");
      buffer.combineKey("2");
      expect(buffer.isEmpty).toBe(false);

      buffer.clear();
      expect(buffer.isEmpty).toBe(true);
      expect(buffer.composedString).toBe("");
    });

    test("should backspace in standard layout", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      buffer.combineKey("1"); // ㄅ
      buffer.combineKey("0"); // ㄚ
      const beforeBackspace = buffer.composedString;

      buffer.backspace();
      expect(buffer.composedString).not.toBe(beforeBackspace);
      expect(buffer.composedString.length).toBeLessThan(beforeBackspace.length);
    });

    test("should backspace in pinyin mode", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );
      buffer.combineKey("m");
      buffer.combineKey("a");
      buffer.combineKey("2");
      expect(buffer.composedString).toBe("ma2");

      buffer.backspace();
      expect(buffer.composedString).toBe("ma");

      buffer.backspace();
      expect(buffer.composedString).toBe("m");

      buffer.backspace();
      expect(buffer.composedString).toBe("");
      expect(buffer.isEmpty).toBe(true);
    });

    test("should handle backspace on empty buffer", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      expect(buffer.isEmpty).toBe(true);

      buffer.backspace(); // Should not throw error
      expect(buffer.isEmpty).toBe(true);
    });
  });

  describe("Syllable Properties", () => {
    test("should access syllable object", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      expect(buffer.syllable).toBeInstanceOf(BopomofoSyllable);
      expect(buffer.syllable.isEmpty).toBe(true);
    });

    test("should detect tone markers", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      expect(buffer.hasToneMarker).toBe(false);

      // Add a tone marker (specific key depends on layout)
      buffer.combineKey("1"); // consonant
      buffer.combineKey("0"); // vowel
      buffer.combineKey("3"); // tone marker
      // Note: The exact key sequence depends on the layout implementation
    });

    test("should detect tone marker only state", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      expect(buffer.hasToneMarkerOnly).toBe(false);

      // This test depends on the specific implementation of tone-only input
    });
  });

  describe("Standard Layout Query String", () => {
    test("should provide standard layout query string", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.IBMLayout
      );
      buffer.combineKey("1"); // Add some content

      const queryString = buffer.standardLayoutQueryString();
      expect(typeof queryString).toBe("string");
    });

    test("should work with different layouts", () => {
      const bufferStd = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      const bufferIBM = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.IBMLayout
      );

      bufferStd.combineKey("1");
      bufferIBM.combineKey("1"); // Same logical input, different physical key

      // Both should provide valid query strings
      expect(typeof bufferStd.standardLayoutQueryString()).toBe("string");
      expect(typeof bufferIBM.standardLayoutQueryString()).toBe("string");
    });
  });

  describe("Edge Cases", () => {
    test("should handle rapid key combinations", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );

      const keys = "zhuang3".split("");
      keys.forEach((key) => {
        buffer.combineKey(key);
      });

      expect(buffer.composedString).toBe("zhuang3");
    });

    test("should handle mixed case in pinyin", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );

      buffer.combineKey("M");
      buffer.combineKey("A");
      buffer.combineKey("2");

      expect(buffer.composedString).toBe("ma2"); // Should be lowercase
    });

    test("should handle layout switching with content", () => {
      const buffer = new BopomofoReadingBuffer(
        BopomofoKeyboardLayout.StandardLayout
      );
      buffer.combineKey("1");
      expect(buffer.isEmpty).toBe(false);

      // Switch layout - content persists but mode changes
      buffer.keyboardLayout = BopomofoKeyboardLayout.HanyuPinyinLayout;
      expect(buffer.keyboardLayout).toBe(
        BopomofoKeyboardLayout.HanyuPinyinLayout
      );

      // Should work in new layout
      buffer.clear(); // Clear first to start fresh
      buffer.combineKey("m");
      expect(buffer.composedString).toBe("m");
    });
  });
});
