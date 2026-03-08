import { VariantAnnotator } from "./VariantAnnotator";
import { webBpmfvsPua } from "./WebBpmfvsPua";
import { webBpmfvsVariants } from "./WebBpmfvsVariants";

describe("VariantAnnotator", () => {
  it("should not havw variant for 還 1", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("還", "ㄏㄞˊ");
    expect(result.hasVariantSelectors).toBe(false);
    expect(result.annotatedString.length === 1);
  });

  it("should have variant for 還 2", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotateSingleCharacter("還", "ㄏㄨㄢˊ");
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.annotatedString.length === 3);
  });

  it("should workd with annotate", () => {
    const va = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
    let result = va.annotate(["還", "還"], ["ㄏㄨㄢˊ", "ㄏㄨㄢˊ"]);
    expect(result.hasVariantSelectors).toBe(true);
    expect(result.annotatedString.length === 6);

    var s = "";
    for (let i = 0; i < 6; i++) {
      if (i === 3) {
        s += " | ";
      }
      s += result.annotatedString[i];
    }
    expect(s === "還󠇡 | 還󠇡");
  });
});
