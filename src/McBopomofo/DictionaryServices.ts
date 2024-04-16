import { Empty, InputState } from "./InputState";
import { LocalizedStrings } from "./LocalizedStrings";

abstract class DictionaryService {
  abstract readonly name: string;
  abstract lookUp(
    phrase: string,
    state: InputState,
    serviceIndex: number,
    stateCallback: (state: InputState) => void
  ): boolean;
  abstract textForMenu(
    selectedString: string,
    localizedStrings: LocalizedStrings
  ): string;
}

class HttpBasedDictionary implements DictionaryService {
  readonly name: string;
  readonly urlTemplate: string;
  private onOpenUrl: (input: string) => void;

  constructor(
    name: string,
    urlTemplate: string,
    onOpenUrl: (input: string) => void
  ) {
    this.name = name;
    this.urlTemplate = urlTemplate;
    this.onOpenUrl = onOpenUrl;
  }

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

  textForMenu(
    selectedString: string,
    localizedStrings: LocalizedStrings
  ): string {
    return localizedStrings.lookUp(selectedString, this.name);
  }
}

let httpBasedDictionaryServices = {
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
        "https://dict.revised.moe.edu.tw/search.jsp?md=1&word=(encoded)",
    },
    {
      name: "教育部國語詞典簡編本",
      url_template:
        "https://dict.concised.moe.edu.tw/search.jsp?md=1&word=(encoded)",
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

export class DictionaryServices {
  readonly localizedStrings: LocalizedStrings;
  onOpenUrl?: ((input: string) => void) | undefined;

  protected services: DictionaryService[] = [];
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

  buildMenu(phrase: string): string[] {
    let output: string[] = [];
    for (let service of this.services) {
      output.push(service.textForMenu(phrase, this.localizedStrings));
    }
    return output;
  }

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
