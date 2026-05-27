import {
  BopomofoBrailleConverter,
  BopomofoSyllable as BrailleBopomofoSyllable,
  BrailleType,
} from "../BopomofoBraille";
import { ReadingGrid } from "../Gramambular2";
import {
  BopomofoCharacterMap,
  BopomofoKeyboardLayout,
  BopomofoSyllable as MandarinBopomofoSyllable,
} from "../Mandarin";
import { VariantAnnotator } from "./VariantAnnotator";
import { webBpmfvsPua } from "./WebBpmfvsPua";
import { webBpmfvsVariants } from "./WebBpmfvsVariants";
import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

const ChineseConvert = require("chinese_convert");

/**
 * The text conversion service used in the Chrome Extension and the MCP server.
 *
 * The service provides the following functions:
 *  - Convert Taiwanese Braille to text
 *  - Convert ASCII Braille to text
 *  - Convert text to Bopomofo readings
 *  - Convert text to Hanyu Pinyin
 *  - Convert text to HTML Ruby
 *  - Convert text to Taiwanese Braille
 *  - Convert text to ASCII Braille
 *  - Convert text to Bopomofo annotated text (for Bopomofo annotation fonts)
 *  - Annotate a single character with its Bopomofo reading
 *
 * @example
 * ``` typescript
 * const service = new Service();
 * const braille = service.convertTextToBraille("小麥注音");
 * const pinyin = service.convertTextToPinyin("中文");
 * const ruby = service.convertTextToHtmlRuby("注音");
 * ```
 */
export class Service {
  private lm_: WebLanguageModel;
  private grid_: ReadingGrid;
  private vs_: VariantAnnotator;

  constructor() {
    this.lm_ = new WebLanguageModel(webData);
    this.grid_ = new ReadingGrid(this.lm_);
    this.vs_ = new VariantAnnotator(webBpmfvsPua, webBpmfvsVariants);
  }

  /**
   * Sets the user phrases to the language model.
   * @param input The map of user phrases.
   */
  public setUserPhrases(input: Map<string, string[]> | string): void {
    this.lm_.setUserPhrases(input);
  }

  /**
   * Sets phrases to exclude from the language model suggestions.
   *
   * @param input The map of user phrases.
   */
  public setExcludedPhrases(input: Map<string, string[]> | string): void {
    this.lm_.setExcludedPhrases(input);
  }

  private convertTextInternal(
    input: string,
    readingCallback: (reading: string, value: string) => string,
    nonReadingCallback: (input: string) => string,
    addingSpaceBetweenChineseAndOtherTypes = false, // Braille needs additional space between Chinese characters, letters and digits.
    addingSpaceBetweenChinese = false
  ): string {
    let output: string = "";
    const converted = ChineseConvert.cn2tw(input);
    const length = converted.length;
    let readHead = 0;
    let pendingText = "";

    const isASCII = (input: string): boolean => {
      return /^[\x00-\x7F]*$/.test(input);
    };

    while (readHead < length) {
      const targetLength = Math.min(6, length - readHead);
      let found = false;
      for (let i = targetLength; i > 0; i--) {
        const end = readHead + i;
        const subString = converted.substring(readHead, end);
        const reading = this.lm_.getReading(subString);
        if (reading !== undefined) {
          if (reading.startsWith("_")) {
            // Punctuation
            if (
              addingSpaceBetweenChineseAndOtherTypes &&
              output.length > 0 &&
              pendingText.length === 0 &&
              isASCII(subString.charAt(0))
            ) {
              pendingText += " ";
            }
            pendingText += subString;
          } else {
            if (pendingText.length > 0) {
              output += nonReadingCallback(pendingText);
              if (
                addingSpaceBetweenChineseAndOtherTypes &&
                isASCII(pendingText.charAt(pendingText.length - 1))
              ) {
                output += " ";
              }
              pendingText = "";
            }

            const components = reading.split("-");

            if (addingSpaceBetweenChinese && readHead > 0) {
              output += " ";
            }

            if (components.length === subString.length) {
              const converted = [];
              for (let i = 0; i < components.length; i++) {
                const component = components[i];
                const char = subString.charAt(i);
                converted.push(readingCallback(component, char));
              }
              output += converted.join(addingSpaceBetweenChinese ? " " : "");
            } else {
              output += readingCallback(components.join(" "), subString);
            }
          }
          readHead = end;
          found = true;
          break;
        }
      }

      if (!found) {
        const subString = converted.charAt(readHead);
        if (
          addingSpaceBetweenChineseAndOtherTypes &&
          output.length > 0 &&
          pendingText.length === 0 &&
          isASCII(subString)
        ) {
          pendingText += " ";
        }

        pendingText += subString;
        readHead += 1;
      }
    }

    if (pendingText.length > 0) {
      if (
        addingSpaceBetweenChineseAndOtherTypes &&
        output.length > 0 &&
        pendingText.length === 0 &&
        isASCII(pendingText)
      ) {
        pendingText += " ";
      }

      output += nonReadingCallback(pendingText);
      pendingText = "";
    }

    return output;
  }

