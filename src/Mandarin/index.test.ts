import { BopomofoCharacterMap as DirectCharacterMap } from "./BopomofoCharacterMap";
import { BopomofoKeyboardLayout as DirectKeyboardLayout } from "./BopomofoKeyboardLayout";
import { BopomofoReadingBuffer as DirectReadingBuffer } from "./BopomofoReadingBuffer";
import { BopomofoSyllable as DirectSyllable } from "./BopomofoSyllable";
import {
  BopomofoCharacterMap,
  BopomofoKeyboardLayout,
  BopomofoReadingBuffer,
  BopomofoSyllable,
} from "./index";

describe("Mandarin index exports", () => {
  test("re-exports BopomofoCharacterMap", () => {
    expect(BopomofoCharacterMap).toBe(DirectCharacterMap);
  });

  test("re-exports BopomofoKeyboardLayout", () => {
    expect(BopomofoKeyboardLayout).toBe(DirectKeyboardLayout);
  });

  test("re-exports BopomofoReadingBuffer", () => {
    expect(BopomofoReadingBuffer).toBe(DirectReadingBuffer);
  });

  test("re-exports BopomofoSyllable", () => {
    expect(BopomofoSyllable).toBe(DirectSyllable);
  });
});
