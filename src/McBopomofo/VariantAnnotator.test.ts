import { VariantAnnotator } from "./VariantAnnotator";
import { webBpmfvsPua } from "./WebBpmfvsPua";
import { webBpmfvsVariants } from "./WebBpmfvsVariants";

describe("VariantAnnotator", () => {
  it("should not have variant for 還 1", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("還", "ㄏㄞˊ");
    expect(result.hasVariantSelectors).toBe(false);
    expect(result.annotatedString.length).toBe(1);
  });

  it("should have variant for 還 2", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("還", "ㄏㄨㄢˊ");
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.annotatedString.length).toBe(3);
  });

  it("should have PUA for 〇 with ㄅㄚ reading", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("〇", "ㄅㄚ");
    // 〇-na is in variantsMap, but 〇-ㄅㄚ is not.
    // ㄅㄚ is in puaMap.
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.hasPUACodePoints).toBe(true);
    expect(result.annotatedString).toBe("〇󠇠");
  });

  it("should return original for unknown character", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("测试", "unknown");
    expect(result.hasVariantSelectors).toBe(false);
    expect(result.hasPUACodePoints).toBe(false);
    expect(result.annotatedString).toBe("测试");
  });

  it("should handle mixed characters in annotate", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotate(["還", "中"], ["ㄏㄞˊ", "ㄓㄨㄥˋ"]);
    // 還-ㄏㄞˊ: 還 (no variant), length 1
    // 中-ㄓㄨㄥˋ: 中󠇡 (has variant), length 3
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.hasPUACodePoints).toBe(false);
    expect(result.annotatedString).toBe("還中󠇡");
    expect(result.accumulatedStringLength).toEqual([1, 3]);
  });

  it("should handle multiple characters with variants in annotate", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotate(["還", "還"], ["ㄏㄨㄢˊ", "ㄏㄨㄢˊ"]);
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.annotatedString).toBe("還󠇡還󠇡");
    expect(result.annotatedString.length).toBe(6);
    expect(result.accumulatedStringLength).toEqual([3, 3]);
  });

  it("should return empty result for mismatching lengths in annotate", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotate(["還"], ["ㄏㄞˊ", "ㄏㄨㄢˊ"]);
    expect(result.annotatedString).toBe("");
    expect(result.accumulatedStringLength).toEqual([]);
  });

  it("should handle mixed PUA and non-PUA characters in annotate", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotate(["還", "〇"], ["ㄏㄞˊ", "ㄅㄚ"]);
    // 還-ㄏㄞˊ: 還 (no variant), length 1
    // 〇-ㄅㄚ: 〇󠇠 (has variant, has PUA), length 3
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.hasPUACodePoints).toBe(true);
    expect(result.annotatedString).toBe("還〇󠇠");
    expect(result.accumulatedStringLength).toEqual([1, 3]);
  });

  it("should handle empty input in annotate", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotate([], []);
    expect(result.annotatedString).toBe("");
    expect(result.accumulatedStringLength).toEqual([]);
    expect(result.hasVariantSelectors).toBe(false);
    expect(result.hasPUACodePoints).toBe(false);
  });

  it("should handle characters with no variant map entry at all", () => {
    const va = new VariantAnnotator({}, {});
    let result = va.annotateSingleCharacter("A", "B");
    expect(result.hasVariantSelectors).toBe(false);
    expect(result.hasPUACodePoints).toBe(false);
    expect(result.annotatedString).toBe("A");
  });
});