  private convertText(
    input: string,
    readingCallback: (reading: string, value: string) => string,
    nonReadingCallback: (input: string) => string,
    addingSpaceBetweenChineseAndOtherTypes = false, // Braille needs additional space between Chinese characters, letters and digits.
    addingSpaceBetweenChinese = false
  ): string {
    const lines = input.split("\n");
    const convertedLines = lines.map((line) =>
      this.convertTextInternal(
        line,
        readingCallback,
        nonReadingCallback,
        addingSpaceBetweenChineseAndOtherTypes,
        addingSpaceBetweenChinese
      )
    );
    return convertedLines.join("\n");
  }

  private convertBrailleToTextInternal(
    input: string,
    type: BrailleType
  ): string {
    let output: string = "";
    const tokens = BopomofoBrailleConverter.convertBrailleToTokens(input, type);
    // console.log(tokens);
    for (const token of tokens) {
      if (token instanceof BrailleBopomofoSyllable) {
        this.grid_.insertReading(token.bpmf);
      } else {
        const result = this.grid_.walk();
        for (const node of result.nodes) {
          output += node.value;
        }
        this.grid_.clear();
        output += token;
      }
    }

    const result = this.grid_.walk();
    for (const node of result.nodes) {
      output += node.value;
    }
    this.grid_.clear();
    return output;
  }

  /**
   * Converts Taiwanese Braille to text.
   * @param input The Unicode Braille input.
   * @returns The text output
   * @example
   * ``` typescript
   * const service = new Service();
   * const input = "⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄⠊⠌⠄⠛⠌⠐⠟⠜⠈";
   * const output = service.convertBrailleToText(input);
   * ```
   */
  public convertBrailleToText(input: string): string {
    const lines = input.split("\n");
    const convertedLines = lines.map((line) =>
      this.convertBrailleToTextInternal(line, BrailleType.UNICODE)
    );
    return convertedLines.join("\n");
  }

  /**
   * Converts ASCII Braille to text.
   * @param input The ASCII Braille input.
   * @returns The text output
   * @example
   * ``` typescript
   * const service = new Service();
   * const input = "e{`mw\"a/\"?'i/'g/\"q>`";
   * const output = service.convertAsciiBrailleToText(input);
   * ```
   */
  public convertAsciiBrailleToText(input: string): string {
    const lines = input.split("\n");
    const convertedLines = lines.map((line) =>
      this.convertBrailleToTextInternal(line, BrailleType.ASCII)
    );
    return convertedLines.join("\n");
  }

  private convertTextToBrailleInternal(
    input: string,
    type: BrailleType
  ): string {
    return this.convertText(
      input,
      (reading: string, _: string) => {
        return BopomofoBrailleConverter.convertBpmfToBraille(reading, type);
      },
      (input: string) => {
        return BopomofoBrailleConverter.convertBpmfToBraille(input, type);
      },
      true
    );
  }

  /**
   * Converts text to Taiwanese Braille.
   * @param input The text input
   * @returns The Braille output
   * @example
   * ``` typescript
   * const service = new Service();
   * const input = "小麥注音輸入法";
   * const output = service.convertTextToBraille(input);
   * ```
   */
  public convertTextToBraille(input: string): string {
    return this.convertTextToBrailleInternal(input, BrailleType.UNICODE);
  }

