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