/* eslint-disable no-undef */
const db = require("../models");

const todoList = require("../todo");
let yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
let today = new Date().toLocaleDateString("en-CA");
let tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA");
const { all, add, markAsComplete, overdue, dueToday, dueLater } = todoList();

describe("Todolist test suite", () => {
  //   beforeAll(() => {
  //     add({
  //       title: "test todo",
  //       completed: false,
  //       dueDate: new Date().toLocaleDateString("en-CA"),
  //     });
  //   });
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });
  
  test("should add new todo", () => {
    expect(all.length).toBe(0);
    add({
      title: "todo test",
      completed: false,
      dueDate: today,
    });
    add({
      title: "todo test",
      completed: false,
      dueDate: yesterday,
    });
    add({
      title: "todo test",
      completed: false,
      dueDate: tomorrow,
    });

    expect(all.length).toBe(3);
  });

  test("should mark todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  //today

  test("Should be pending for today", () => {
    expect(all.length).toBe(3);
    const k = dueToday();
    expect(k.length).toEqual(1);
  });

  // yesterday
  test("Should be pending from last few days", () => {
    let overDueTodoItemsCount = [];
    expect(overDueTodoItemsCount.length).toEqual(0);
    overDueTodoItemsCount = overdue();
    expect(overDueTodoItemsCount.length).toBe(1);
  });

  //tomorrow
  test("Should be pending for  coming days", () => {
    let dueLaterTodoItemsCount = [];
    expect(dueLaterTodoItemsCount.length).toEqual(0);
    dueLaterTodoItemsCount = dueLater();
    expect(dueLaterTodoItemsCount.length).toBe(1);
  });
});
