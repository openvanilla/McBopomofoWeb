/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Candidate } from "../Gramambular2";
import { CandidateController } from "./CandidateController";

describe("Test CandidateController", () => {
  let controller = new CandidateController();

  beforeEach(() => {
    let keyCaps = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let candidates = [
      new Candidate("", "一"),
      new Candidate("", "二"),
      new Candidate("", "三"),
      new Candidate("", "四"),
      new Candidate("", "五"),
      new Candidate("", "六"),
      new Candidate("", "七"),
      new Candidate("", "八"),
      new Candidate("", "九"),
      new Candidate("", "壹"),
      new Candidate("", "貳"),
    ];
    controller.update(candidates, keyCaps);
  });

  test("Test next item 1", () => {
    controller.goToNextItem();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(9);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(false);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(true);
  });

  test("Test next item 2", () => {
    controller.goToNextPage();
    controller.goToNextItem();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(2);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(false);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(true);
  });

  test("Test next item 3", () => {
    controller.goToNextPage();
    controller.goToNextItem();
    controller.goToNextItem();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(2);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(false);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(true);
  });

  test("Test prev item 1", () => {
    controller.goToNextItem();
    controller.goToPreviousItem();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(9);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(false);
  });

  test("Test prev item 2", () => {
    controller.goToNextPage();
    controller.goToPreviousItem();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(9);
    let candidate8 = result[8];
    expect(candidate8.keyCap).toBe("9");
    expect(candidate8.candidate.value).toBe("九");
    expect(candidate8.selected).toBe(true);
  });

  test("Test next page 1", () => {
    controller.goToNextPage();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(2);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(false);
  });

  test("Test next page 2", () => {
    controller.goToNextPage();
    controller.goToNextPage();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(2);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(false);
  });

  test("Test prev page 1", () => {
    controller.goToNextPage();
    controller.goToPreviousPage();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(9);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(false);
  });

  test("Test prev page 2", () => {
    controller.goToNextPage();
    controller.goToPreviousPage();
    controller.goToPreviousPage();
    let result = controller.getCurrentPage();
    expect(result.length).toBe(9);
    let candidate1 = result[0];
    let candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(false);
  });
});
