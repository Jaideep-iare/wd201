// const {req,res} = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const { Todo } = require("./models");
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

//set ejs as view engine

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const allTodos = await Todo.getTodos();
  if (req.accepts("html")) {
    res.render("index", {
      allTodos,
    });
  } else {
    res.json({ allTodos });
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
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    return res.json(todo);
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
    const count = await Todo.destroy({
      //the no. of rows deleted
      where: {
        id: req.params.id,
      },
    });

    if (count > 0) {
      return res.send(true);
    } else {
      return res.send(false);
    }
  } catch (error) {
    res.status(422).json(error);
  }
});

module.exports = app;
