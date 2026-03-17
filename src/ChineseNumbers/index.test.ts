import {
  Case as DirectCase,
  ChineseNumbers as DirectChineseNumbers,
} from "./ChineseNumbers";
import { Case, ChineseNumbers, SuzhouNumbers } from "./index";
import { SuzhouNumbers as DirectSuzhouNumbers } from "./SuzhouNumbers";

describe("ChineseNumbers index exports", () => {
  test("re-exports Case", () => {
    expect(Case).toBe(DirectCase);
  });

  test("re-exports ChineseNumbers", () => {
    expect(ChineseNumbers).toBe(DirectChineseNumbers);
  });

  test("re-exports SuzhouNumbers", () => {
    expect(SuzhouNumbers).toBe(DirectSuzhouNumbers);
  });
});
