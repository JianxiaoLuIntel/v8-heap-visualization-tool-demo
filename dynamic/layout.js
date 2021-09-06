var cur_gc_key = "";

function LoadLayoutSnapshot(gc_cnt, is_before_gc) {
    layout_chart.showLoading();
    let url = data_source_root + data_category + "snapshots/heap_dump_" + gc_cnt + "_";
    if (is_before_gc) {
        url += "0.json";
    }
    else {
        url += "1.json";
    }
    LoadFile(url, function () {
        var json = JSON.parse(this.responseText);
        drawLayout(json);
        SetSummaryTable(summary_table, json);
    })
}

function LoadLayoutSnapshotFromGCkey(gc_key) {
    let label = gc_key[0];
    let num = parseInt(gc_key.slice(1));
    let is_before_gc = (label == "B");
    LoadLayoutSnapshot(num, is_before_gc);
}

function InitCategory() {
    let url = data_source_root + "config.json";
    LoadFile(url, function () {
        let json_config = JSON.parse(this.responseText);
        let white_list = json_config.white_list;
        let select_element = document.getElementById("category_selector");
        for (let while_item of white_list) {
            select_element.options.add(new Option(while_item, while_item));
        }
    }, false);
}



function RefreshCharts() {
    let url = data_source_root + data_category + "mem_range.log"
    LoadFile(url, function () {
        let addrs = this.responseText.split('\n');
        addr_min = parseInt(addrs[0], 16);
        addr_max = parseInt(addrs[1], 16);
    }, false);

    url = data_source_root + data_category + "gc_cnt.log";
    LoadFile(url, function () {
        gc_amount = parseInt(this.responseText);
        url = data_source_root + data_category + "size_trend.json";
    }, false);

    LoadFile(url, function () {
        let json_size_trend = JSON.parse(this.responseText);
        DrawSizeLine(json_size_trend);
        LoadLayoutSnapshot(1, true);
        cur_gc_key = "B1";
    }, false);
}

function GetNextGCKey() {
    let cur_index = FromGCKeyGetIndex(cur_gc_key);
    if (cur_gc_key == "" || cur_index == (gc_amount - 1)) {
        return cur_gc_key;
    }
    return FromIndexGetGCKey(cur_index + 1);
}

function GetPrevGCKey() {
    let cur_index = FromGCKeyGetIndex(cur_gc_key);
    if (cur_gc_key == "" || cur_index == 0) {
        return cur_gc_key;
    }
    return FromIndexGetGCKey(cur_index - 1);
}


function OnPrevClick() {
    let prev_gc_key = GetPrevGCKey();
    if (prev_gc_key == cur_gc_key) {
        return;
    }
    cur_gc_key = prev_gc_key;
    LoadLayoutSnapshotFromGCkey(cur_gc_key);
}

function OnNextClick() {
    let next_gc_key = GetNextGCKey();
    if (next_gc_key == cur_gc_key) {
        return;
    }
    cur_gc_key = next_gc_key;
    LoadLayoutSnapshotFromGCkey(cur_gc_key);
}

function OnDataCategoryChange(value) {
    SetDataSourceCategory(value);
    RefreshCharts();
}


