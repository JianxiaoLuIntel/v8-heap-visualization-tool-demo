let trend_line_names = [
    "New space size",
    "Map space size",
    "Code space size",
    "Old space size",
    "RO space size",
    "LO space size",
    "New LO space size",
    "Code LO space size",
    "New space obj memory",
    "Map space obj memory",
    "Code space obj memory",
    "Old space obj memory",
    "RO space obj memory",
    "LO space obj memory",
    "New LO space obj memory",
    "Code LO space obj memory"
]

let line_colors = page_colors.concat(page_colors);

function DrawSizeLine(json_size_trend) {
    function GetXAxisData() {
        let arr = Array(gc_amount * 2);
        for (let i = 0; i < gc_amount * 2; ++i) {
            arr[i] = FromIndexGetGCKey(i);
        }
        return arr;
    }

    function GetTrendLineDataDict() {
        var dict = {};
        for (let trend_line_name of trend_line_names) {
            dict[trend_line_name] = Array(gc_amount * 2);
        }

        for (let [k, v] of Object.entries(dict)) {
            for (let i = 0; i < gc_amount * 2; ++i) {
                let key = FromIndexGetGCKey(i);
                v[i] = json_size_trend[key][k];
            }
        }

        return dict;
    }

    let trend_line_data_dict = GetTrendLineDataDict();

    function GetTrendLineConfigData(name, color_index = null) {
        function GetLineColor(color_index) {
            if (color_index == null) {
                return null;
            }
            return line_colors[color_index]
        }

        function GetLineSymbol(color_index) {
            if (color_index < (trend_line_names.length / 2)) {
                return 'emptyTriangle';
            }
            return 'emptyCircle';
        }

        return {
            name: name,
            type: 'line',
            data: trend_line_data_dict[name],
            lineStyle: {
                color: GetLineColor(color_index)
            },
            itemStyle: {
                color: GetLineColor(color_index),
            },
            symbol: GetLineSymbol(color_index),
            symbolSize: 8
        }
    }

    function GetMarkAreaData() {
        let ret = {
            name: 'MarkAreaData',
            type: 'line',
            markArea: {
                silent: true,
                itemStyle: {
                    color: 'rgba(0, 0, 0, 0.5)'
                },
                data: [
                    // Insert outside defination
                ]
            },
        };

        for (let [k, v] of Object.entries(json_size_trend)) {
            if (k[0] == 'A') {
                continue;
            }
            if (v["gc_type"] == "Mark-Compact") {
                let to_insert = [{ xAxis: k }, { xAxis: 'A' + k.slice(1) }]
                ret.markArea.data.push(to_insert);
            }
        }


        return ret;
    }

    let option = {
        dataZoom: {
            id: 'dataZoomX',
            type: 'inside',
            xAxisIndex: [0],
            filterMode: 'weakFilter',
        },
        title: {
            text: 'Size Trend',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            position: function (point, params, dom, rect, size) {
                let ret_x = point[0] + 10;
                if (point[0] > size.viewSize[0] * 0.7) {
                    ret_x = point[0] - dom.clientWidth - 10;
                }
                return [ret_x, '85%'];
            },
            // confine: true
        },
        legend: {
            data: trend_line_names,
            top: "6%",
            type: 'scroll',
        },

        xAxis: {
            minInterval: 1,
            type: 'category',
            boundaryGap: false,
            data: GetXAxisData()
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} Bytes'
            }
        },

        series: [
            // Set outsdie defination
        ]
    };
    for (let i in trend_line_names) {
        let name = trend_line_names[i];
        option.series.push(GetTrendLineConfigData(name, i));
    }

    option.series.push(GetMarkAreaData());
    size_line_chart.hideLoading();
    size_line_chart.setOption(option);
    size_line_chart.getZr().on('click', function (event) {
        // TODO. This is shit, need to find a better way.
        let key = function GetCurrentCategoryKey() {
            let inner_text = '';
            for (let component_view of size_line_chart._componentsViews) {
                if (component_view.type == "tooltip") {
                    inner_text = component_view._tooltipContent.el.innerText;
                }
            }
            if (inner_text == "") {
                return inner_text;
            }
            let str_list = inner_text.split('\n')[0];
            return str_list;
        }();
        if (key == '') {
            return;
        }
        OnXDataSelected(key);

    });

    size_line_chart.on('click', function (event) {
        OnXDataSelected(event.name);
    })

    function OnXDataSelected(gc_key) {
        let is_before_gc = true;
        if (gc_key[0] == 'A') {
            is_before_gc = false;
        }
        let gc_cnt = parseInt(gc_key.slice(1));
        LoadLayoutSnapshot(gc_cnt, is_before_gc);
        cur_gc_key = gc_key;
    }
}

function UpdateSizeLineChartYMarkLine(gc_key) {
    size_line_chart.setOption({ series:0})
}