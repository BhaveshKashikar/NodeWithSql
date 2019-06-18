var response = require('../../shared/response');

var TYPES = require('tedious').TYPES;

function DepartmentRepository(dbContext) {
    function getDepartments(req, res) {
        var params = [];

        dbContext.getQuery("select * from tbl_department", params, false, function (error, data) {
            
            return res.json(response(data, error));
        });
    }

    return { getDepartments };
}

module.exports = DepartmentRepository;