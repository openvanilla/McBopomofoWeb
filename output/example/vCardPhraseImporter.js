(function (globalScope) {
  const cjkPattern = /[\u3400-\u9fff\uf900-\ufaff]/;

  const unescapeVCardValue = (value) =>
    value
      .replace(/\\n/gi, "\n")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\\\\/g, "\\");

  const decodeQuotedPrintable = (value) => {
    const bytes = [];
    for (let index = 0; index < value.length; index += 1) {
      const current = value[index];
      if (
        current === "=" &&
        index + 2 < value.length &&
        /^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))
      ) {
        bytes.push(parseInt(value.slice(index + 1, index + 3), 16));
        index += 2;
      } else {
        bytes.push(current.charCodeAt(0));
      }
    }
    return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  };

  const decodeValue = (rawValue, metadata) => {
    const normalized = rawValue.replace(/=\r?\n/g, "");
    const hasQuotedPrintable = metadata.some(
      (item) => item.toUpperCase() === "ENCODING=QUOTED-PRINTABLE",
    );
    const decoded = hasQuotedPrintable
      ? decodeQuotedPrintable(normalized)
      : normalized;
    return unescapeVCardValue(decoded).trim();
  };

  const unfoldLines = (text) =>
    text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n[ \t]/g, "");

  const parseProperty = (line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0) {
      return null;
    }

    const descriptor = line.slice(0, separatorIndex);
    const rawValue = line.slice(separatorIndex + 1);
    const segments = descriptor.split(";");
    const propertyName = segments[0].split(".").pop().toUpperCase();

    return {
      propertyName,
      metadata: segments.slice(1),
      rawValue,
    };
  };

  const extractNameFromCard = (cardText) => {
    const lines = cardText.split("\n");
    let fnValue = "";
    let nValue = "";

    for (const line of lines) {
      const property = parseProperty(line);
      if (!property) {
        continue;
      }

      if (property.propertyName === "FN" && !fnValue) {
        fnValue = decodeValue(property.rawValue, property.metadata);
      } else if (property.propertyName === "N" && !nValue) {
        const decoded = decodeValue(property.rawValue, property.metadata);
        const parts = decoded.split(";");
        nValue = `${parts[0] || ""}${parts[1] || ""}`.trim();
      }
    }

    if (cjkPattern.test(nValue)) {
      return nValue;
    }
    if (cjkPattern.test(fnValue)) {
      return fnValue.replace(/\s+/g, "");
    }
    return "";
  };

  const extractChineseNamesFromVCard = (text) => {
    const unfolded = unfoldLines(text);
    const cards = unfolded.match(/BEGIN:VCARD[\s\S]*?END:VCARD/gi) || [];
    const names = [];
    const seen = new Set();

    for (const card of cards) {
      const name = extractNameFromCard(card);
      if (name && !seen.has(name)) {
        names.push(name);
        seen.add(name);
      }
    }

    return names;
  };

  const api = {
    extractChineseNamesFromVCard,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.vCardPhraseImporter = api;
})(typeof window !== "undefined" ? window : globalThis);
