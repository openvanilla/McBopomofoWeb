export class VariantAnnotatorResult {
  constructor(
    public readonly annotatedString: string,
    public readonly hasVariantSelectors: boolean,
    public readonly hasPUACodePoints: boolean
  ) {}
}

export class VariantAnnotatorCombinedResult {
  constructor(
    public annotatedString: string,
    public accumulatedStringLength: number[],
    public hasVariantSelectors: boolean,
    public hasPUACodePoints: boolean
  ) {}
}

const kSeparatorChar: string = "-";
const kUnannotatedReading: string = "na";

export class VariantAnnotator {
  constructor(private puaMap: any, private variantsMap: any) {}

  private findDefaultOrAnnotatedVariant(
    value: string,
    reading: string
  ): string | undefined {
    const key = value + kSeparatorChar + reading;
    return this.variantsMap[key];
  }

  private findUnannotatedVariant(value: string): string | undefined {
    return this.findDefaultOrAnnotatedVariant(value, kUnannotatedReading);
  }

  private findCombinedPUABopomofoReading(reading: string): string | undefined {
    return this.puaMap[reading];
  }

  annotateSingleCharacter(
    value: string,
    reading: string
  ): VariantAnnotatorResult {
    let variant = this.findDefaultOrAnnotatedVariant(value, reading);
    if (variant) {
      const selectorUsed = variant !== value;
      return new VariantAnnotatorResult(variant, selectorUsed, false);
    }
    variant = this.findUnannotatedVariant(value);
    if (variant === undefined || variant === value) {
      return new VariantAnnotatorResult(value, false, false);
    }
    const puaBlock = this.findCombinedPUABopomofoReading(reading);
    if (puaBlock) {
      return new VariantAnnotatorResult(variant, true, true);
    }

    return new VariantAnnotatorResult(variant, true, false);
  }

  annotate(
    values: string[],
    readings: string[]
  ): VariantAnnotatorCombinedResult {
    if (values.length !== readings.length) {
      return new VariantAnnotatorCombinedResult("", [], false, false);
    }
    let annotatedString: string = "";
    let accumulatedStringLength: number[] = [];
    let hasVariantSelectors: boolean = false;
    let hasPUACodePoints: boolean = false;

    for (let i = 0; i < values.length; i++) {
      const result = this.annotateSingleCharacter(values[i], readings[i]);
      annotatedString += result.annotatedString;
      hasPUACodePoints = result.hasPUACodePoints || hasPUACodePoints;
      hasVariantSelectors = result.hasVariantSelectors || hasVariantSelectors;
      accumulatedStringLength.push(result.annotatedString.length);
    }
    return new VariantAnnotatorCombinedResult(
      annotatedString,
      accumulatedStringLength,
      hasVariantSelectors,
      hasPUACodePoints
    );
  }
}
