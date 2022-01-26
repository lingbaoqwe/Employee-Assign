const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "d8pqfv4tl1cvqu",
  "budljggrhpbgdn",
  "f98b4b82cd0278d9e1224b343bfd78c1118fc8d9c6d0833d2d92a7fdd9ab0bf2",
  {
    host: "ec2-3-237-55-151.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING,
});

var Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: Sequelize.STRING,
});

module.exports.initialize = function () {
  // use promise for controllingasynchronous activity (running server and reading data)
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("initialize() error");
      });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("getAllEmployees err");
      });
  });
};

module.exports.getManagers = function () {
  return new Promise((resolve, reject) => {
    var manager = [];
    for (let i = 0; i < employees.length; i++) {
      if (employees[i].isManager == true) {
        manager.push(employees[i]);
      }
    }
    if (manager.length == 0) {
      reject("manager[] legnth 0, no manager information returned");
    }
    resolve(manager);
  });
};

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    Department.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("getDepartments can't return");
      });
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise(function (resolve, reject) {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (var i in employeeData) {
      if (employeeData[i] == "") {
        employeeData[i] = null;
      }
    }
    Employee.create(employeeData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("addEmployee can't return");
      });
  });
};

module.exports.getEmployeesByStatus = function (estatus) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where: {
        status: estatus,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("getEmployeesByStatus no result return");
      });
  });
};

module.exports.getEmployeesByDepartment = function (departmentnum) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        department: departmentnum,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("getEmployeesByDepartment can't return");
      });
  });
};

module.exports.getEmployeesByManager = function (managernum) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        employeeManagerNum: managernum,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("getEmployeesByManager can't return");
      });
  });
};

module.exports.getEmployeeByNum = function (num) {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        employeeNum: num,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("getEmployeeByNum can't return");
      });
  });
};

module.exports.updateEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (var i in employeeData) {
      if (employeeData[i] == "") {
        employeeData[i] = null;
      }
    }
    Employee.update(employeeData, {
      where: { employeeNum: employeeData.employeeNum },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log("\n\n\n");
        console.log("err");
        reject("addEmployee can't return");
      });
  });
};

module.exports.addDepartment = function (departmentData) {
  return new Promise(function (resolve, reject) {
    for (var i in departmentData) {
      if (departmentData[i] == "") {
        departmentData[i] = null;
      }
    }
    Department.create({
      departmentId: departmentData.departmentId,
      departmentName: departmentData.departmentName,
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("adddepartment can't return");
      });
  });
};

module.exports.updateDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    for (i in departmentData) {
      if (i == "") {
        i = null;
      }
    }
    Department.update(departmentData, {
      where: {
        departmentId: departmentData.departmentId,
      },
    })
      .then(function (data) {
        resolve(data);
      })
      .catch((err) => {
        reject("0 result returned, updateDepartment can't update");
      });
  });
};

module.exports.getDepartmentById = function (id) {
  return new Promise((resolve, reject) => {
    Department.findAll({
      where: {
        departmentId: id,
      },
    })
      .then((data) => {
        console.log("getdepartbyID");
        resolve(data[0]);
      })
      .catch((err) => {
        reject("getEmployeeByNum can't return");
      });
  });
};

module.exports.deleteEmployeeByNum = function (empNum) {
  return new Promise((resolve, reject) => {
    Employee.destroy({
      where: {
        employeeNum: empNum,
      },
    })
      .then((data) => {
        resolve();
      })
      .catch((err) => {
        reject("deleteEmployeeByNum can't return");
      });
  });
};

module.exports.deleteDepartmentNum = function (depNum) {
  return new Promise((resolve, reject) => {
    Department.destroy({
      where: {
        departmentId: depNum,
      },
    })
      .then((data) => {
        resolve();
      })
      .catch((err) => {
        reject("deleteDepartmentByNum can't return");
      });
  });
};