  /**
   * Converts text to ASCII Braille.
   * @param input The text input
   * @returns The Braille output
   * @example
   * ``` typescript
   * const service = new Service();
   * const input = "小麥注音輸入法";
   * const output = service.convertTextToAsciiBraille(input);
   * ```
   */
  public convertTextToAsciiBraille(input: string): string {
    return this.convertTextToBrailleInternal(input, BrailleType.ASCII);
  }

  /**
   * Converts text to HTML Ruby
   * @param input The text input
   * @returns The HTML Ruby output
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.convertTextToHtmlRuby(input);
   * ```
   */
  public convertTextToHtmlRuby(input: string): string {
    return this.convertText(
      input,
      (reading: string, value: string) => {
        let composed = "<ruby>";
        composed += value;
        composed += "<rp>(</rp><rt>" + reading + "</rt><rp>)</rp>";
        composed += "</ruby>";
        return composed;
      },
      (input: string) => {
        return input;
      }
    );
  }

  /**
   * Converts text to Bopomofo readings.
   * @param input The text input
   * @returns The Bopomofo output
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.convertTextToBpmfReadings(input);
   * ```
   */
  public convertTextToBpmfReadings(input: string): string {
    return this.convertText(
      input,
      (reading: string, value: string) => {
        return reading;
      },
      (input: string) => {
        return input;
      }
    );
  }

  /**
   * Converts text to Bopomofo annotated text.
   * @param input The text input
   * @returns The annotated text output
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.convertTextToBpmfAnnotatedText(input);
   * ```
   */
  public convertTextToBpmfAnnotatedText(input: string): string {
    return this.convertText(
      input,
      (reading: string, value: string) => {
        let valueComponents = value.split("");
        let readings = reading.split("-");
        const result = this.vs_.annotate(valueComponents, readings);
        return result.annotatedString;
      },
      (input: string) => {
        return input;
      }
    );
  }

  /**
   * Converts text to raw Bopomofo readings.
   * @param input The text input
   * @returns The raw Bopomofo output
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音";
   * let output = service.convertTextToRawReadings(input);
   * ```
   */
  public convertTextToRawReadings(input: string): string {
    let output = this.convertText(
      input,
      (reading: string, value: string) => {
        return reading + "-";
      },
      (input: string) => {
        return input;
      }
    );
    if (output.endsWith("-")) {
      output = output.substring(0, output.length - 1);
    }
    return output;
  }

  /**
   * Appends Bopomofo readings to the input text.
   * @param input The input text.
   * @returns The text with Bopomofo readings appended.
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.appendBpmfReadingsToText(input);
   * ```
   */
  public appendBpmfReadingsToText(input: string): string {
    return this.convertText(
      input,
      (reading: string, value: string) => {
        return value + "(" + reading + ")";
      },
      (input: string) => {
        return input;
      }
    );
  }

