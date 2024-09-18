// const {req,res} = require("express");
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");

const passport = require("passport");
const localStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

//set ejs as view engine

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
const { Todo, User } = require("./models");
// const { title } = require("process");
// const { error } = require("console");

//define session duration:
app.use(
  session({
    secret: "my-super-secret-key-215472655657",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24 hours
    },
  })
);

//ask passport to work with express application:
app.use(passport.initialize());
app.use(passport.session());

//define authentication local strategy for passport:
passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user); //authentication successful
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return error;
        });
    }
  )
);

//After the user authenticated,store user in the session by serializing the user data:
passport.serializeUser((user, done) => {
  console.log("Serializing the user in the session", user.id);
  done(null, user.id);
});

//deserialize user
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

//flash function to connect the connect-flash
app.use(flash());

//Implementing flash messages
app.use(function (req, res, next) {
  res.locals.messages = req.flash();
  next();
});

app.get("/", async (req, res) => {
  res.render("index", {
    csrfToken: req.csrfToken(),
  });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  // const allTodos = await Todo.getTodos();
  const loggedInUser = req.user.id;
  const overDue = await Todo.getTodosByDate("overdue", loggedInUser);
  const dueToday = await Todo.getTodosByDate("duetoday", loggedInUser);
  const dueLater = await Todo.getTodosByDate("duelater", loggedInUser);
  const completedItems = await Todo.getCompletedTodos(loggedInUser);
  if (req.accepts("html")) {
    res.render("todos", {
      // allTodos,
      overDue,
      dueToday,
      dueLater,
      completedItems,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      // allTodos,
      overDue,
      dueToday,
      dueLater,
    });
  }
});

app.get("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    return res.json(todo);
  } catch (error) {
    res.status(422).json(error);
  }
});
//add a todo
app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log("create new todo", req.body);
  console.log(req.user);
  try {
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
      userId: req.user.id,
    });
    return res.redirect("/todos");
  } catch (error) {
    console.log(error);
    if (error.name === "SequelizeValidationError") {
      error.errors.forEach((err) => {
        req.flash("error", err.message);
      });
    } else if (error.name === "SequelizeDatabaseError") {
      req.flash("error", "Invalid date");
    } else {
      req.flash("error", "Some unexpected error occured...");
    }
    res.redirect("/todos");
  }
});

app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log(`Change completed status of id ${req.params.id}`);
  const todo = await Todo.findByPk(req.params.id);

  try {
    const updatedTodo = await todo.setCompletionStatus(todo.completed);
    return res.json(updatedTodo);
  } catch (error) {
    res.status(422).json(error);
  }
});

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log(`delete by id ${req.params.id}`);
    try {
      await Todo.remove(req.params.id, req.user.id);
      return res.json({ success: true });
    } catch (error) {
      res.status(422).json(error);
    }
  }
);

//sign Up
app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Signup",
    csrfToken: req.csrfToken(),
  });
});

//add data on sign-up to users model
app.post("/users", async (req, res) => {
  //hash the user password
  const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);
  console.log(hashedPwd);
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPwd,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        // req.flash("error", "Login failed after signup.");
        // return res.redirect("/signup");
      }
      res.redirect("/todos");
    });
  } catch (error) {
    // if (error.name === "SequelizeUniqueConstraintError") {
    //   error.errors.forEach((err) => {
    //     req.flash("error", err.message);
    //   }); //duplicate account
    // } else
    if (error.name === "SequelizeValidationError") {
      error.errors.forEach((err) => {
        req.flash("error", err.message); // Handle validation errors (e.g., firstName required)
      });
      return res.redirect("/signup");
    } else {
      req.flash("error", "something unexpected happened");
      return res.redirect("/signup");
    }
    // req.flash('error', 'Error during signup.');
    // res.redirect("/signup");
  }
});

//signIn
app.get("/login", (req, res) => {
  res.render("login", {
    title: "login",
    csrfToken: req.csrfToken(),
  });
});

//define session for login using passport.authenticate
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid email or password", // Flash message on failure
  }),
  (req, res) => {
    console.log(req.user);
    res.redirect("/todos"); //on successful login
  }
);

//signout
app.get("/signout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = app;
