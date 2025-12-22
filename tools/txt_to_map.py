#!/usr/bin/python3

import json
import sys

if __name__ == '__main__':
    map = {}
    for line in sys.stdin:
        components = line.strip().split(" ")
        if len(components) != 3:
            continue
        key = components[0]
        key = key.replace("\\", "\\\\")
        key = key.replace("\"", "\\\"")

        value = components[1]
        value = value.replace("\\", "\\\\")
        value = value.replace("\"", "\\\"")

        score = components[2]
        item = map.get(key, [])
        item.append(value)
        item.append(score)
        map[key] = item
        
    converted_map = {}
    for key, values in map.items():
        converted_map[key] = " ".join(values) 

    json_output = json.dumps(converted_map, ensure_ascii=False, separators=(',', ':'))
    json_output = json_output.replace('`', '\\`').replace('${', '\\${')
    print(f'const source = `{json_output}`;')
    print('export const webData = JSON.parse(source);')
