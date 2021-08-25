function SetSummaryTable(table, json) {
    var row_capacity = table.rows[1];
    var row_object_size_sum = table.rows[2];

    row_capacity.cells[1].innerText=json["New space size"]
    row_capacity.cells[2].innerText=json["Old space size"]
    row_capacity.cells[3].innerText=json["Code space size"]
    row_capacity.cells[4].innerText=json["Map space size"]
    row_capacity.cells[5].innerText=json["LO space size"]
    row_capacity.cells[6].innerText=json["Code LO space size"]
    row_capacity.cells[7].innerText=json["New LO space size"]
    row_capacity.cells[8].innerText=json["RO space size"]

    row_object_size_sum.cells[1].innerText=json["New space obj memory"]
    row_object_size_sum.cells[2].innerText=json["Old space obj memory"]
    row_object_size_sum.cells[3].innerText=json["Code space obj memory"]
    row_object_size_sum.cells[4].innerText=json["Map space obj memory"]
    row_object_size_sum.cells[5].innerText=json["LO space obj memory"]
    row_object_size_sum.cells[6].innerText=json["Code LO space obj memory"]
    row_object_size_sum.cells[7].innerText=json["New LO space obj memory"]
    row_object_size_sum.cells[8].innerText=json["RO space obj memory"]
}