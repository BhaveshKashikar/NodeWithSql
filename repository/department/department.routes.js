const DepartmentRepository = require('./department.respository');
const dbContext = require('../../Database/dbContext');

module.exports = function (router) {
const departmentRepository = DepartmentRepository(dbContext);
    router.route('/departments')
        .get(departmentRepository.getDepartments);
}
