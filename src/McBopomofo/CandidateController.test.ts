/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Candidate } from "../Gramambular2";
import { CandidateController, CandidateWrapper } from "./CandidateController";

describe("CandidateController", () => {
  const controller = new CandidateController();

  beforeEach(() => {
    const keyCaps = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const candidates = [
      new Candidate("", "一", "一"),
      new Candidate("", "二", "二"),
      new Candidate("", "三", "三"),
      new Candidate("", "四", "四"),
      new Candidate("", "五", "五"),
      new Candidate("", "六", "六"),
      new Candidate("", "七", "七"),
      new Candidate("", "八", "八"),
      new Candidate("", "九", "九"),
      new Candidate("", "壹", "壹"),
      new Candidate("", "貳", "貳"),
    ];
    controller.update(candidates, keyCaps);
  });

  test("moves selection to next candidate on first page", () => {
    controller.goToNextItem();
    const result = controller.currentPage;
    expect(result.length).toBe(9);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(false);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(true);
  });

  test("moves selection to next candidate on last page", () => {
    controller.goToNextPage();
    controller.goToNextItem();
    const result = controller.currentPage;
    expect(result.length).toBe(2);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(false);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(true);
  });

  test("maintains last selection when advancing past end", () => {
    controller.goToNextPage();
    controller.goToNextItem();
    controller.goToNextItem();
    const result = controller.currentPage;
    expect(result.length).toBe(2);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(false);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(true);
  });

  test("returns selection to previous candidate", () => {
    controller.goToNextItem();
    controller.goToPreviousItem();
    const result = controller.currentPage;
    expect(result.length).toBe(9);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(false);
  });

  test("wraps selection to last candidate on previous page", () => {
    controller.goToNextPage();
    controller.goToPreviousItem();
    const result = controller.currentPage;
    expect(result.length).toBe(9);
    const candidate8 = result[8];
    expect(candidate8.keyCap).toBe("9");
    expect(candidate8.candidate.value).toBe("九");
    expect(candidate8.selected).toBe(true);
  });

  test("advances to next page and selects first candidate", () => {
    controller.goToNextPage();
    const result = controller.currentPage;
    expect(result.length).toBe(2);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(false);
  });

  test("keeps selection stable when advancing again", () => {
    controller.goToNextPage();
    controller.goToNextPage();
    const result = controller.currentPage;
    expect(result.length).toBe(2);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("壹");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("貳");
    expect(candidate2.selected).toBe(false);
  });

  test("returns to previous page and selects first candidate", () => {
    controller.goToNextPage();
    controller.goToPreviousPage();
    const result = controller.currentPage;
    expect(result.length).toBe(9);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(false);
  });

  test("maintains first page state when moving before start", () => {
    controller.goToNextPage();
    controller.goToPreviousPage();
    controller.goToPreviousPage();
    const result = controller.currentPage;
    expect(result.length).toBe(9);
    const candidate1 = result[0];
    const candidate2 = result[1];
    expect(candidate1.keyCap).toBe("1");
    expect(candidate1.candidate.value).toBe("一");
    expect(candidate1.selected).toBe(true);
    expect(candidate2.keyCap).toBe("2");
    expect(candidate2.candidate.value).toBe("二");
    expect(candidate2.selected).toBe(false);
  });

  test("returns empty page when no candidates exist", () => {
    const emptyController = new CandidateController();
    emptyController.update([], []);
    const result = emptyController.currentPage;
    expect(result.length).toBe(0);
  });

  test("resets selection after updating candidate list", () => {
    const newCandidatesController = new CandidateController();
    newCandidatesController.update([new Candidate("", "A", "A")], ["1"]);
    newCandidatesController.goToNextItem();
    newCandidatesController.update([new Candidate("", "B", "B")], ["1"]);
    const result = newCandidatesController.currentPage;
    expect(result[0].candidate.value).toBe("B");
    expect(result[0].selected).toBe(true);
  });

  test("finds candidate by key cap", () => {
    let result = controller.selectedCandidateWithKey("2");
    expect(result?.value).toBe("二");

    controller.goToNextPage();
    result = controller.selectedCandidateWithKey("2");
    expect(result?.value).toBe("貳");

    result = controller.selectedCandidateWithKey("9");
    expect(result).toBeUndefined();
  });

  test("exposes selected candidate value", () => {
    expect(controller.selectedCandidate.value).toBe("一");

    controller.goToNextItem();
    expect(controller.selectedCandidate.value).toBe("二");

    controller.goToNextPage();
    expect(controller.selectedCandidate.value).toBe("壹");

    controller.goToLast();
    expect(controller.selectedCandidate.value).toBe("貳");

    controller.goToFirst();
    expect(controller.selectedCandidate.value).toBe("一");
  });

  test("updates selectedIndex and selected candidate", () => {
    expect(controller.selectedIndex).toBe(0);

    controller.selectedIndex = 1;
    expect(controller.selectedIndex).toBe(1);
    expect(controller.selectedCandidate.value).toBe("二");

    controller.selectedIndex = 9;
    expect(controller.selectedIndex).toBe(9);
    expect(controller.selectedCandidate.value).toBe("壹");

    controller.selectedIndex = 0;
    expect(controller.selectedIndex).toBe(0);
    expect(controller.selectedCandidate.value).toBe("一");
  });

  test("tracks current page index", () => {
    expect(controller.currentPageIndex).toBe(0);

    controller.goToNextPage();
    expect(controller.currentPageIndex).toBe(1);

    controller.goToPreviousPage();
    expect(controller.currentPageIndex).toBe(0);

    controller.selectedIndex = 8; // Last item on first page
    expect(controller.currentPageIndex).toBe(0);

    controller.selectedIndex = 9; // First item on second page
    expect(controller.currentPageIndex).toBe(1);

    controller.goToFirst();
    expect(controller.currentPageIndex).toBe(0);

    controller.goToLast();
    expect(controller.currentPageIndex).toBe(1);
  });

  test("calculates total page count from provided candidates", () => {
    expect(controller.totalPageCount).toBe(2);

    const testController = new CandidateController();
    testController.update([], []);
    expect(testController.totalPageCount).toBe(0);

    testController.update([new Candidate("", "A", "A")], ["1"]);
    expect(testController.totalPageCount).toBe(1);

    // Test with exactly one full page
    const fullPage = [
      new Candidate("", "一", "一"),
      new Candidate("", "二", "二"),
      new Candidate("", "三", "三"),
    ];
    testController.update(fullPage, ["1", "2", "3"]);
    expect(testController.totalPageCount).toBe(1);

    // Test with partial pages
    const partialPages = [
      new Candidate("", "一", "一"),
      new Candidate("", "二", "二"),
      new Candidate("", "三", "三"),
      new Candidate("", "四", "四"),
    ];
    testController.update(partialPages, ["1", "2", "3"]);
    expect(testController.totalPageCount).toBe(2);
  });

  test("cycles to first page when advancing past last", () => {
    expect(controller.currentPageIndex).toBe(0);

    // Go to next page normally
    controller.goToNextPageButFirstWhenAtEnd();
    expect(controller.currentPageIndex).toBe(1);
    expect(controller.selectedCandidate.value).toBe("壹");

    // When at last page, should cycle to first page
    controller.goToNextPageButFirstWhenAtEnd();
    expect(controller.currentPageIndex).toBe(0);
    expect(controller.selectedCandidate.value).toBe("一");

    // Test cycling multiple times
    controller.goToNextPageButFirstWhenAtEnd();
    controller.goToNextPageButFirstWhenAtEnd();
    expect(controller.currentPageIndex).toBe(0);
    expect(controller.selectedCandidate.value).toBe("一");
  });
});

describe("CandidateWrapper", () => {
  test("exposes candidate wrapper properties", () => {
    const candidate = new Candidate("reading", "value", "displayedText");
    const wrapper = new CandidateWrapper("1", candidate, true);

    expect(wrapper.keyCap).toBe("1");
    expect(wrapper.candidate).toBe(candidate);
    expect(wrapper.selected).toBe(true);
    expect(wrapper.reading).toBe("reading");
    expect(wrapper.value).toBe("value");
    expect(wrapper.displayedText).toBe("displayedText");
  });

  test("preserves candidate references", () => {
    const candidate = new Candidate("reading", "value", "displayedText");
    const wrapper = new CandidateWrapper("1", candidate, true);
    expect(wrapper.candidate).toBe(candidate);
    expect(wrapper.reading).toBe(candidate.reading);
    expect(wrapper.value).toBe(candidate.value);
  });
});
