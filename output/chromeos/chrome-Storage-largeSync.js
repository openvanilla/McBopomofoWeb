largeSync = function() {
    function split(obj, maxLength) {
        "undefined" == typeof maxLength && (maxLength = maxBytesPerKey);
        for (var keys = getKeys(obj), ret = {}, i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (obj.hasOwnProperty(key)) {
                for (var str = LZString.compressToBase64(JSON.stringify(obj[key])), max = calculateMaxLength(key, maxLength), j = 0, offset = 0, strLen = str.length; strLen > offset; offset += max, 
                j++) ret[getStorageKey(key, j)] = str.substring(offset, offset + max);
                ret[getStorageKey(key, "meta")] = {
                    key: key,
                    min: 0,
                    max: j,
                    hash: basicHash(str),
                    largeSyncversion: version
                };
            }
        }
        return ret;
    }
    function reconstruct(splitObjects, keys) {
        "undefined" == typeof keys && (keys = extractKeys(splitObjects));
        for (var ret = {}, i = 0; i < keys.length; i++) {
            var key = keys[i], rejoined = "", meta = splitObjects[getStorageKey(key, "meta")];
            if ("undefined" !== meta) {
                for (var j = 0; j < meta.max; j++) {
                    if ("undefined" == typeof splitObjects[getStorageKey(key, j)]) throw Error("[largeSync] - partial string missing, object cannot be reconstructed.");
                    rejoined += splitObjects[getStorageKey(key, j)];
                }
                ret[key] = JSON.parse(LZString.decompressFromBase64(rejoined));
            }
        }
        return ret;
    }
    function getStorageKey(key, postfix) {
        return keyPrefix + "__" + key + "." + postfix;
    }
    function getRequestKeys(keys) {
        for (var re = [], i = 0; i < getKeys(keys).length; i++) {
            for (var key = keys[i], j = 0; maxBytes / maxBytesPerKey > j; j++) re.push(getStorageKey(key, j));
            re.push(getStorageKey(key, "meta"));
        }
        return re;
    }
    function calculateMaxLength(key, maxLength) {
        return maxLength - (keyPrefix.length + key.length + 10);
    }
    function getKeys(keys) {
        if ("undefined" != typeof keys && null !== keys) {
            if ("Object" === keys.constructor.name) return Object.keys(keys);
            if ("Array" === keys.constructor.name || "string" == typeof keys) return Array.from(keys);
        }
        throw TypeError("[largeSync] - " + keys + ' must be of type "Object", "Array" or "string"');
    }
    function extractKeys(splitObjects) {
        var ret = Object.keys(splitObjects).map(function(x) {
            var match = x.match(keyPrefix + "__(.*?).meta");
            return null !== match ? match[1] : void 0;
        });
        return ret.filter(Boolean);
    }
    function basicHash(str) {
        var hash = 0;
        if (0 === str.length) return hash;
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr, hash &= hash;
        }
        return hash;
    }
    function get(keys, callback) {
        var reqKeys = null;
        if (null !== keys) {
            var objKeys = getKeys(keys);
            reqKeys = getRequestKeys(objKeys);
        }
        chromeSync.get(reqKeys, function(items) {
            var x = reconstruct(items);
            callback(x);
        });
    }
    function set(items, callback) {
        if (null === items || "string" == typeof items || "Array" === items.constructor.name) // will throw error from "extensions::schemaUtils"
        chromeSync.set(items, callback); else {
            var splitItems = split(items, maxBytesPerKey), splitKeys = getKeys(splitItems), reqKeys = getRequestKeys(getKeys(items)), removeKeys = reqKeys.filter(function(x) {
                return splitKeys.indexOf(x) < 0;
            });
            //remove keys that are no longer in use
            chromeSync.remove(removeKeys), chromeSync.set(splitItems, callback);
        }
    }
    function remove(keys, callback) {
        if (null === keys) // will throw error from "extensions::schemaUtils"
        chromeSync.remove(null, callback); else {
            var removeKeys = getRequestKeys(getKeys(keys));
            chromeSync.remove(removeKeys, callback);
        }
    }
    function getBytesInUse(keys, callback) {
        if (null === keys) chromeSync.getBytesInUse(null, callback); else {
            var objectKeys = getRequestKeys(getKeys(keys));
            chromeSync.getBytesInUse(objectKeys, callback);
        }
    }
    function clear(callback) {
        chromeSync.clear(callback);
    }
    function getkeyPrefix() {
        return keyPrefix;
    }
    function setkeyPrefix(val) {
        keyPrefix = val;
    }
    if ("undefined" == typeof chrome.storage || "undefined" == typeof chrome.storage.sync) throw Error('[largeSync] - chrome.storage.sync is undefined, check that the "storage" permission included in your manifest.json');
    var chromeSync = chrome.storage.sync, keyPrefix = "LS", maxBytes = chromeSync.QUOTA_BYTES, maxBytesPerKey = chromeSync.QUOTA_BYTES_PER_ITEM, version = "0.0.4", api = {
        QUOTA_BYTES: maxBytes,
        QUOTA_BYTES_PER_ITEM: maxBytes,
        QUOTA_BYTES_PER_KEY: maxBytesPerKey,
        MAX_ITEMS: chromeSync.MAX_ITEMS,
        MAX_WRITE_OPERATIONS_PER_HOUR: chromeSync.MAX_WRITE_OPERATIONS_PER_HOUR,
        MAX_WRITE_OPERATIONS_PER_MINUTE: chromeSync.MAX_WRITE_OPERATIONS_PER_MINUTE,
        VERSION: version,
        get: get,
        set: set,
        remove: remove,
        getBytesInUse: getBytesInUse,
        clear: clear,
        _core: {
            split: split,
            reconstruct: reconstruct,
            utils: {
                basicHash: basicHash,
                getKeys: getKeys,
                extractKeys: extractKeys,
                getStorageKey: getStorageKey,
                getRequestKeys: getRequestKeys
            }
        },
        _config: {
            getkeyPrefix: getkeyPrefix,
            setkeyPrefix: setkeyPrefix
        }
    };
    return window.chrome.storage.onChanged.addListenerlargeSync = function(callback) {}, 
    window.chrome.storage.largeSync = api, api;
}();

// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
var LZString = function() {
    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for (var i = 0; i < alphabet.length; i++) baseReverseDic[alphabet][alphabet.charAt(i)] = i;
        }
        return baseReverseDic[alphabet][character];
    }
    // private property
    var f = String.fromCharCode, keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", baseReverseDic = {}, LZString = {
        compressToBase64: function(input) {
            if (null == input) return "";
            var res = LZString._compress(input, 6, function(a) {
                return keyStrBase64.charAt(a);
            });
            switch (res.length % 4) {
              // To produce valid Base64
                default:
              // When could this happen ?
                case 0:
                return res;

              case 1:
                return res + "===";

              case 2:
                return res + "==";

              case 3:
                return res + "=";
            }
        },
        decompressFromBase64: function(input) {
            return null == input ? "" : "" == input ? null : LZString._decompress(input.length, 32, function(index) {
                return getBaseValue(keyStrBase64, input.charAt(index));
            });
        },
        compressToUTF16: function(input) {
            return null == input ? "" : LZString._compress(input, 15, function(a) {
                return f(a + 32);
            }) + " ";
        },
        decompressFromUTF16: function(compressed) {
            return null == compressed ? "" : "" == compressed ? null : LZString._decompress(compressed.length, 16384, function(index) {
                return compressed.charCodeAt(index) - 32;
            });
        },
        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function(uncompressed) {
            // 2 bytes per character
            for (var compressed = LZString.compress(uncompressed), buf = new Uint8Array(2 * compressed.length), i = 0, TotalLen = compressed.length; TotalLen > i; i++) {
                var current_value = compressed.charCodeAt(i);
                buf[2 * i] = current_value >>> 8, buf[2 * i + 1] = current_value % 256;
            }
            return buf;
        },
        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function(compressed) {
            if (null === compressed || void 0 === compressed) return LZString.decompress(compressed);
            // 2 bytes per character
            for (var buf = new Array(compressed.length / 2), i = 0, TotalLen = buf.length; TotalLen > i; i++) buf[i] = 256 * compressed[2 * i] + compressed[2 * i + 1];
            var result = [];
            return buf.forEach(function(c) {
                result.push(f(c));
            }), LZString.decompress(result.join(""));
        },
        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function(input) {
            return null == input ? "" : LZString._compress(input, 6, function(a) {
                return keyStrUriSafe.charAt(a);
            });
        },
        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function(input) {
            return null == input ? "" : "" == input ? null : (input = input.replace(/ /g, "+"), 
            LZString._decompress(input.length, 32, function(index) {
                return getBaseValue(keyStrUriSafe, input.charAt(index));
            }));
        },
        compress: function(uncompressed) {
            return LZString._compress(uncompressed, 16, function(a) {
                return f(a);
            });
        },
        _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
            if (null == uncompressed) return "";
            var i, value, ii, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, // Compensate for the first entry which should not count
            context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0;
            for (ii = 0; ii < uncompressed.length; ii += 1) if (context_c = uncompressed.charAt(ii), 
            Object.prototype.hasOwnProperty.call(context_dictionary, context_c) || (context_dictionary[context_c] = context_dictSize++, 
            context_dictionaryToCreate[context_c] = !0), context_wc = context_w + context_c, 
            Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) context_w = context_wc; else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; context_numBits > i; i++) context_data_val <<= 1, context_data_position == bitsPerChar - 1 ? (context_data_position = 0, 
                        context_data.push(getCharFromInt(context_data_val)), context_data_val = 0) : context_data_position++;
                        for (value = context_w.charCodeAt(0), i = 0; 8 > i; i++) context_data_val = context_data_val << 1 | 1 & value, 
                        context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                        context_data_val = 0) : context_data_position++, value >>= 1;
                    } else {
                        for (value = 1, i = 0; context_numBits > i; i++) context_data_val = context_data_val << 1 | value, 
                        context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                        context_data_val = 0) : context_data_position++, value = 0;
                        for (value = context_w.charCodeAt(0), i = 0; 16 > i; i++) context_data_val = context_data_val << 1 | 1 & value, 
                        context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                        context_data_val = 0) : context_data_position++, value >>= 1;
                    }
                    context_enlargeIn--, 0 == context_enlargeIn && (context_enlargeIn = Math.pow(2, context_numBits), 
                    context_numBits++), delete context_dictionaryToCreate[context_w];
                } else for (value = context_dictionary[context_w], i = 0; context_numBits > i; i++) context_data_val = context_data_val << 1 | 1 & value, 
                context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                context_data_val = 0) : context_data_position++, value >>= 1;
                context_enlargeIn--, 0 == context_enlargeIn && (context_enlargeIn = Math.pow(2, context_numBits), 
                context_numBits++), // Add wc to the dictionary.
                context_dictionary[context_wc] = context_dictSize++, context_w = String(context_c);
            }
            // Output the code for w.
            if ("" !== context_w) {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; context_numBits > i; i++) context_data_val <<= 1, context_data_position == bitsPerChar - 1 ? (context_data_position = 0, 
                        context_data.push(getCharFromInt(context_data_val)), context_data_val = 0) : context_data_position++;
                        for (value = context_w.charCodeAt(0), i = 0; 8 > i; i++) context_data_val = context_data_val << 1 | 1 & value, 
                        context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                        context_data_val = 0) : context_data_position++, value >>= 1;
                    } else {
                        for (value = 1, i = 0; context_numBits > i; i++) context_data_val = context_data_val << 1 | value, 
                        context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                        context_data_val = 0) : context_data_position++, value = 0;
                        for (value = context_w.charCodeAt(0), i = 0; 16 > i; i++) context_data_val = context_data_val << 1 | 1 & value, 
                        context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                        context_data_val = 0) : context_data_position++, value >>= 1;
                    }
                    context_enlargeIn--, 0 == context_enlargeIn && (context_enlargeIn = Math.pow(2, context_numBits), 
                    context_numBits++), delete context_dictionaryToCreate[context_w];
                } else for (value = context_dictionary[context_w], i = 0; context_numBits > i; i++) context_data_val = context_data_val << 1 | 1 & value, 
                context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
                context_data_val = 0) : context_data_position++, value >>= 1;
                context_enlargeIn--, 0 == context_enlargeIn && (context_enlargeIn = Math.pow(2, context_numBits), 
                context_numBits++);
            }
            for (value = 2, i = 0; context_numBits > i; i++) context_data_val = context_data_val << 1 | 1 & value, 
            context_data_position == bitsPerChar - 1 ? (context_data_position = 0, context_data.push(getCharFromInt(context_data_val)), 
            context_data_val = 0) : context_data_position++, value >>= 1;
            // Flush the last char
            for (;;) {
                if (context_data_val <<= 1, context_data_position == bitsPerChar - 1) {
                    context_data.push(getCharFromInt(context_data_val));
                    break;
                }
                context_data_position++;
            }
            return context_data.join("");
        },
        decompress: function(compressed) {
            return null == compressed ? "" : "" == compressed ? null : LZString._decompress(compressed.length, 32768, function(index) {
                return compressed.charCodeAt(index);
            });
        },
        _decompress: function(length, resetValue, getNextValue) {
            var next, i, w, bits, resb, maxpower, power, c, dictionary = [], enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = [], data = {
                val: getNextValue(0),
                position: resetValue,
                index: 1
            };
            for (i = 0; 3 > i; i += 1) dictionary[i] = i;
            for (bits = 0, maxpower = Math.pow(2, 2), power = 1; power != maxpower; ) resb = data.val & data.position, 
            data.position >>= 1, 0 == data.position && (data.position = resetValue, data.val = getNextValue(data.index++)), 
            bits |= (resb > 0 ? 1 : 0) * power, power <<= 1;
            switch (next = bits) {
              case 0:
                for (bits = 0, maxpower = Math.pow(2, 8), power = 1; power != maxpower; ) resb = data.val & data.position, 
                data.position >>= 1, 0 == data.position && (data.position = resetValue, data.val = getNextValue(data.index++)), 
                bits |= (resb > 0 ? 1 : 0) * power, power <<= 1;
                c = f(bits);
                break;

              case 1:
                for (bits = 0, maxpower = Math.pow(2, 16), power = 1; power != maxpower; ) resb = data.val & data.position, 
                data.position >>= 1, 0 == data.position && (data.position = resetValue, data.val = getNextValue(data.index++)), 
                bits |= (resb > 0 ? 1 : 0) * power, power <<= 1;
                c = f(bits);
                break;

              case 2:
                return "";
            }
            for (dictionary[3] = c, w = c, result.push(c); ;) {
                if (data.index > length) return "";
                for (bits = 0, maxpower = Math.pow(2, numBits), power = 1; power != maxpower; ) resb = data.val & data.position, 
                data.position >>= 1, 0 == data.position && (data.position = resetValue, data.val = getNextValue(data.index++)), 
                bits |= (resb > 0 ? 1 : 0) * power, power <<= 1;
                switch (c = bits) {
                  case 0:
                    for (bits = 0, maxpower = Math.pow(2, 8), power = 1; power != maxpower; ) resb = data.val & data.position, 
                    data.position >>= 1, 0 == data.position && (data.position = resetValue, data.val = getNextValue(data.index++)), 
                    bits |= (resb > 0 ? 1 : 0) * power, power <<= 1;
                    dictionary[dictSize++] = f(bits), c = dictSize - 1, enlargeIn--;
                    break;

                  case 1:
                    for (bits = 0, maxpower = Math.pow(2, 16), power = 1; power != maxpower; ) resb = data.val & data.position, 
                    data.position >>= 1, 0 == data.position && (data.position = resetValue, data.val = getNextValue(data.index++)), 
                    bits |= (resb > 0 ? 1 : 0) * power, power <<= 1;
                    dictionary[dictSize++] = f(bits), c = dictSize - 1, enlargeIn--;
                    break;

                  case 2:
                    return result.join("");
                }
                if (0 == enlargeIn && (enlargeIn = Math.pow(2, numBits), numBits++), dictionary[c]) entry = dictionary[c]; else {
                    if (c !== dictSize) return null;
                    entry = w + w.charAt(0);
                }
                result.push(entry), // Add w+entry[0] to the dictionary.
                dictionary[dictSize++] = w + entry.charAt(0), enlargeIn--, w = entry, 0 == enlargeIn && (enlargeIn = Math.pow(2, numBits), 
                numBits++);
            }
        }
    };
    return LZString;
}();

"function" == typeof define && define.amd ? define(function() {
    return LZString;
}) : "undefined" != typeof module && null != module && (module.exports = LZString);