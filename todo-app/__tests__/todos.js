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

  test("Mark a todo as complete or incomplete with given id", async () => {
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

    //extract csrf token again to mark false as true
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    let markCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
      });
    let parsedResponse = JSON.parse(markCompletedResponse.text);
    expect(parsedResponse.completed).toBe(true);

    //extract csrf token again to mark true as false
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    markCompletedResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    parsedResponse = JSON.parse(markCompletedResponse.text);
    expect(parsedResponse.completed).toBe(false);
  });

  test("Delete the todo by Id", async () => {
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

    //extract csrf token again for deleting
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const deletedResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    console.log(Response);
    expect(deletedResponse.statusCode).toBe(200);

    //try to access the deleted todo
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const getTodo = await agent.get(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    expect(getTodo.statusCode).toBe(200); //we will get response as null in json format
    const parsedGetTodo = JSON.parse(getTodo.text);
    expect(parsedGetTodo).toBeNull(); //convert it to object and check for null
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
});
