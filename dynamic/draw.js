var space_types = ["New space", "Old space", "Code space", "Map space",
    "LO space", "Code LO space", "New LO space", "RO space"];

var page_names = ["New space pages", "Old space pages", "Code space pages", "Map space pages",
    "LO space pages", "Code LO space pages", "New LO space pages", "RO space pages"];

var obj_names = ["New space objs", "Old space objs", "Code space objs", "Map space objs",
    "LO space objs", "Code LO space objs", "New LO space objs", "RO space objs"];

var page_colors = ['#FF0000', '#0000FF', '#800000', '#00FF00', '#800080', '#FF00FF', '#808000', '#008000']

var addr_min = -1;
var addr_max = -1

function preprocess_json(json) {
    for (let obj_name of obj_names) {
        json[obj_name] = merge_objs(json[obj_name]);
    }

    for (let page_name of page_names) {
        json[page_name] = json[page_name].map(function (item, index) {
            item[0] = item[0] - addr_min;
            return item;
        })
    }

    for (let obj_name of obj_names) {
        json[obj_name] = json[obj_name].map(function (item, index) {
            item[0] = item[0] - addr_min;
            return item;
        })
    }
}

function merge_objs(objs) {
    var merged_objs = [];
    var idx = 0;
    while (idx < objs.length) {
        var obj = objs[idx];
        if (merged_objs.length == 0) {
            merged_objs.push(obj);
            idx++;
            continue;
        }
        var merged_top_obj = merged_objs[merged_objs.length - 1];
        if (merged_top_obj[0] + merged_top_obj[1] == obj[0]) {
            merged_top_obj[1] += obj[1];
            idx++;
        }
        else {
            merged_objs.push(obj);
            idx++;
        }
    }
    return merged_objs;
}


function renderItem(params, api) {
    var start = api.coord([api.value(0), api.value(3)]);
    var size = api.size([api.value(1) - api.value(0), api.value(4)]);
    var style = api.style();

    return {
        type: 'rect',
        shape: {
            x: start[0],
            y: start[1],
            width: size[0],
            height: size[1]
        },
        style: style
    };
}

function draw(json) {
    preprocess_json(json);

    var title = "";
    if (json.is_before_gc) {
        title = "Before GC ";
    }
    else {
        title = "After GC ";
    }
    title += (json.gc_count + " " + json.gc_type);

    data = []

    for (let idx in page_names) {

        var page_data = json[page_names[idx]].map(function (item, index) {
            // addr_head, addr_tail, mem_size, bar_y, bar_heigth, name
            var ret_value = [item[0], item[0] + item[1], item[1], 10, 5, page_names[idx]];

            return {
                value: ret_value,
                itemStyle: {
                    color: page_colors[idx]
                }
            };
        });
        data = data.concat(page_data);
    }

    for (let obj_name of obj_names) {
        var obj_data = json[obj_name].map(function (item, index) {
            // addr_head, addr_tail, mem_size, bar_y, bar_heigth, name
            var ret_value = [item[0], item[0] + item[1], item[1], 5, 5, 'objects'];

            return {
                value: ret_value,
                itemStyle: {
                    color: '#FFA500'
                }
            };
        });
        data = data.concat(obj_data);
    }

    var bar_type = page_names.concat(['objs']);

    var option = {
        // dataZoom: {
        //     id: 'dataZoomX',
        //     type: 'inside',
        //     xAxisIndex: [0],
        //     // filterMode: 'filter'
        //     realtime: false
        // },
        legend: {
            show: true,
            data: bar_type
        },
        title: {
            text: title,
            left: 'center'
        },
        tooltip: {
        },
        xAxis: {
            name: 'Address offset in heap(MB)',
            nameLocation: 'center',
            nameTextStyle: {
                fontSize: 25
            },
            nameGap: 30,
            type: 'value',
            min: 0,
            max: addr_max - addr_min,
            // // minInterval: 1024 * 1024,
            // // maxInterval: 1024 * 1024,
            interval: 1024 * 1024 * 4,
            axisLabel: {
                formatter: function (value, index) {
                    return value / 1024 / 1024;
                }
            }
        },
        yAxis: {
        },
        series: [{
            type: 'custom',
            renderItem: renderItem,
            dimensions: ['from', 'to', 'size'],
            encode: {
                x: [0, 1],
                y: 3,
                tooltip: [0, 1, 2],
                itemName: 5
            },
            showAllSymbol: false,
            sampling: "average",
            // data: { name: 'objs', value=data },
            data: data,
            clip: true,
            animation: false,
            // silent: true
        }],
        animation: false
    };

    myChart.setOption(option);
}