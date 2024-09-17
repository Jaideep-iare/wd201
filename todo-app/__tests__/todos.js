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

//helper function to login the user
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  const csrfToken = extractCsrfToken(res);

  res = await agent.post("/session").send({
    email: username,
    password,
    _csrf: csrfToken,
  });
};

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

  //signin
  test("Sign up", async () => {
    let res = await agent.get("/signup");
    let csrfToken = extractCsrfToken(res);

    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  //signout
  test("sign-out", async () => {
    //as the agent is the server holding the session, the user is signed in
    //by the previous test case
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("create new todo,respond with json with /todos", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    //extract csrf token
    const res = await agent.get("/todos");
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
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    //extract csrf token
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedgroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedgroupedResponse.dueToday.length;
    const latestTodo = parsedgroupedResponse.dueToday[dueTodayCount - 1];

    //extract csrf token again to mark false as true
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    let markCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
      });
    let parsedResponse = JSON.parse(markCompletedResponse.text);
    expect(parsedResponse.completed).toBe(true);

    //extract csrf token again to mark true as false
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    markCompletedResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    parsedResponse = JSON.parse(markCompletedResponse.text);
    expect(parsedResponse.completed).toBe(false);
  });

  test("Delete the todo by Id", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    //extract csrf token
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedgroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedgroupedResponse.dueToday.length;
    const latestTodo = parsedgroupedResponse.dueToday[dueTodayCount - 1];

    //extract csrf token again for deleting
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const deletedResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    console.log(Response);
    expect(deletedResponse.statusCode).toBe(200);

    //try to access the deleted todo
    res = await agent.get("/todos");
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
