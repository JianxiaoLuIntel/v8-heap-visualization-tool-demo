const data_source_root = "data/";

var data_category = "default/";

function setDataSourceCategory(category) {
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

function loadFile(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.callback = callback;
    xhr.arguments = Array.prototype.slice.call(arguments, 2);
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;
    xhr.open("GET", url, true);
    xhr.send(null);
}