  /**
   * Converts Chinese text to Hanyu Pinyin representation.
   *
   * This method takes Chinese text as input and returns its romanized form in
   * Hanyu Pinyin. The conversion processes each character individually,
   * converting Bopomofo readings to Pinyin syllables.
   *
   * @param input - The Chinese text string to be converted to Pinyin
   * @returns A string containing the Hanyu Pinyin representation of the input
   *          text, with syllables separated by spaces
   *
   * @example
   * ``` typescript
   * const service = new Service();
   * const pinyin = service.convertTextToPinyin("中文");
   * // Returns: "zhong wen"
   * ```
   */
  public convertTextToPinyin(input: string): string {
    return this.convertText(
      input,
      (reading: string, _: string) => {
        const pinyinComponents = [];
        const components = reading.split("-");
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          const syllable =
            MandarinBopomofoSyllable.FromComposedString(component);
          const pinyin = syllable.HanyuPinyinString(false, false);
          pinyinComponents.push(pinyin);
        }
        return pinyinComponents.join(" ");
      },
      (input: string) => {
        return input;
      },
      true,
      true
    );
  }

  /**
   * Annotates a single character with its Bopomofo reading.
   *
   * @param input - The character to be annotated.
   * @param reading - The Bopomofo reading for the character.
   * @returns The annotated string representation of the character.
   */
  public annotateSingleCharacter(input: string, reading: string): string {
    return this.vs_.annotateSingleCharacter(input, reading).annotatedString;
  }

  /**
   * Parses `input` into Bopomofo syllables, builds a temporary ReadingGrid,
   * and returns the grid together with the Viterbi walk result.
   * Shared by `generateMermaidGraph` and `getWalkResult`.
   */
  private buildAndWalk(
    input: string
  ): { walkedNodes: ReturnType<ReadingGrid["walk"]>["nodes"]; tempGrid: ReadingGrid } | null {
    const tokens = input.trim().split(/[\s-]+/).filter((t) => t.length > 0);
    const layout = BopomofoKeyboardLayout.StandardLayout;
    const syllables: string[] = [];

    for (const token of tokens) {
      let isBpmf = false;
      for (let i = 0; i < token.length; i++) {
        if (BopomofoCharacterMap.sharedInstance.characterToComponent.has(token.charAt(i))) {
          isBpmf = true;
          break;
        }
      }
      if (isBpmf) {
        const syllable = MandarinBopomofoSyllable.FromComposedString(token);
        syllables.push(!syllable.isEmpty ? syllable.composedString : token);
      } else {
        const syllable = layout.syllableFromKeySequence(token);
        syllables.push(!syllable.isEmpty ? syllable.composedString : token);
      }
    }

    if (syllables.length === 0) return null;

    const tempGrid = new ReadingGrid(this.lm_);
    for (const syllable of syllables) {
      tempGrid.insertReading(syllable);
    }

    const walkResult = tempGrid.walk();
    return { walkedNodes: walkResult.nodes, tempGrid };
  }

  /**
   * Returns the Viterbi-selected text and its total log-probability score
   * for the given Bopomofo (or keyboard-sequence) input.
   */
  public getWalkResult(input: string): { text: string; score: number } {
    const built = this.buildAndWalk(input);
    if (!built) return { text: "", score: 0 };
    const text = built.walkedNodes.map((n) => n.value).join("");
    const score = built.walkedNodes.reduce((acc, n) => acc + n.score, 0);
    return { text, score };
  }

  private getComponentClass(syllable: MandarinBopomofoSyllable): number {
    if (syllable.hasToneMarker) return 4;
    if (syllable.hasVowel) return 3;
    if (syllable.hasMiddleVowel) return 2;
    if (syllable.hasConsonant) return 1;
    return 0;
  }

  /**
   * Tokenizes a continuous Bopomofo string into an array of valid Bopomofo syllables and other characters.
   */
  private tokenizeBopomofo(input: string): string[] {
    const tokens: string[] = [];
    let currentSyllable = new MandarinBopomofoSyllable(0);
    let currentStr = "";

    for (let i = 0; i < input.length; i++) {
      const char = input.charAt(i);
      const component =
        BopomofoCharacterMap.sharedInstance.characterToComponent.get(char);

      if (component !== undefined) {
        const nextSyllable = new MandarinBopomofoSyllable(component);
        const currentMaxClass = this.getComponentClass(currentSyllable);
        const nextClass = this.getComponentClass(nextSyllable);

        // A new syllable starts if the next component's class is less than or equal to the current max class.
        // For example, if we already have a vowel (class 3) and the next component is a consonant (class 1),
        // it must belong to a new syllable, because Bopomofo components follow a strict order.
        if (currentMaxClass > 0 && nextClass <= currentMaxClass) {
          tokens.push(currentStr);
          currentSyllable = new MandarinBopomofoSyllable(component);
          currentStr = char;
        } else {
          currentSyllable.addEqual(nextSyllable);
          currentStr += char;
        }
      } else {
        if (currentStr.length > 0) {
          tokens.push(currentStr);
          currentStr = "";
          currentSyllable.clear();
        }
        tokens.push(char);
      }
    }

    if (currentStr.length > 0) {
      tokens.push(currentStr);
    }

    return tokens;
  }

  /**
   * Converts a Bopomofo string (optionally containing continuous syllables) to Chinese text.
   */
  public convertBpmfToText(input: string): string {
    const tokens = this.tokenizeBopomofo(input);
    const tempGrid = new ReadingGrid(this.lm_);
    let text = "";

    for (const token of tokens) {
      if (token === " ") continue; // Ignore space as it acts as an implicit Tone 1 marker

      let isBpmf = false;
      for (let i = 0; i < token.length; i++) {
        if (BopomofoCharacterMap.sharedInstance.characterToComponent.has(token.charAt(i))) {
          isBpmf = true;
          break;
        }
      }
      
      if (isBpmf) {
        const syllable = MandarinBopomofoSyllable.FromComposedString(token);
        tempGrid.insertReading(!syllable.isEmpty ? syllable.composedString : token);
      } else {
        // Walk the grid for existing syllables, append Chinese text, then append the non-Bpmf character
        const result = tempGrid.walk();
        text += result.nodes.map((n) => n.value).join("");
        tempGrid.clear();
        text += token;
      }
    }
    
    const result = tempGrid.walk();
    text += result.nodes.map((n) => n.value).join("");
    return text;
  }

  /**
   * Generates a Mermaid graph representing candidate selections.
   */
  public generateMermaidGraph(input: string): string {
    const built = this.buildAndWalk(input);
    if (!built) return "graph LR\n  empty((Empty))";
    const { walkedNodes, tempGrid } = built;

    const walkedSegments: { start: number; end: number; node: any }[] = [];
    let currentIdx = 0;
    for (const walkedNode of walkedNodes) {
      walkedSegments.push({
        start: currentIdx,
        end: currentIdx + walkedNode.spanningLength,
        node: walkedNode,
      });
      currentIdx += walkedNode.spanningLength;
    }

    let mermaid = "graph LR\n";
    for (let i = 0; i <= tempGrid.length; i++) {
      mermaid += `  V${i}((V${i}))\n`;
    }

    interface Edge {
      from: number;
      to: number;
      label: string;
      isWalked: boolean;
    }
    const edges: Edge[] = [];

    for (let i = 0; i < tempGrid.length; i++) {
      const span = tempGrid.spans[i];
      for (let len = 1; len <= span.maxLength; len++) {
        const node = span.nodeOf(len);
        if (!node) continue;

        const isWalked = walkedSegments.some(
          (seg) => seg.start === i && seg.end === i + len && seg.node === node
        );

        const value = node.value;
        const score = node.score;
        const label = `${value} ${score.toFixed(2)}`;

        edges.push({
          from: i,
          to: i + len,
          label,
          isWalked,
        });
      }
    }

    edges.forEach((edge) => {
      mermaid += `  V${edge.from} -->|"${edge.label}"| V${edge.to}\n`;
    });

    mermaid += "\n  classDef selected stroke:#e7000b,stroke-width:3px;\n";

    const selectedVertices = new Set<number>([0]);
    let accum = 0;
    for (const walkedNode of walkedNodes) {
      accum += walkedNode.spanningLength;
      selectedVertices.add(accum);
    }

    const selectedList: string[] = [];
    const stateList: string[] = [];
    for (let i = 0; i <= tempGrid.length; i++) {
      if (selectedVertices.has(i)) {
        selectedList.push(`V${i}`);
      } else {
        stateList.push(`V${i}`);
      }
    }

    if (selectedList.length > 0) {
      mermaid += `  class ${selectedList.join(",")} selected;\n`;
    }
    if (stateList.length > 0) {
      mermaid += `  class ${stateList.join(",")} state;\n`;
    }

    mermaid += "\n";
    edges.forEach((edge, idx) => {
      mermaid += `  %% Link ${idx}: V${edge.from}->V${edge.to}\n`;
    });

    const walkedLinkIndices = edges
      .map((edge, idx) => (edge.isWalked ? idx : -1))
      .filter((idx) => idx !== -1);

    if (walkedLinkIndices.length > 0) {
      mermaid += `\n  %% Highlight Link ${walkedLinkIndices.join(" & ")}\n`;
      mermaid += `  linkStyle ${walkedLinkIndices.join(",")} stroke:#e7000b,stroke-width:3px,fill:none;\n`;
    }
    console.log(mermaid);
    return mermaid;
  }
}
