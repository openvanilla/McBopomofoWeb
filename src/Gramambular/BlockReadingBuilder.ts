import { LanguageModel } from "./LanguageModel";

export class BlockReadingBuilder {
  protected static MaximumBuildSpanLength_: number = 6;
  protected cursorIndex_: number = 0;
  protected readings_: string[] = [];
  protected LM_?: LanguageModel;
  protected joinSeparator_: string = "-";
}
