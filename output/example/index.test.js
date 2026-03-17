const {
  calculateFunctionPosition,
  INPUT_FONT_SIZE_BPMF,
  INPUT_FONT_SIZE_DEFAULT,
} = require("./index.js");
const fs = require("fs");
const path = require("path");

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

describe("loading banner layout", () => {
  it("keeps the loading banner absolute on the left without spanning over the top navigation", () => {
    const css = fs.readFileSync(path.join(__dirname, "index.css"), "utf8");
    const loadingRuleMatch = css.match(/#loading\s*\{([\s\S]*?)\}/);

    expect(loadingRuleMatch).not.toBeNull();
    expect(loadingRuleMatch[1]).toMatch(/position:\s*absolute/);
    expect(loadingRuleMatch[1]).toMatch(/left:\s*var\(--spacing-3\)/);
    expect(loadingRuleMatch[1]).toMatch(/max-width:\s*fit-content/);
  });
});

describe("initial feature activation", () => {
  it("does not focus the feature input when the page finishes bootstrapping", () => {
    const js = fs.readFileSync(path.join(__dirname, "index.js"), "utf8");

    expect(js).toMatch(/setTimeout\(\(\) => \{[\s\S]*onHashChange\(\{ focus: false \}\);[\s\S]*\}, 2000\);/);
    expect(js).toMatch(/document\.addEventListener\("DOMContentLoaded",[\s\S]*onHashChange\(\{ focus: false \}\);[\s\S]*\}\);/);
  });

  it("adds the default hash with history.replaceState instead of triggering anchor scroll", () => {
    const js = fs.readFileSync(path.join(__dirname, "index.js"), "utf8");

    expect(js).toMatch(/window\.history\.replaceState\(null, "", "#feature_input"\)/);
    expect(js).not.toMatch(/window\.location\.hash = "feature_input"/);
  });

  it("resets the initial scroll position after bootstrapping even when the page opens with a hash", () => {
    const js = fs.readFileSync(path.join(__dirname, "index.js"), "utf8");

    expect(js).toMatch(/window\.scrollTo\(\{\s*top:\s*0,\s*left:\s*0,\s*behavior:\s*"auto"\s*\}\)/);
  });
});
