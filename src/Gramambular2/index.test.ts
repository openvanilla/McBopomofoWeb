import {
  Candidate,
  LanguageModel,
  Node,
  ReadingGrid,
  Unigram,
  WalkResult,
} from "./index";
import type { LanguageModel as DirectLanguageModel } from "./LanguageModel";
import {
  Unigram as DirectUnigram,
} from "./LanguageModel";
import {
  Candidate as DirectCandidate,
  Node as DirectNode,
  ReadingGrid as DirectReadingGrid,
  WalkResult as DirectWalkResult,
} from "./ReadingGrid";

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false;

const languageModelExportMatches: AssertEqual<LanguageModel, DirectLanguageModel> = true;

describe("Gramambular2 index exports", () => {
  test("re-exports LanguageModel type", () => {
    expect(languageModelExportMatches).toBe(true);
  });

  test("re-exports Unigram", () => {
    expect(Unigram).toBe(DirectUnigram);
  });

  test("re-exports Candidate", () => {
    expect(Candidate).toBe(DirectCandidate);
  });

  test("re-exports Node", () => {
    expect(Node).toBe(DirectNode);
  });

  test("re-exports ReadingGrid", () => {
    expect(ReadingGrid).toBe(DirectReadingGrid);
  });

  test("re-exports WalkResult", () => {
    expect(WalkResult).toBe(DirectWalkResult);
  });
});
