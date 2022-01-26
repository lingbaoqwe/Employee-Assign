const dataServiceAuth = require("./data-service-auth.js");
const dataService = require("./data-service.js");
var express = require("express");
var app = express();
var multer = require("multer");
var path = require("path");
var fs = require("fs");
var bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");

var HTTP_PORT = process.env.PORT || 8080;
function onHTTPStart() {
  console.log("Express http server is listening on PORT:" + HTTP_PORT);
}

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "week10example_web322_a6",
    duration: 2 * 60 * 1000, // 2 minutes
    activeDuration: 1000 * 60, // 1 minute
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    layout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", ".hbs");

//homepage
app.get("/", function (req, res) {
  res.render("home");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/employees/add", ensureLogin, function (req, res) {
  dataService
    .getDepartments()
    .then((data) => {
      res.render("addEmployee", { departments: data });
    })
    .catch(function (err) {
      res.render("addEmployee", { departments: [] });
    });
});

app.post("/employees/add", ensureLogin, (req, res) => {
  dataService
    .addEmployee(req.body)
    .then((data) => {
      res.redirect("/employees");
    })
    .catch(function (err) {
      res.status(500).send("Unable to Update Employee");
    });
});

app.get("/employee/delete/:empNum", ensureLogin, (req, res) => {
  dataService
    .deleteEmployeeByNum(req.params.empNum)
    .then((data) => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
});

app.get("/department/delete/:depNum", ensureLogin, (req, res) => {
  dataService
    .deleteDepartmentNum(req.params.depNum)
    .then((data) => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res
        .status(500)
        .send("Unable to Remove department / department not found)");
    });
});

app.get("/employees", ensureLogin, function (req, res) {
  if (req.query.status) {
    dataService
      .getEmployeesByStatus(req.query.status)
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch(function (err) {
        res.render({ message: err });
      });
  } else if (req.query.department) {
    dataService
      .getEmployeesByDepartment(req.query.department)
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch((err) => {
        res.render({ message: err });
      });
  } else if (req.query.manager) {
    dataService
      .getEmployeesByManager(req.query.manager)
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch((err) => {
        res.json({ message: err });
      });
  } else {
    dataService
      .getAllEmployees()
      .then((data) => {
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render({ message: err });
      });
  }
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
  let viewData = {};
  dataService
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        viewData.employee = data;
      } else {
        viewData.employee = null;
      }
    })
    .catch(() => {
      viewData.employee = null;
    })
    .then(dataService.getDepartments)
    .then((data) => {
      viewData.departments = data;
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = [];
    })
    .then(() => {
      if (viewData.employee == null) {
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData });
      }
    });
});

app.get("/images/add", ensureLogin, function (req, res) {
  res.render("addImage");
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/departments", ensureLogin, (req, res) => {
  dataService
    .getDepartments()
    .then((data) => {
      console.log("Departments page setup");
      if (data.length > 0) {
        res.render("departments", { departments: data });
      } else {
        res.render("departments", { message: "no results" });
      }
    })
    .catch(function (err) {
      res.render({ message: err });
    });
});

app.get("/images", ensureLogin, function (req, res) {
  fs.readdir("./public/images/uploaded", function (err, items) {
    res.render("images", { data: items });
  });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
  dataService
    .getDepartmentById(req.params.departmentId)
    .then((data) => {
      res.render("department", { department: data });
    })
    .catch((err) => {
      res.status(404).send("Department Not Found");
    });
});

app.post("/employee/update", ensureLogin, (req, res) => {
  dataService
    .updateEmployee(req.body)
    .then(res.redirect("/employees"))
    .catch((err) => {
      console.log(err);
      res.status(500).send("Unable to Update Employee");
    });
});

app.get("/departments/add", ensureLogin, function (req, res) {
  dataService
    .getDepartments()
    .then((data) => {
      res.render("addDepartment", { department: data });
    })
    .catch((err) => {
      res.render("addDepartment", { departments: [] });
    });
});

app.post("/departments/add", ensureLogin, (req, res) => {
  dataService
    .addDepartment(req.body)
    .then((data) => {
      res.redirect("/departments");
    })
    .catch(function (err) {
      res.status(500).send("Unable to add departments");
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
  dataService
    .updateDepartment(req.body)
    .then((data) => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update departments");
    });
});

//login page
app.get("/login", function (req, res) {
  res.render("login");
});

//registration page
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  dataServiceAuth
    .registerUser(req.body)
    .then(() => res.render("register", { successMessage: "User created" }))
    .catch((err) =>
      res.render("register", { errorMessage: err, userName: req.body.userName })
    );
});

app.post("/login", function (req, res) {
  req.body.userAgent = req.get("User-Agent");

  dataServiceAuth
    .checkUser(req.body)
    .then(function (user) {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };

      res.redirect("/employees");
    })
    .catch(function (err) {
      console.log("error is: " + err);
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

// logout
app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, function (req, res) {
  res.render("userHistory");
});

app.use((req, res) => {
  res.status(404).send("Pages are not found");
});

dataService
  .initialize()
  .then(dataServiceAuth.initialize)
  .then(function () {
    app.listen(HTTP_PORT, onHTTPStart);
  })
  .catch(function (err) {
    console.log("Unable to start server: " + err);
  });
