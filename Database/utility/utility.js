function sendDbResponse(err, rowCount, data, callback) {
    if (err) {
        callback(err);
    } else {
        if (rowCount < 1) {
            callback(null, false);
        }
        else {
            callback(null, data, rowCount);
        }
    }
}

function buildRow(columns, data) {
    var row = {};
    columns.forEach(function (column) {
        row[column.metadata.colName] = column.value
    });

    data.push(row);
}

module.exports = {
    sendDbResponse: sendDbResponse,
    buildRow: buildRow
}