import {
  ComposingBufferText,
  ComposingBufferTextStyle,
  InputUIState,
} from "./InputUI";
import { CandidateWrapper } from "./CandidateController";

describe("ComposingBufferText", () => {
  it("should construct with default style", () => {
    const bufferText = new ComposingBufferText("test");
    expect(bufferText).toEqual({
      text: "test",
      style: ComposingBufferTextStyle.Normal,
    });
  });

  it("should construct with specified style", () => {
    const bufferText = new ComposingBufferText(
      "test",
      ComposingBufferTextStyle.Highlighted
    );
    expect(bufferText).toEqual({
      text: "test",
      style: ComposingBufferTextStyle.Highlighted,
    });
  });
});

describe("InputUIState", () => {
  it("should construct with correct values", () => {
    const composingBuffer = [new ComposingBufferText("test")];
    const cursorIndex = 1;
    const candidates: CandidateWrapper[] = [];
    const tooltip = "tooltip";
    const candidatePageCount = 2;
    const candidatePageIndex = 0;

    const state = new InputUIState(
      composingBuffer,
      cursorIndex,
      candidates,
      tooltip,
      candidatePageCount,
      candidatePageIndex
    );

    expect(state.composingBuffer).toBe(composingBuffer);
    expect(state.cursorIndex).toBe(cursorIndex);
    expect(state.candidates).toBe(candidates);
    expect(state.tooltip).toBe(tooltip);
    expect(state.candidatePageCount).toBe(candidatePageCount);
    expect(state.candidatePageIndex).toBe(candidatePageIndex);
  });
});
