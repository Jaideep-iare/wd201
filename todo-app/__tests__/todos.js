const request = require("supertest");
const db = require("../models/index");
var cheerio = require("cheerio");

const app = require("../app");

let server, agent; //server=express,agent = supertest, supertest is agent for server

//extract csrf token function
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo test suite", () => {
  //before testcases databases,express and all others should load
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  //close database after http connections
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("create new todo,respond with json with /todos", async () => {
    //extract csrf token
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);

    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    // expect(response.header["content-type"]).toBe(
    //   "application/json; charset=utf-8"
    // );
    //once recieve response,it should have id
    // const parsedResponse = JSON.parse(response.text);
    // expect(parsedResponse.id).toBeDefined();
  });

  test("Mark a todo as complete with given id", async () => {
    //extract csrf token
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedgroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedgroupedResponse.dueToday.length;
    const latestTodo = parsedgroupedResponse.dueToday[dueTodayCount - 1];

    //extract csrf token again
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const markCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}/markAsCompleted`)
      .send({
        _csrf: csrfToken,
      });
    const parsedResponse = JSON.parse(markCompletedResponse.text);
    expect(parsedResponse.completed).toBe(true);
  });

  // test("find all todos ", async () => {
  //   await agent.post("/todos").send({
  //     title: "Add a todo",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   await agent.post("/todos").send({
  //     title: "Add a todo",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });

  //   const response = await agent.get("/todos");
  //   const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3].title).toBe("Add a todo");
  // });

  // test("Delete the todo by Id", async () => {
  //   //this ensures there is a todo to get deleted
  //   const response = await agent.post("/todos").send({
  //     title: "todo to be deleted",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const parsedResponse = JSON.parse(response.text);
  //   const todoId = parsedResponse.id;
  //   const deletedResponse = await agent.delete(`/todos/${todoId}`);
  //   expect(deletedResponse.statusCode).toBe(200);
  //   expect(deletedResponse["text"]).toBe("true");

  //   //try to access the deleted todo
  //   const getTodo = await agent.get(`/todos/${todoId}`);
  //   expect(getTodo.statusCode).toBe(200); //we will get response as null in json format
  //   const parsedGetTodo = JSON.parse(getTodo.text);
  //   expect(parsedGetTodo).toBeNull(); //convert it to object and check for null
  // });
});
