/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { DictionaryServices } from "./DictionaryServices";
import {
  ChoosingCandidate,
  Empty,
  SelectingDictionary,
  ShowingCharInfo,
} from "./InputState";
import { LocalizedStrings } from "./LocalizedStrings";

describe("DictionaryServices", () => {
  const originalWindow = (globalThis as typeof globalThis & { window?: unknown })
    .window;
  const originalTextEncoder = global.TextEncoder;

  let speechSynthesisSpeak: jest.Mock;
  let speechSynthesisUtteranceMock: jest.Mock;
  let dictionaryServices: DictionaryServices;
  let localizedStrings: LocalizedStrings;

  const setBrowserCapabilities = (): void => {
    const windowLike = globalThis as any;
    speechSynthesisSpeak = jest.fn();
    speechSynthesisUtteranceMock = jest
      .fn()
      .mockImplementation((text: string) => ({ text, lang: "" }));

    windowLike.window = windowLike.window ?? {};
    windowLike.window.speechSynthesis = { speak: speechSynthesisSpeak };
    windowLike.window.SpeechSynthesisUtterance = speechSynthesisUtteranceMock;
    windowLike.speechSynthesis = windowLike.window.speechSynthesis;
    windowLike.SpeechSynthesisUtterance =
      windowLike.window.SpeechSynthesisUtterance;
    global.TextEncoder = class MockTextEncoder {
      encode(input?: string): Uint8Array {
        return new Uint8Array((input ?? "").length);
      }
    } as typeof TextEncoder;
  };

  beforeEach(() => {
    localizedStrings = new LocalizedStrings();
    localizedStrings.languageCode = "zh-TW";
    setBrowserCapabilities();
    dictionaryServices = new DictionaryServices(localizedStrings);
  });

  afterEach(() => {
    const windowLike = globalThis as any;
    windowLike.window = originalWindow;
    delete windowLike.speechSynthesis;
    delete windowLike.SpeechSynthesisUtterance;
    global.TextEncoder = originalTextEncoder;
  });

  test("constructor registers speech, character info, and http dictionary services", () => {
    expect(dictionaryServices.services[0]?.name).toBe("Speak Service");
    expect(dictionaryServices.services[1]?.name).toBe(
      "Character Information Service"
    );
    expect(dictionaryServices.services.some((service) => service.name === "萌典")).toBe(
      true
    );
  });

  test("buildMenu uses localized labels from each service", () => {
    const menu = dictionaryServices.buildMenu("測試");

    expect(menu[0]).toBe("朗讀「測試」");
    expect(menu[1]).toBe("字元資訊");
    expect(menu[2]).toBe("在「萌典」查找「測試」");
  });

  test("lookup routes to the speak service and invokes speech synthesis", () => {
    const result = dictionaryServices.lookup("注音", 0, new Empty(), jest.fn());

    expect(result).toBe(true);
    expect(speechSynthesisUtteranceMock).toHaveBeenCalledWith("注音");
    expect(speechSynthesisSpeak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "注音",
        lang: "zh-TW",
      })
    );
  });

  test("character info lookup transitions from dictionary selection to char info", () => {
    const stateCallback = jest.fn();
    const state = new SelectingDictionary(
      new ChoosingCandidate("漢", 1, [], 1),
      "漢",
      0,
      []
    );

    const result = dictionaryServices.lookup("漢", 1, state, stateCallback);

    expect(result).toBe(true);
    expect(stateCallback).toHaveBeenCalledWith(expect.any(ShowingCharInfo));
    expect(
      (stateCallback.mock.calls[0]?.[0] as ShowingCharInfo).selectedPhrase
    ).toBe("漢");
  });

  test("character info service refuses unsupported states", () => {
    const stateCallback = jest.fn();
    const characterInfoService = dictionaryServices.services[1];

    const result = characterInfoService.lookUp("漢", new Empty(), 1, stateCallback);

    expect(result).toBe(false);
    expect(stateCallback).not.toHaveBeenCalled();
  });

  test("lookup returns false for an invalid index", () => {
    const result = dictionaryServices.lookup("test", 99, new Empty(), jest.fn());

    expect(result).toBe(false);
  });

  test("speak service returns false when speech synthesis is unavailable", () => {
    const windowLike = globalThis as any;
    // Remove speech synthesis to simulate unsupported environment
    delete windowLike.window.speechSynthesis;
    delete windowLike.window.SpeechSynthesisUtterance;
    delete windowLike.speechSynthesis;
    delete windowLike.SpeechSynthesisUtterance;

    const speakService = dictionaryServices.services[0];
    const result = speakService.lookUp("注音", new Empty(), 0, jest.fn());
    expect(result).toBe(false);
  });

  test("http dictionary service opens encoded url and resets state", () => {
    const stateCallback = jest.fn();
    const openUrl = jest.fn();
    const moedictIndex = dictionaryServices.services.findIndex(
      (service) => service.name === "萌典"
    );
    dictionaryServices.onOpenUrl = openUrl;

    const result = dictionaryServices.lookup(
      "注音 空白",
      moedictIndex,
      new Empty(),
      stateCallback
    );

    expect(result).toBe(true);
    expect(openUrl).toHaveBeenCalledWith("https://www.moedict.tw/%E6%B3%A8%E9%9F%B3%20%E7%A9%BA%E7%99%BD");
    expect(stateCallback).toHaveBeenCalledWith(expect.any(Empty));
  });
});
