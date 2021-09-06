var bar_type = page_names.concat(['objs']);

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


function renderLayoutItem(params, api) {
    var start = api.coord([api.value(0), api.value(3)]);
    var end = api.coord([api.value(1), api.value(3)]);
    var height = api.size([0, 1])[1];
    var style = api.style();

    return {
        type: 'rect',
        shape: {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height: height
        },
        style: style
    };
}

function drawLayout(json) {
    preprocess_json(json);

    function GetTitle() {
        let title = "";
        if (json.is_before_gc) {
            title = "Before GC ";
        }
        else {
            title = "After GC ";
        }
        title += (json.gc_count + " " + json.gc_type);

        title += ("; GC reason: " + json.gc_reason);
        return title;
    }

    function GetInputSeries() {
        function GetRenderData() {
            let render_data = []
            for (let idx in page_names) {
                var page_data = json[page_names[idx]].map(function (item, index) {
                    // addr_head, addr_tail, mem_size, bar_y, bar_heigth, name
                    var ret_value = [item[0], item[0] + item[1], item[1], 1, 1, page_names[idx]];

                    return {
                        value: ret_value,
                    };
                });
                render_data.push(page_data);
            }

            var all_obj_data = [];
            for (let obj_name of obj_names) {
                var obj_data = json[obj_name].map(function (item, index) {
                    // addr_head, addr_tail, mem_size, bar_y, bar_heigth, name
                    var ret_value = [item[0], item[0] + item[1], item[1], 0, 1, 'objects'];
                    return {
                        value: ret_value,
                    };
                });
                all_obj_data = all_obj_data.concat(obj_data);
            }
            render_data.push(all_obj_data);
            return render_data;
        }

        var input_series = [];

        for (let idx in bar_type) {
            input_series.push({
                name: bar_type[idx],
                type: 'custom',
                renderItem: renderLayoutItem,
                dimensions: ['from', 'to', 'size'],
                encode: {
                    x: [0, 1],
                    y: 3,
                    tooltip: [0, 1, 2],
                    itemName: 5
                },
                showAllSymbol: false,
                // sampling: "average",
                data: GetRenderData()[idx],
                itemStyle: {
                    normal: {
                        color: page_obj_colors[idx]
                    }
                },
                clip: true,
                animation: false,
            })
        }
        return input_series;
    }

    var option = {
        dataZoom: {
            id: 'dataZoomX',
            type: 'inside',
            xAxisIndex: [0],
            filterMode: 'weakFilter',
        },
        legend: {
            show: true,
            data: bar_type,
            top: "6%"
        },
        title: {
            text: GetTitle(),
            left: 'center'
        },
        tooltip: {
        },
        xAxis: {
            name: 'Address offset in heap(MB)',
            nameLocation: 'center',
            nameTextStyle: {
                fontSize: 25,
                padding: [30, 0, 50, 0]
            },
            type: 'value',
            min: 0,
            max: addr_max - addr_min,
            axisLabel: {
                rotate: 0,
                formatter: function (value, index) {
                    value = value / 1024 / 1024;
                    value = value.toFixed(3);
                    return value;
                }
            }
        },
        yAxis: {
            data: ['Object', 'Page']
        },
        series: GetInputSeries(),
        animation: false
    };

    layout_chart.hideLoading();
    layout_chart.setOption(option);
}