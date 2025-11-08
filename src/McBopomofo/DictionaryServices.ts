import { Empty, InputState } from "./InputState";
import { LocalizedStrings } from "./LocalizedStrings";

/**
 * Represents a dictionary service.
 *
 * When a user select a candidate in the candidate window, or marks a range in
 * the composing buffer, the user can press the query key to select a dictionary
 * service to know better about the candidate or the marked range.
 */
abstract class DictionaryService {
  /** Name if the dictionary service. */
  abstract readonly name: string;
  /**
   * Look up the phrase in the dictionary service
   * @param phrase The phrase to look up
   * @param state The current input state. The dictionary service can use it to
   * ask the input controller to go to the previous input state if the user
   * cancels the action to look up a phrase.
   * @param serviceIndex The index of the dictionary service in a list.
   * @param stateCallback The function to call when the dictionary service wants
   * to change the input state.
   */
  abstract lookUp(
    phrase: string,
    state: InputState,
    serviceIndex: number,
    stateCallback: (state: InputState) => void
  ): boolean;
  /**
   * The text displayed in the menu that let the users to choose a dictionary
   * service.
   * @param selectedString The phrase to look up.
   * @param localizedStrings The object as a container that contains the
   * localized strings.
   */
  abstract textForMenu(
    selectedString: string,
    localizedStrings: LocalizedStrings
  ): string;
}

/** The dictionary services that launch the web browser and open a URL.  */
class HttpBasedDictionary implements DictionaryService {
  readonly name: string;
  readonly urlTemplate: string;
  private onOpenUrl: (input: string) => void;

  /* istanbul ignore next */
  constructor(
    name: string,
    urlTemplate: string,
    onOpenUrl: (input: string) => void
  ) {
    this.name = name;
    this.urlTemplate = urlTemplate;
    this.onOpenUrl = onOpenUrl;
  }

  /* istanbul ignore next */
  lookUp(
    phrase: string,
    state: InputState,
    serviceIndex: number,
    stateCallback: (state: InputState) => void
  ): boolean {
    const encoded = encodeURIComponent(phrase);
    const url = this.urlTemplate.replace("(encoded)", encoded);
    this.onOpenUrl(url);
    stateCallback(new Empty());
    return true;
  }

  /* istanbul ignore next */
  textForMenu(
    selectedString: string,
    localizedStrings: LocalizedStrings
  ): string {
    return localizedStrings.lookUp(selectedString, this.name);
  }
}

/*
 * The list of the dictionary services.
 *
 * In the macOS version, we put the list into a JSON file so the users can
 * easily edit the file. However, the TypeScript version of McBopomofo will be
 * compiled with Webpack, we want to put as much stuff into the compiled file as
 * possible.
 */
const httpBasedDictionaryServices = {
  services: [
    {
      name: "萌典",
      url_template: "https://www.moedict.tw/(encoded)",
    },
    {
      name: "萌典 (台語)",
      url_template: "https://www.moedict.tw/'(encoded)",
    },
    {
      name: "萌典 (客語)",
      url_template: "https://www.moedict.tw/:(encoded)",
    },
    {
      name: "Google",
      url_template: "https://www.google.com/search?q=(encoded)",
    },
    {
      name: "教育部重編國語詞典修訂本",
      url_template:
        "https://dict.revised.moe.edu.tw/search.jsp?md=1&word=(encoded)&qMd=0&qCol=1",
    },
    {
      name: "教育部國語詞典簡編本",
      url_template:
        "https://dict.concised.moe.edu.tw/search.jsp?md=1&word=(encoded)&qMd=0&qCol=0",
    },
    {
      name: "教育部成語典",
      url_template:
        "https://dict.idioms.moe.edu.tw/idiomList.jsp?idiom=(encoded)&qMd=0&qTp=1&qTp=2",
    },
    {
      name: "教育部異體字字典",
      url_template:
        "https://dict.variants.moe.edu.tw/search.jsp?QTP=0&WORD=(encoded)#searchL",
    },
    {
      name: "教育部國字標準字體筆順學習網",
      url_template:
        "https://stroke-order.learningweb.moe.edu.tw/charactersQueryResult.do?words=(encoded)&lang=zh_TW&csrfPreventionSalt=null",
    },
    {
      name: "教育部臺灣閩南語常用詞辭典",
      url_template:
        "https://sutian.moe.edu.tw/zh-hant/tshiau/?lui=tai_su&tsha=(encoded)",
    },
    {
      name: "Wiktionary",
      url_template:
        "https://zh.wiktionary.org/wiki/Special:Search?search=(encoded)",
    },
    {
      name: "康熙字典網上版",
      url_template:
        "https://www.kangxizidian.com/search/index.php?stype=Word&sword=(encoded)&detail=n",
    },
    {
      name: "Unihan Database",
      url_template:
        "https://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=(encoded)",
    },
    {
      name: "國際電腦漢字及異體字知識庫",
      url_template:
        "https://chardb.iis.sinica.edu.tw/search.jsp?q=(encoded)&stype=1",
    },
  ],
};

/** Helps to manage the dictionary service */
export class DictionaryServices {
  public readonly localizedStrings: LocalizedStrings;
  public onOpenUrl?: ((input: string) => void) | undefined;
  protected services: DictionaryService[] = [];

  /* istanbul ignore next */
  constructor(localizedStrings: LocalizedStrings) {
    this.localizedStrings = localizedStrings;
    for (let info of httpBasedDictionaryServices.services) {
      let service = new HttpBasedDictionary(
        info.name,
        info.url_template,
        (input: string) => {
          if (this.onOpenUrl != undefined) {
            this.onOpenUrl(input);
          }
        }
      );
      this.services.push(service);
    }
  }

  /**
   * Builds a menu by generating text items from all available dictionary
   * services for a given phrase.
   *
   * @param phrase - The input phrase to look up in the dictionary services
   * @returns An array of strings representing menu items for the phrase lookup
   * results
   */
  /* istanbul ignore next */
  buildMenu(phrase: string): string[] {
    const output: string[] = [];
    for (let service of this.services) {
      output.push(service.textForMenu(phrase, this.localizedStrings));
    }
    return output;
  }

  /**
   * Performs a dictionary lookup using the specified service at the given
   * index.
   * @param phrase - The text string to look up in the dictionary
   * @param index - The index of the dictionary service to use
   * @param state - The current input state
   * @param stateCallback - Callback function to handle state updates
   * @returns {boolean} True if lookup was performed, false if index is out of
   * bounds
   */
  /* istanbul ignore next */
  lookup(
    phrase: string,
    index: number,
    state: InputState,
    stateCallback: (state: InputState) => void
  ): boolean {
    let service = this.services[index];
    if (index >= this.services.length) {
      return false;
    }
    service.lookUp(phrase, state, index, stateCallback);
    return true;
  }
}
