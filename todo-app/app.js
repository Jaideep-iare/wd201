// const {req,res} = require("express");
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

//set ejs as view engine

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
const { Todo } = require("./models");

app.get("/", async (req, res) => {
  // const allTodos = await Todo.getTodos();
  const overDue = await Todo.getTodosByDate("overdue");
  const dueToday = await Todo.getTodosByDate("duetoday");
  const dueLater = await Todo.getTodosByDate("duelater");
  if (req.accepts("html")) {
    res.render("index", {
      // allTodos,
      overDue,
      dueToday,
      dueLater,
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

app.get("/todos", async (req, res) => {
  console.log("Todo list");
  try {
    const todos = await Todo.findAll();
    return res.json(todos);
  } catch (error) {
    return res.status(422).json(error);
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    return res.json(todo);
  } catch (error) {
    res.status(422).json(error);
  }
});

app.post("/todos", async (req, res) => {
  console.log("create new todo", req.body);
  try {
    //add a todo
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    return res.redirect("/");
  } catch (error) {
    return res.status(422).json(error);
  }
});

app.put("/todos/:id/markASCompleted", async (req, res) => {
  console.log(`mark complete by id ${req.params.id}`);
  const todo = await Todo.findByPk(req.params.id);

  try {
    const updatedTodo = await todo.markAsCompleted();
    return res.json(updatedTodo);
  } catch (error) {
    res.status(422).json(error);
  }
});

app.delete("/todos/:id", async (req, res) => {
  console.log(`delete by id ${req.params.id}`);
  try {
    await Todo.remove(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    res.status(422).json(error);
  }
});

module.exports = app;
