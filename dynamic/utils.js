var space_types = ["New space", "Old space", "Code space", "Map space",
    "LO space", "Code LO space", "New LO space", "RO space"];

var page_names = ["New space pages", "Old space pages", "Code space pages", "Map space pages",
    "LO space pages", "Code LO space pages", "New LO space pages", "RO space pages"];

var obj_names = ["New space objs", "Old space objs", "Code space objs", "Map space objs",
    "LO space objs", "Code LO space objs", "New LO space objs", "RO space objs"];

var page_colors = ['#FF0000', '#0000FF', '#800000', '#00FF00', '#800080', '#FF00FF', '#808000', '#008000'];

var page_obj_colors = page_colors.concat(['#FFA500']);

const data_source_root = "data/";

var data_category = "default/";

function SetDataSourceCategory(category) {
    if (category == "") {
        category = "default/";
    }
    data_category = category;
    let len = category.length;
    if (data_category[len - 1] != '/') {
        data_category += "/";
    }
}

function xhrSuccess() {
    this.callback.apply(this, this.arguments);
}

function xhrError() {
    console.error(this.statusText);
}

function LoadFile(url, callback, async = true) {
    var xhr = new XMLHttpRequest();
    xhr.callback = callback;
    xhr.arguments = Array.prototype.slice.call(arguments, 2);
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;
    xhr.open("GET", url, async);
    xhr.send(null);
}

function FromIndexGetGCKey(i) {
    let item = "";
    if (i % 2 == 0) {
        item += "B";
    }
    else {
        item += "A";
    }
    item += Math.floor(i / 2) + 1;
    return item;
}

function FromGCKeyGetIndex(gc_key) {
    let label = gc_key[0];
    let num = parseInt(gc_key.slice(1));
    ret = (num - 1) * 2;
    if (label == 'A') {
        ret += 1;
    }
    return ret;
}