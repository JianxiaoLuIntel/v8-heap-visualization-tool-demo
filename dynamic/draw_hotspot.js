
var page_names = ["New space pages", "Old space pages", "Code space pages", "Map space pages",
    "LO space pages", "Code LO space pages", "New LO space pages", "RO space pages"];

var page_colors = ['#FF0000', '#0000FF', '#800000', '#00FF00', '#800080', '#FF00FF', '#808000', '#008000']


function preprocess_json(json) {
    for (let page_name of page_names) {
        json[page_name] = json[page_name].map(function (item, index) {
            item[0] = item[0] - addr_min;
            return item;
        })
    }
}


function renderItem(params, api) {
    var start = api.coord([api.value(0), 0]);
    var end = api.coord([api.value(1), 0]);
    var access_count = api.size([0, api.value(3)])[1];
    var style = api.style();

    return {
        type: 'group',
        children: [
            // Page background
            {
                type: 'rect',
                shape: {
                    x: start[0],
                    y: start[1] - api.getHeight(),
                    width: end[0] - start[0],
                    height: api.getHeight()
                },
                style: style
            },
            // Access count frontground
            {
                type: 'rect',
                shape: {
                    x: start[0],
                    y: start[1] - access_count,
                    width: end[0] - start[0],
                    height: access_count
                },
                style: api.style({ fill: 'black' })
            }
        ]
    }
}

function drawHotSpot(json) {
    preprocess_json(json);

    var title = "Before GC ";
    title += (json.gc_count + " " + json.gc_type);

    data = []

    for (let idx in page_names) {
        var page_data = json[page_names[idx]].map(function (item, index) {
            // addr_head, addr_tail, mem_size, access_count, name
            var ret_value = [item[0], item[0] + item[1], item[1], item[2], page_names[idx]];

            return {
                value: ret_value,
                itemStyle: {
                    color: page_colors[idx]
                }
            };
        });
        data = data.concat(page_data);
    }

    var option = {
        dataZoom: {
            id: 'dataZoomX',
            type: 'inside',
            xAxisIndex: [0],
            filterMode: 'weakFilter',
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
                // lineHeight: 100,
                fontSize: 25,
                padding: [30, 0, 50, 0]
            },
            // nameGap: 0,
            type: 'value',
            min: 0,
            max: addr_max - addr_min,
            // // minInterval: 1024 * 1024,
            // // maxInterval: 1024 * 1024,
            // interval: 1024 * 1024 * 4,
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
            min: 0,
            max: access_count_max,
            reverse: true
        },
        series: [{
            type: 'custom',
            renderItem: renderItem,
            dimensions: ['from', 'to', 'size', 'access_count'],
            encode: {
                x: [0, 1],
                y: 3,
                tooltip: [0, 1, 2, 3],
                itemName: 4
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

    myChart.hideLoading();
    myChart.setOption(option);
}