(function (globalScope) {
  const cjkPattern = /[\u3400-\u9fff\uf900-\ufaff]/;

  const unescapeVCardValue = (value) =>
    value
      .replace(/\\n/gi, "\n")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\\\\/g, "\\");

  const normalizeCsvValue = (value) => value.replace(/^\uFEFF/, "").trim();

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

  const normalizePhrase = (value) =>
    value.replace(/[\s,，]+/g, "").trim();

  const toValidPhrase = (value) => {
    const normalized = normalizePhrase(value);
    if (normalized.length <= 1 || !cjkPattern.test(normalized)) {
      return "";
    }
    return normalized;
  };

  const extractNameFromCard = (cardText) => {
    const lines = cardText.split("\n");
    let fnValue = "";
    let lastName = "";
    let firstName = "";

    for (const line of lines) {
      const property = parseProperty(line);
      if (!property) {
        continue;
      }

      if (property.propertyName === "FN" && !fnValue) {
        fnValue = decodeValue(property.rawValue, property.metadata);
      } else if (property.propertyName === "N" && !lastName && !firstName) {
        const decoded = decodeValue(property.rawValue, property.metadata);
        const parts = decoded.split(";");
        lastName = parts[0] || "";
        firstName = parts[1] || "";
      }
    }

    const fullNameFromN = toValidPhrase(`${lastName}${firstName}`);
    const firstNameOnly = toValidPhrase(firstName);
    if (fullNameFromN) {
      return {
        fullName: fullNameFromN,
        firstName: firstNameOnly,
      };
    }
    const fullNameFromFn = toValidPhrase(fnValue);
    if (fullNameFromFn) {
      return {
        fullName: fullNameFromFn,
        firstName: "",
      };
    }
    return null;
  };

  const parseCsv = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const current = text[index];

      if (inQuotes) {
        if (current === '"') {
          if (text[index + 1] === '"') {
            field += '"';
            index += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += current;
        }
        continue;
      }

      if (current === '"') {
        inQuotes = true;
      } else if (current === ",") {
        row.push(field);
        field = "";
      } else if (current === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (current !== "\r") {
        field += current;
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    return rows
      .map((currentRow) => currentRow.map((value) => normalizeCsvValue(value)))
      .filter((currentRow) => currentRow.some((value) => value.length > 0));
  };

  const getCsvField = (row, headerMap, names) => {
    for (const name of names) {
      const index = headerMap.get(name);
      if (index !== undefined) {
        return row[index] || "";
      }
    }
    return "";
  };

  const extractNameFromCsvRow = (row, headerMap) => {
    const givenName = getCsvField(row, headerMap, ["given name", "first name"]);
    const additionalName = getCsvField(row, headerMap, [
      "additional name",
      "middle name",
    ]);
    const familyName = getCsvField(row, headerMap, ["family name", "last name"]);
    const fullName = getCsvField(row, headerMap, ["name", "full name"]);

    const fullNameFromParts = toValidPhrase(
      `${familyName}${givenName}${additionalName}`,
    );
    const firstNameOnly = toValidPhrase(`${givenName}${additionalName}`);
    if (fullNameFromParts) {
      return {
        fullName: fullNameFromParts,
        firstName: firstNameOnly,
      };
    }

    const fullNameFromSingleField = toValidPhrase(fullName);
    if (fullNameFromSingleField) {
      return {
        fullName: fullNameFromSingleField,
        firstName: firstNameOnly,
      };
    }

    return null;
  };

  const extractImportPhrasesFromCsv = (
    text,
    { includeFirstNamePhrases = false } = {},
  ) => {
    const rows = parseCsv(text);
    if (rows.length < 2) {
      return [];
    }

    const headers = rows[0].map((header) => header.toLowerCase());
    const headerMap = new Map(
      headers.map((header, index) => [header, index]),
    );
    const phrases = [];
    const seen = new Set();

    for (const row of rows.slice(1)) {
      const entry = extractNameFromCsvRow(row, headerMap);
      if (!entry) {
        continue;
      }

      for (const phrase of [
        entry.fullName,
        includeFirstNamePhrases ? entry.firstName : "",
      ]) {
        if (phrase && !seen.has(phrase)) {
          phrases.push(phrase);
          seen.add(phrase);
        }
      }
    }

    return phrases;
  };

  const extractImportPhrasesFromVCard = (
    text,
    { includeFirstNamePhrases = false } = {},
  ) => {
    const unfolded = unfoldLines(text);
    const cards = unfolded.match(/BEGIN:VCARD[\s\S]*?END:VCARD/gi) || [];
    if (cards.length === 0) {
      return extractImportPhrasesFromCsv(text, {
        includeFirstNamePhrases,
      });
    }
    const phrases = [];
    const seen = new Set();

    for (const card of cards) {
      const entry = extractNameFromCard(card);
      if (!entry) {
        continue;
      }

      for (const phrase of [
        entry.fullName,
        includeFirstNamePhrases ? entry.firstName : "",
      ]) {
        if (phrase && !seen.has(phrase)) {
          phrases.push(phrase);
          seen.add(phrase);
        }
      }
    }

    return phrases;
  };

  const api = {
    extractImportPhrasesFromVCard,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.vCardPhraseImporter = api;
})(typeof window !== "undefined" ? window : globalThis);
