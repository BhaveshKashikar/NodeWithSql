const express = require('express'); 

function eRoutes() {
    const router = express.Router();
    var employee = require('./repository/employee/employee.routes')(router);
    var department = require('./repository/department/department.routes')(router);
    return router;
}

module.exports = eRoutes;