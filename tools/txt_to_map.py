#!/usr/bin/python3

if __name__ == '__main__':
    map = {}
    with (open ('data.txt')) as f:
        for line in f:
            components = line.strip().split(" ")
            # print(components)
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
            item.append([value, score])
            map[key] = item
            # print(item)
    print("export let webData = new Map([");
    for key in map.keys():
        value = map[key]
        print('    [ "%s" , [%s]],' % (key, ", ".join( '["%s", %s]' % (x[0], x[1]) for x in value)  ))
    print("]);")

