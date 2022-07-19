#!/usr/bin/python3

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
    print("export let webData : any = {")
    for key in map.keys():
        value = map[key]
        print('  "%s":"%s",' % (key, ' '.join(value)))
    print("};")
