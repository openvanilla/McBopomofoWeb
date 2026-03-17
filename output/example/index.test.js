const {
  calculateFunctionPosition,
  INPUT_FONT_SIZE_BPMF,
  INPUT_FONT_SIZE_DEFAULT,
} = require("./index.js");

describe("calculateFunctionPosition", () => {
  it("positions the overlay relative to the edit area instead of the viewport", () => {
    const result = calculateFunctionPosition({
      caretRect: { top: 210, left: 180 },
      mirrorRect: { top: 120, left: 90 },
      textAreaRect: { top: 140, left: 100 },
      containerRect: { top: 80, left: 40 },
      lineHeight: 24,
      scrollTop: 18,
      scrollLeft: 7,
    });

    expect(result).toEqual({
      top: 156,
      left: 143,
    });
  });

  it("keeps the overlay aligned when the textarea has not scrolled", () => {
    const result = calculateFunctionPosition({
      caretRect: { top: 96, left: 142 },
      mirrorRect: { top: 32, left: 48 },
      textAreaRect: { top: 64, left: 80 },
      containerRect: { top: 40, left: 20 },
      lineHeight: 20,
      scrollTop: 0,
      scrollLeft: 0,
    });

    expect(result).toEqual({
      top: 108,
      left: 154,
    });
  });
});

describe("input font sizes", () => {
  it("keeps the main input font sizes compact", () => {
    expect(INPUT_FONT_SIZE_BPMF).toBe(22);
    expect(INPUT_FONT_SIZE_DEFAULT).toBe(18);
  });
});
