import { VariantAnnotator } from "./VariantAnnotator";
import { webBpmfvsPua } from "./WebBpmfvsPua";
import { webBpmfvsVariants } from "./WebBpmfvsVariants";

describe("VariantAnnotator", () => {
  it("should not havw variant for 還", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("還", "ㄏㄞˊ");
    expect(result.hasVariantSelectors).toBe(false);
    expect(result.annotatedString.length === 1);
  });

  it("should have variant for  1", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("還", "ㄏㄨㄢˊ");
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.annotatedString.length === 3);
  });
});
