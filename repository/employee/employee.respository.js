
var response = require('../../shared/response');
var TYPES = require('tedious').TYPES;

function EmployeeRepository(dbContext) {

    function findEmployee(req, res, next) {

        if (req.params.employeeId) {
            var parameters = [];

            parameters.push({ name: 'Id', type: TYPES.Int, val: req.params.employeeId });

            var query = "select * from tbl_employee where Id = @Id"

            dbContext.getQuery(query, parameters, false, function (error, data) {
                if (data) {
                    req.data = data[0];
                    return next();
                }
                return res.sendStatus(404);
            });
        }
    }

    function getEmployees(req, res) {

        if (req.query.salary) {
            var parameters = [];

            parameters.push({ name: 'Salary', type: TYPES.Int, val: req.query.salary });

            var query = "select * from tbl_employee where salary>=@Salary"

            dbContext.getQuery(query, parameters, false, function (error, data) {
                return res.json(response(data, error));
            });
        }
        else {
            dbContext.get("getEmployee", function (error, data) {
                return res.json(response(data, error));
            });
        }
    }

    function getEmployee(req, res) {
        return res.json(req.data);
    }

    function postEmployees(req, res) {

        var parameters = [];

        parameters.push({ name: 'FirstName', type: TYPES.VarChar, val: req.body.FirstName });
        parameters.push({ name: 'LastName', type: TYPES.VarChar, val: req.body.LastName });
        parameters.push({ name: 'MiddleName', type: TYPES.VarChar, val: req.body.MiddleName });
        parameters.push({ name: 'DOB', type: TYPES.DateTime, val: new Date(req.body.DOB) });
        parameters.push({ name: 'Designation', type: TYPES.VarChar, val: req.body.Designation });
        parameters.push({ name: 'ReportingTo', type: TYPES.VarChar, val: req.body.ReportingTo });
        parameters.push({ name: 'Salary', type: TYPES.Int, val: req.body.Salary });

        // Object.entries(employee).forEach((property)=>{
        //     parameters.push({name:'@'+property[0]})
        // });

        dbContext.post("insertEmployee", parameters, function (error, data) {
            return res.json(response(data, error));
        });
    }

    function putEmployee(req, res) {

        var parameters = [];

        Object.entries(req.data).forEach((property) => {

            if (req.body[property[0]]) {
                parameters.push(
                    {
                        name: property[0],
                        val: req.body[property[0]],
                        type: TYPES.VarChar
                    });
            } else {

                parameters.push(
                    {
                        name: property[0],
                        val: property[1],
                        type: TYPES.VarChar
                    });
            }
        });

        // parameters.push({ name: 'FirstName', type: TYPES.VarChar, val: req.body.FirstName });
        // parameters.push({ name: 'LastName', type: TYPES.VarChar, val: req.body.LastName });
        // parameters.push({ name: 'MiddleName', type: TYPES.VarChar, val: req.body.MiddleName });
        // parameters.push({ name: 'DOB', type: TYPES.DateTime, val: new Date(req.body.DOB) });
        // parameters.push({ name: 'Designation', type: TYPES.VarChar, val: req.body.Designation });
        // parameters.push({ name: 'ReportingTo', type: TYPES.VarChar, val: req.body.ReportingTo });
        // parameters.push({ name: 'Salary', type: TYPES.Int, val: req.body.Salary });

        // Object.entries(req.body).forEach((property) => {
        //     parameters.push({ name: '@' + property[0] })
        // });

        dbContext.post("InsertEmployee", parameters, function (error, data) {
            return res.json(response(data, error));
        });
    }

    function deleteEmployee(req, res) {

        var parameters = [];

        if (req.data.Id) {
            var parameters = [];

            parameters.push({ name: 'Id', type: TYPES.Int, val: req.data.Id });

            var query = "delete from tbl_employee where Id = @Id"

            dbContext.getQuery(query, parameters, false, function (error, data, rowCount) {
                if (rowCount > 0) {
                    return res.json('Record is deleted');
                }
                return res.sendStatus(404);
            });
        }
    }

    function getEmployeesWothDepartment(req, res) {

        dbContext.get("GetEmployeeWithDepartment", function (error, data) {
            return res.json(response(data, error));
        });
    }

    function SearchEmployee(req, res) {

        var parameters = [];

        parameters.push({ name: 'Salary', type: TYPES.Int, val: req.query.salary });

        var query = "select * from tbl_employee where salary>=@Salary"

        dbContext.get(query, parameters, function (error, data) {
            return res.json(response(data, error));
        });
    }

    return {
        getAll: getEmployees,
        get: getEmployee,
        post: postEmployees,
        put: putEmployee,
        getMulti: getEmployeesWothDepartment,
        find: SearchEmployee,
        intercept: findEmployee,
        delete: deleteEmployee
    }
}

module.exports = EmployeeRepository;