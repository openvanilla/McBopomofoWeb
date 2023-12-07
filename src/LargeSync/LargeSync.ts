import { compressToBase64, decompressFromBase64 } from "lz-string";

export class LargeSync {
  private keyPrefix = "LS";
  readonly maxBytes = chrome.storage.sync.QUOTA_BYTES;
  readonly maxBytesPerKey = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
  readonly version = "1.0";

  split(obj: any, maxLength: number): object {
    if (typeof maxLength === "undefined") {
      maxLength = this.maxBytesPerKey;
    }
    var keys = this.getKeys(obj);
    var ret: { [k: string]: any } = {};

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (obj.hasOwnProperty(key)) {
        var str = compressToBase64(JSON.stringify(obj[key]));
        var max = this.calculateMaxLength(key, maxLength);
        var j = 0;

        for (
          var offset = 0, strLen = str.length;
          offset < strLen;
          offset += max, j++
        ) {
          ret[this.getStorageKey(key, j + "")] = str.substring(
            offset,
            offset + max
          );
        }
        ret[this.getStorageKey(key, "meta")] = {
          key: key,
          min: 0,
          max: j,
          hash: this.basicHash(str),
          largeSyncVersion: this.version,
        };
      }
    }
    return ret;
  }

  reconstruct(
    splitObjects: any,
    inKeys: string[] | undefined = undefined
  ): { [k: string]: any } {
    var keys: string[] = [];
    if (typeof inKeys === "undefined") {
      keys = this.extractKeys(splitObjects);
    } else {
      keys = inKeys as string[];
    }
    var ret: { [k: string]: any } = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var rejoined = "",
        meta = splitObjects[this.getStorageKey(key, "meta")];

      if (meta !== "undefined") {
        for (var j = 0; j < meta.max; j++) {
          if (
            typeof splitObjects[this.getStorageKey(key, j + "")] === "undefined"
          ) {
            throw Error(
              "[largeSync] - partial string missing, object cannot be reconstructed."
            );
          }
          rejoined += splitObjects[this.getStorageKey(key, j + "")];
        }
        ret[key] = JSON.parse(decompressFromBase64(rejoined));
      }
    }
    return ret;
  }

  getStorageKey(key: string, postfix: string): string {
    return this.keyPrefix + "__" + key + "." + postfix;
  }

  getRequestKeys(keys: string[]): string[] {
    var re = [];
    for (var i = 0; i < this.getKeys(keys).length; i++) {
      var key = keys[i];

      for (var j = 0; j < this.maxBytes / this.maxBytesPerKey; j++) {
        re.push(this.getStorageKey(key, j + ""));
      }
      re.push(this.getStorageKey(key, "meta"));
    }
    return re;
  }

  calculateMaxLength(key: string, maxLength: number) {
    return maxLength - (this.keyPrefix.length + key.length + 10);
  }

  getKeys(keys: any): string[] {
    if (keys instanceof Array) {
      return keys;
    }

    if (keys instanceof Object) {
      return Object.keys(keys);
    }

    throw TypeError(
      "[largeSync] - " + keys + ' must be of type "Object", "Array" or "string"'
    );
  }

  extractKeys(splitObjects: any): string[] {
    var ret = Object.keys(splitObjects)
      .map((x) => {
        var match = x.match(this.keyPrefix + "__(.*?).meta");
        if (match !== null) {
          return match[1];
        }
      })
      .filter((x) => x !== undefined);
    return ret as string[];
  }

  basicHash(str: string) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  get(keys: string[], callback: (arg: { [k: string]: any }) => void) {
    var reqKeys = null;

    if (keys !== null) {
      var objKeys = this.getKeys(keys);
      reqKeys = this.getRequestKeys(objKeys);
    }
    chrome.storage.sync.get(reqKeys, (items) => {
      var x = this.reconstruct(items);
      callback(x);
    });
  }

  set(items: { [k: string]: any }, callback: () => void) {
    if (
      items === null ||
      typeof items === "string" ||
      items.constructor.name === "Array"
    ) {
      // will throw error from "extensions::schemaUtils"
      chrome.storage.sync.set(items, callback);
    } else {
      var splitItems = this.split(items, this.maxBytesPerKey);

      var splitKeys = this.getKeys(splitItems);
      var reqKeys = this.getRequestKeys(this.getKeys(items));
      var removeKeys = reqKeys.filter(function (x) {
        return splitKeys.indexOf(x) < 0;
      });

      //remove keys that are no longer in use
      chrome.storage.sync.remove(removeKeys);
      chrome.storage.sync.set(splitItems, callback);
    }
  }

  remove(keys: string[], callback: () => void) {
    var removeKeys = this.getRequestKeys(this.getKeys(keys));
    chrome.storage.sync.remove(removeKeys, callback);
  }

  getBytesInUse(keys: string[], callback: () => void) {
    if (keys === null) {
      chrome.storage.sync.getBytesInUse(null, callback);
    } else {
      var objectKeys = this.getRequestKeys(this.getKeys(keys));
      chrome.storage.sync.getBytesInUse(objectKeys, callback);
    }
  }

  clear(callback: () => void): void {
    chrome.storage.sync.clear(callback);
  }

  getKeyPrefix(): string {
    return this.keyPrefix;
  }

  setKeyPrefix(val: string): void {
    this.keyPrefix = val;
  }
}
