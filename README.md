# REST API using Node.Js and SQL Server as a Database

Every year in programming world people are moving to open source technologies like Angular, Node, React, Javascript, Go, Python. Among those Node.Js is becoming popular as a client and server side scripting language. Therefore, the advantage is that you don't have to hire separate developers for backend as well as the front-end development. It saves both your valuable money and time. But, what about data? Now it comes to us with big question, because so far many applications built on non open source technologies which can be migrated to open source one, but people most of the time doesn't want to migrate database. 

Therefore to solve above question, I am going to demonstrate how application build on open source techs talk to legacy database. 
For that I have used Node.Js and SQL server. I have created REST api in Node.Js which does CRUD operation over SQL server database. In this project I have used stored procedure and query both to perform actions.

## What Requires?
- [VS Code](https://code.visualstudio.com/download)
- [Node JS](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-au/sql-server/sql-server-downloads)
- [SQL Server Management Studio](https://docs.microsoft.com/en-gb/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-2017)

## Let’s Begin…..
1. Installation:
Please follow the above links to download/install the software.

2. Setup Database :
Create a new database(e.g. Company) using SSMS. 
Then execute the below script to create tables & stored procedures.

```sql
CREATE TABLE [dbo].[Tbl_Department] (
[Id] INT IDENTITY (1, 1) NOT NULL,
[Name] VARCHAR (50) NOT NULL,
PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO;
CREATE TABLE [dbo].[Tbl_Employee] (
    [Id]          INT          IDENTITY (1, 1) NOT NULL,
    [FirstName]   VARCHAR (50) NOT NULL,
    [MiddleName]  VARCHAR (50) NULL,
    [LastName]    VARCHAR (50) NOT NULL,
    [DOB]         DATETIME     NULL,
    [Designation] VARCHAR (50) NOT NULL,
    [ReportingTo] VARCHAR (50) NULL,
    [Salary]      INT          NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO;
CREATE PROCEDURE [dbo].GetEmployees 
 
AS
 SELECT * from Tbl_Employee
 
GO;
CREATE PROCEDURE [dbo].InsertOrUpdateEmployee
 @FirstName varchar(50),
 @MiddleName varchar(50),
 @LastName varchar(50),
 @DOB datetime,
 @Designation varchar(50),
 @ReportingTo varchar(50),
 @Salary int,
 @Id int = 0
as
BEGIN
 if (@Id = 0) 
  INSERT INTO [dbo].[Tbl_Employee] ([FirstName], [MiddleName], [LastName], [DOB], [Designation], [ReportingTo], [Salary]) 
  VALUES (@FirstName,@MiddleName, @LastName, @DOB, @Designation, @ReportingTo, @Salary)
 else
  update [Tbl_Employee] set [FirstName] = @FirstName, [MiddleName] = @MiddleName, [LastName]=@LastName, [DOB]=@DOB, [Designation]=@Designation, [ReportingTo] = @ReportingTo, [Salary]=@Salary
  where Id = @Id
 end
END
GO;
CREATE PROCEDURE [dbo].GetEmployeeWithDepartment
 
AS
 SELECT * from Tbl_Employee
  
 SELECT * from Tbl_Department
 ```
 
 3. Setup Node Project:
Once you have installed Node, let’s try building REST API. Create a file named “app.js”, and paste the following code:
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.port || 3300
app.listen(port, () => {
    console.log("Hi This port is running");
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var router = require('./routes')();
 
app.use('/api', router);
```
Here, I have used express and body-parser package, to install those packages use below code in node terminal.

```javascript
npm install express
npm install body-parser
```
Now we required a package for SQL server driver for Node js, run below command. It will install a tedious package. Here you can find more about tedious.
```javascript
npm install tedious
```
After installing the above package, we will first connect a SQL server database which is already installed in your machine. For that, you must have below details.

- Server Name
- Instance Name( if any)
- Username and Password
- Database Name

Create a folder named Database and in that create a file named connect.js and paste below code:

```javascript
var Connection = require('tedious').Connection;
var config = {
    server: '#######',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: '#####'
        }
    },
    options: {
        database: '###',
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
```

Here, instancename is optional, if you are working on SQL server express edition then you have to use instanceName = sqlexpress or whatever instance has been created in your system.
Now in command line navigate to Database folder and run node connect.js command, you should get “Connected” written in the console. That means your connection to the database is done.

## Database connection:
Now, we will create a common database context file to do CRUD operation. Create one file named dbContext.js in Database folder and paste the following code in it.

- Get Method
```javascript
var Request = require('tedious').Request;
var connection = require('./connect');
var utility = require('./utility/utility');
function spGetExecute(qry, callback) {
    var data = [];
    var dataset = [];
    var resultset = 0;
    request = new Request(qry, function (err, rowCount) {
        utility.sendDbResponse(err, rowCount, dataset, callback);
});
request.on('row', function (columns) {
        utility.buildRow(columns, data);
});
request.on('doneInProc', function (rowCount, more, rows) {
        dataset.push(data);
        data = [];
    });
connection.callProcedure(request);
}
module.exports = {
    get: spGetExecute 
};
```
In the above code, I have created a function to get data/dataset from the database using a stored procedure.

To elaborate the above code, it first creates the object of Request which is imported from the tedious package. In tedious, stored procedure execution is done on row by row basis, so I have initialised an event called ‘row’, which basically executes on every row. Additionally, ‘doneInProc’ event is executing after each statement written in the procedure.

For example, if the procedure has three select statements, and each statement returns 3,4 & 5 rows respectively, then it will execute like below.
```javascript
row
row
row
doneInProc
row
row
row
row
doneInProc
row
row
row
row
row
doneInProc
```

- Post Method
Now, to insert data using procedure paste below code in the same dbContext.js file:
```javascript
function spPostExecute(qry, params, callback) {
    var newdata = [];
request = new Request(qry, function (err, rowCount) {
        utility.sendDbResponse(err, rowCount, newdata, callback);
    });
params.forEach(param => {
request.addParameter(param.name, param.type, param.val);
});
request.on('row', function (columns) {
        utility.buildRow(columns, newdata);
    });
connection.callProcedure(request);
}
```

And Modify the line which export functions as per below:
```javascript
module.exports = {
    get: spGetExecute,
    post: spPostExecute
};
```
Now, it is time to run/test the code!!!!
Create one repository folder and inside that create an employee folder.
Now, create a file named employeeRepository.js and paste below code:

```javascript
var response = require('../../shared/response');
var TYPES = require('tedious').TYPES;
function EmployeeRepository(dbContext) {
function getEmployees(req, res) {
dbContext.get("getEmployee", function (error, data) {
                return res.json(response(data, error));
            });
}
function getEmployee(req, res) {
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
function postEmployees(req, res) {
var parameters = [];
parameters.push({ name: 'FirstName', type: TYPES.VarChar, val: req.body.FirstName });
        parameters.push({ name: 'LastName', type: TYPES.VarChar, val: req.body.LastName });
        parameters.push({ name: 'MiddleName', type: TYPES.VarChar, val: req.body.MiddleName });
        parameters.push({ name: 'DOB', type: TYPES.DateTime, val: new Date(req.body.DOB) });
        parameters.push({ name: 'Designation', type: TYPES.VarChar, val: req.body.Designation });
        parameters.push({ name: 'ReportingTo', type: TYPES.VarChar, val: req.body.ReportingTo });
        parameters.push({ name: 'Salary', type: TYPES.Int, val: req.body.Salary });
dbContext.post("InsertOrUpdateEmployee", parameters, function (error, data) {
            return res.json(response(data, error));
        });
    }
return {
        getAll: getEmployees,
        get: getEmployee,
        post: postEmployees 
    }
}
module.exports = EmployeeRepository;
```
After doing all of the above, one question comes up in mind that how can we write an API method which calls above functions. For this, I have implemented routing in Node.Js using expressJs. For detailed information about routing please follow below link:


[Express 4.x - API Reference](https://expressjs.com/en/4x/api.html#router)


This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or…
expressjs.com	
Create one file named employeeRoutes.js in employee folder inside the repository folder. Paste below code in that file.

```javascript
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
```
Let me explain the above code.
First I have imported employee repository and DbContext using require. 
Then I have created a function which configures routes for employee-related APIs.
To do that router object is injected from route.js(explain later). 
Using router instance we have created get, put, post and delete APIs for the employee. But what is the use or router.use, in simple terms if I want to execute one method before actual api, I will use router.use. For your knowledge, it is Middleware in NodeJS like Action filters of MVC, interceptor of AngularJS. For a programmer, it is life-saving because it stops us to repeat code in different functions.

Now It is time to create route.js which ultimately call employeeRoutes.js and inject router object. Route.Js is main route config file which can initiate other module’s route config files also. ( like department.routes)
Look at the below code and paste it in the newly created file named route.js in the root folder.

```javascript
const express = require('express');
function eRoutes() {
    const router = express.Router();
    var employee = require('./repository/employee/employee.routes')(router);
    var department = require('./repository/department/department.routes')(router);
    return router;
}
module.exports = eRoutes;
```
And in app.js we have imported this route.js file as written in previous code snippets.

Now run your API
```javascript
node app.js
```

## If you follow the above steps:

- you’ll have a consistent architecture for Node API with SQL server integration: in small or big apps.
- your modules of global services(dbContext) and your modules of reusable components are ready to be packaged as libraries, reusable in other projects,
- you’ll be able to do unit tests without crying.

The goal of this post is also to confront this code with the community, ie. you who is reading. Please feel free to comment.
 
