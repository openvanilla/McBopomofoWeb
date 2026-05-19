const {
  tokenizeLine,
  renderHtml,
} = require("./phraseSyntaxHighlighter");

describe("chromeos phraseSyntaxHighlighter", () => {
  test("tokenizes phrase lines with bopomofo readings", () => {
    expect(tokenizeLine("小麥注音 ㄒㄧㄠˇ-ㄇㄞˋ")).toEqual([
      { type: "phrase", value: "小麥注音" },
      { type: "separator separator-space", value: " " },
      { type: "reading reading-bpmf", value: "ㄒㄧㄠˇ" },
      { type: "separator separator-hyphen", value: "-" },
      { type: "reading reading-bpmf", value: "ㄇㄞˋ" },
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

  test("marks invalid reading lines as errors", () => {
    expect(tokenizeLine("小麥注音 abc-ㄇㄞˋ")).toEqual([
      { type: "error", value: "小麥注音 abc-ㄇㄞˋ" },
    ]);
  });

  test("renders hyphen separator with its own syntax class", () => {
    expect(renderHtml("小麥注音 ㄒㄧㄠˇ-ㄇㄞˋ")).toContain(
      'class="syntax-token syntax-token-separator syntax-token-separator-hyphen"',
    );
  });
});
