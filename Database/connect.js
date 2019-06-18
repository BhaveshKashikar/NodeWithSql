var Connection = require('tedious').Connection;

var config = {
    server: '####',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: 'p0O9i8U7'
        }
    },
    options: {
        database: '####',
        instanceName: 'Sqlexpress',
        rowCollectionOnDone: true,
        useColumnNames: false
    }
}

var connection = new Connection(config);

connection.on('connect', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected');
    }
});

module.exports = connection;
