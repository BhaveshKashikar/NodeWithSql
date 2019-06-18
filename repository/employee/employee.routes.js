const _employeeRepository = require('./employee.respository');
const dbContext = require('../../Database/dbContext');

module.exports = function (router) {
    const employeeRepository = _employeeRepository(dbContext);

    router.route('/employees')
        .get(employeeRepository.getAll)
        .post(employeeRepository.post);
        
    router.route('/employees/department')
    .get(employeeRepository.getMulti);

    router.use('/employees/:employeeId', employeeRepository.intercept);

    router.route('/employees/:employeeId')
        .get(employeeRepository.get)
        .put(employeeRepository.put)
        .delete(employeeRepository.delete);

}
