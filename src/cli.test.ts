import { main } from "./cli";

describe("CLI Tool", () => {
  test("text-to-braille", async () => {
    const result = await main(["text-to-braille", "小麥注音"]);
    expect(result).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄");
  });

  test("text-to-braille with format", async () => {
    const result = await main(["text-to-braille", "小麥注音", "--format=ascii"]);
    expect(result).toBe("e{`mw\"a/\"?'");
  });

  test("text-to-pinyin", async () => {
    const result = await main(["text-to-pinyin", "中文"]);
    expect(result).toBe("zhong wen");
  });

  test("text-to-bpmf", async () => {
    const result = await main(["text-to-bpmf", "中文"]);
    expect(result).toBe("ㄓㄨㄥㄨㄣˊ");
  });

  test("bpmf-to-text", async () => {
    const result = await main(["bpmf-to-text", "ㄓㄨㄥㄨㄣˊ"]);
    expect(result).toBe("中文");
  });

  test("bpmf-to-braille", async () => {
    const result = await main(["bpmf-to-braille", "ㄓㄨㄥㄨㄣˊ"]);
    expect(result).toBe("⠁⠯⠄⠿⠂");
  });

  test("braille-to-text", async () => {
    const result = await main(["braille-to-text", "⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄"]);
    expect(result).toBe("小麥注音");
  });

  test("text-to-annotated", async () => {
    const result = await main(["text-to-annotated", "還錢"]);
    expect(result).toBe("還󠇡錢");
  });

  test("stdin input", async () => {
    const result = await main(["text-to-pinyin"], "中文");
    expect(result).toBe("zhong wen");
  });

  test("unknown command", async () => {
    await expect(main(["unknown", "test"])).rejects.toThrow('Unknown command "unknown"');
  });

  test("no input provided", async () => {
    // Mocking stdin is hard, so we just pass empty string to trigger error if no stdin
    await expect(main(["text-to-pinyin"], "")).rejects.toThrow("No input provided.");
  });
});
