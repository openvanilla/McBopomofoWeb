const {
  tokenizeLine,
  renderHtml,
} = require("./phraseSyntaxHighlighter");

describe("phraseSyntaxHighlighter", () => {
  test("tokenizes comment lines", () => {
    expect(tokenizeLine("# 註解")).toEqual([{ type: "comment", value: "# 註解" }]);
  });

  test("tokenizes phrase lines with bopomofo readings", () => {
    expect(tokenizeLine("小麥注音 ㄒㄧㄠˇ-ㄇㄞˋ")).toEqual([
      { type: "phrase", value: "小麥注音" },
      { type: "separator separator-space", value: " " },
      { type: "reading reading-bpmf", value: "ㄒㄧㄠˇ" },
      { type: "separator separator-hyphen", value: "-" },
      { type: "reading reading-bpmf", value: "ㄇㄞˋ" },
    ]);
  });

  test("tokenizes phrase lines with underscore-prefixed latin segments", () => {
    expect(tokenizeLine("OpenVanilla _openvanilla-ㄓㄨˋ-ㄧㄣ")).toEqual([
      { type: "phrase", value: "OpenVanilla" },
      { type: "separator separator-space", value: " " },
      { type: "reading reading-latin", value: "_openvanilla" },
      { type: "separator separator-hyphen", value: "-" },
      { type: "reading reading-bpmf", value: "ㄓㄨˋ" },
      { type: "separator separator-hyphen", value: "-" },
      { type: "reading reading-bpmf", value: "ㄧㄣ" },
    ]);
  });

  test("accepts underscore-prefixed segments containing punctuation", () => {
    expect(
      tokenizeLine("，。 _punctuation_Standard_<-_punctuation_Standard_>"),
    ).toEqual([
      { type: "phrase", value: "，。" },
      { type: "separator separator-space", value: " " },
      { type: "reading reading-latin", value: "_punctuation_Standard_<" },
      { type: "separator separator-hyphen", value: "-" },
      { type: "reading reading-latin", value: "_punctuation_Standard_>" },
    ]);
  });

  test("marks non-entry lines as errors", () => {
    expect(tokenizeLine("只有詞條沒有讀音")).toEqual([
      { type: "error", value: "只有詞條沒有讀音" },
    ]);
  });

  test("marks invalid reading lines as errors", () => {
    expect(tokenizeLine("小麥注音 abc-ㄇㄞˋ")).toEqual([
      { type: "error", value: "小麥注音 abc-ㄇㄞˋ" },
    ]);
  });

  test("renders escaped html", () => {
    expect(renderHtml("<詞條> _tag")).toContain("&lt;詞條&gt;");
  });

  test("renders hyphen separator with its own syntax class", () => {
    expect(renderHtml("小麥注音 ㄒㄧㄠˇ-ㄇㄞˋ")).toContain(
      'class="syntax-token syntax-token-separator syntax-token-separator-hyphen"',
    );
  });
});
