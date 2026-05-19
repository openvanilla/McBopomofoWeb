(function (globalScope) {
  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const wrapToken = (type, value) => ({
    type,
    value,
  });

  const bpmfSegmentPattern =
    /^[ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦㄧㄨㄩ˙ˊˇˋ]+$/;
  const latinSegmentPattern = /^_[^\s]+$/;

  const isValidReadingSegment = (segment) =>
    bpmfSegmentPattern.test(segment) || latinSegmentPattern.test(segment);

  const isValidReading = (reading) =>
    reading.length > 0 &&
    reading.split("-").every((segment) => isValidReadingSegment(segment));

  const tokenizeReading = (reading) => {
    if (reading.length === 0) {
      return [];
    }

    const parts = reading.split("-");
    const tokens = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      tokens.push(
        wrapToken(
          part.startsWith("_")
            ? "reading reading-latin"
            : "reading reading-bpmf",
          part,
        ),
      );
      if (i < parts.length - 1) {
        tokens.push(wrapToken("separator separator-hyphen", "-"));
      }
    }
    return tokens;
  };

  const tokenizeLine = (line) => {
    if (/^\s*#/.test(line)) {
      return [wrapToken("comment", line)];
    }

    const match = line.match(/^(\S+)(\s+)(\S.*)$/);
    if (!match) {
      return [wrapToken("error", line)];
    }

    const [, phrase, spacing, reading] = match;
    if (!isValidReading(reading)) {
      return [wrapToken("error", line)];
    }

    return [
      wrapToken("phrase", phrase),
      wrapToken("separator separator-space", spacing),
      ...tokenizeReading(reading),
    ];
  };

  const renderHtml = (text) =>
    text
      .split("\n")
      .map((line) =>
        tokenizeLine(line)
          .map(
            (token) =>
              `<span class="syntax-token syntax-token-${token.type}">${escapeHtml(token.value)}</span>`,
          )
          .join(""),
      )
      .join("\n");

  const api = {
    tokenizeLine,
    renderHtml,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.phraseSyntaxHighlighter = api;
})(typeof window !== "undefined" ? window : globalThis);
