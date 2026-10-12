/** Whether a reading contains a reserved literal node, including in a phrase. */
export const containsLiteralReading = (reading: string): boolean =>
  reading.includes("_literal_");

/** Decodes a single reserved reading into its printable ASCII value. */
export const literalReadingValue = (reading: string): string | undefined => {
  if (!/^_literal_[0-9]+$/.test(reading)) {
    return undefined;
  }
  const code = Number(reading.substring(9));
  return code >= 32 && code <= 126 ? String.fromCharCode(code) : undefined;
};

/** Renders reading components for UI or export without exposing internal keys. */
export const readingForDisplay = (reading: string): string =>
  reading
    .split("-")
    .map(
      (component) =>
        literalReadingValue(component) ??
        (containsLiteralReading(component) ? "?" : component)
    )
    .join("-");
