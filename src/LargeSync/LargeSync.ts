/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { compressToBase64, decompressFromBase64 } from "lz-string";

/**
 * A class to store large objects in chrome.storage.sync.
 * @class
 */
export class LargeSync {
  private keyPrefix = "LS";
  readonly maxBytes = chrome.storage.sync.QUOTA_BYTES;
  readonly maxBytesPerKey = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
  readonly version = "1.0";

  /**
   * Splits an object into smaller chunks to be stored in chrome.storage.sync.
   * @param obj The object to be stored.
   * @param maxLength The maximum length of each chunk.
   * @returns The object with the split chunks.
   */
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

  /**
   * Reconstructs an object from its chunks.
   * @param splitObjects The object with the split chunks.
   * @param inKeys The keys of the object to be reconstructed.
   * @returns The reconstructed object.
   */
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

  /**
   * Gets the storage key for a given key and postfix.
   * @param key The key.
   * @param postfix The postfix.
   * @returns The storage key.
   */
  getStorageKey(key: string, postfix: string): string {
    return this.keyPrefix + "__" + key + "." + postfix;
  }

  /**
   * Gets the request keys for a given set of keys.
   * @param keys The keys.
   * @returns The request keys.
   */
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

  /**
   * Calculates the maximum length of a chunk.
   * @param key The key of the chunk.
   * @param maxLength The maximum length of the chunk.
   * @returns The maximum length of the chunk.
   */
  calculateMaxLength(key: string, maxLength: number) {
    return maxLength - (this.keyPrefix.length + key.length + 10);
  }

  /**
   * Gets the keys of an object.
   * @param keys The object.
   * @returns The keys of the object.
   */
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

  /**
   * Extracts the keys from a split object.
   * @param splitObjects The split object.
   * @returns The keys of the object.
   */
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

  /**
   * A basic hash function.
   * @param str The string to be hashed.
   * @returns The hash of the string.
   */
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

  /**
   * Gets an object from chrome.storage.sync.
   * @param keys The keys of the object to be retrieved.
   * @param callback The callback function.
   */
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

  /**
   * Sets an object in chrome.storage.sync.
   * @param items The object to be stored.
   * @param callback The callback function.
   */
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

  /**
   * Removes an object from chrome.storage.sync.
   * @param keys The keys of the object to be removed.
   * @param callback The callback function.
   */
  remove(keys: string[], callback: () => void) {
    var removeKeys = this.getRequestKeys(this.getKeys(keys));
    chrome.storage.sync.remove(removeKeys, callback);
  }

  /**
   * Gets the bytes in use by an object in chrome.storage.sync.
   * @param keys The keys of the object.
   * @param callback The callback function.
   */
  getBytesInUse(keys: string[], callback: () => void) {
    if (keys === null) {
      chrome.storage.sync.getBytesInUse(null, callback);
    } else {
      var objectKeys = this.getRequestKeys(this.getKeys(keys));
      chrome.storage.sync.getBytesInUse(objectKeys, callback);
    }
  }

  /**
   * Clears all objects from chrome.storage.sync.
   * @param callback The callback function.
   */
  clear(callback: () => void): void {
    chrome.storage.sync.clear(callback);
  }

  /**
   * Gets the key prefix.
   * @returns The key prefix.
   */
  getKeyPrefix(): string {
    return this.keyPrefix;
  }

  /**
   * Sets the key prefix.
   * @param val The new key prefix.
   */
  setKeyPrefix(val: string): void {
    this.keyPrefix = val;
  }
}
