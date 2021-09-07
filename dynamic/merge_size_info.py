import re
import json
import os
import glob

data_root = "data/"


def ParseLayoutDumpFile(file_path):
    valid_info = ""
    with open(file_path, 'r') as f:

        while True:
            c = f.read(1)
            if not c:
                break
            if c == '[':
                break
            valid_info += c

    pattern = re.compile(
        r'"gc_count".+"Code LO space obj memory".+\d+', re.S)
    matched = pattern.search(valid_info)
    parsed_str = matched.group()
    parsed_str = '{' + parsed_str+'}'
    dic = json.loads(parsed_str)
    return dic


def MergeSizeInfoInCategory(category_path):
    layout_snapshots_dir = os.path.join(category_path, 'snapshots')
    merged_dict = dict()
    count = 0
    filepaths = glob.glob(layout_snapshots_dir+"/*.json")

    for filepath in filepaths:
        dic = ParseLayoutDumpFile(filepath)
        key_str = ""
        if dic["is_before_gc"] == 1:
            key_str = "B"
        else:
            key_str = "A"
        key_str += str(dic["gc_count"])
        merged_dict[key_str] = dic

        count += 1
        print("category:{0}, {1}/{2}".format(category_path,
              count, len(filepaths)), end="\r", flush=True)
    print()

    def SortKey(x):
        alpha = 0 if x[0] == "a" else 1
        other = x[1:]
        return int(other)*10+alpha
    sorted_merged_dict = dict()
    for k in sorted(merged_dict.keys(), key=lambda x: SortKey(x)):
        sorted_merged_dict[k] = merged_dict[k]

    merged_json_file_path = os.path.join(category_path, 'size_trend.json')
    with open(merged_json_file_path, 'w') as json_file:
        json.dump(sorted_merged_dict, json_file)


def run():
    data_categorys = os.listdir(data_root)
    for data_category in data_categorys:
        category_path = os.path.join(data_root, data_category)
        if os.path.isfile(category_path):
            continue
        MergeSizeInfoInCategory(category_path)


if __name__ == "__main__":
    run()
