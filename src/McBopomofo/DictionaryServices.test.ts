/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { DictionaryServices } from "./DictionaryServices";
import { LocalizedStrings } from "./LocalizedStrings";
import {
  InputState,
  SelectingDictionary,
  ShowingCharInfo,
  NotEmpty,
  Empty,
} from "./InputState";

// Mock the entire DictionaryServices module
jest.mock("./DictionaryServices", () => {
  const originalModule = jest.requireActual("./DictionaryServices");

  return {
    ...originalModule,
    SpeakService: jest.fn().mockImplementation(() => {
      return {
        name: "Speak Service",
        lookUp: jest.fn(),
        textForMenu: () => "Speak",
      };
    }),
    CharacterInfoService: jest.fn().mockImplementation(() => {
      return {
        name: "Character Information Service",
        lookUp: jest.fn(),
        textForMenu: () => "Character Info",
      };
    }),
    HttpBasedDictionary: jest.fn().mockImplementation(() => {
      return {
        name: "Mock HTTP Service",
        lookUp: jest.fn(),
        textForMenu: () => "Mock HTTP",
      };
    }),
  };
});

describe("DictionaryServices", () => {
  let dictionaryServices: DictionaryServices;
  let mockStateCallback: jest.Mock;

  beforeEach(() => {
    dictionaryServices = new DictionaryServices(new LocalizedStrings());
    mockStateCallback = jest.fn();
  });

  test("constructor initializes services", () => {
    expect(dictionaryServices.services.length).toBeGreaterThan(0);
  });

  test("buildMenu returns a list of menu items", () => {
    const menu = dictionaryServices.buildMenu("test");
    expect(menu.length).toBe(dictionaryServices.services.length);
  });

  test("lookup calls the correct service", () => {
    if (dictionaryServices.services.length > 0) {
      const service = dictionaryServices.services[0];
      const lookUpSpy = jest.spyOn(service, "lookUp");
      dictionaryServices.lookup("test", 0, new Empty(), mockStateCallback);
      expect(lookUpSpy).toHaveBeenCalled();
    }
  });

  test("lookup returns false for invalid index", () => {
    const result = dictionaryServices.lookup(
      "test",
      99,
      new Empty(),
      mockStateCallback
    );
    expect(result).toBe(false);
  });
});
