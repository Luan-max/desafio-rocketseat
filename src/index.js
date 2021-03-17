const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const id = uuidv4();

  const userExists = users.some((user) => user.name === name);

  if (userExists) {
    return response.status(400).json({ error: "User already created!" });
  }

  const user = {
    name,
    username,
    id,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = uuidv4();
  const { user } = request;

  const operationTodoList = {
    id,
    title,
    deadline,
    done: false,
    created_at: new Date(),
  };

  user.todos.push(operationTodoList);

  return response.status(201).json(operationTodoList);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { title, deadline } = request.body;
  const { user } = request;

  const findTodo = user.todos.find((todo) => todo.id == id);

  findTodo.title = title;
  findTodo.deadline = deadline;

  response.status(200).json(user);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTodo = user.todos.find((todo) => todo.id == id);

  if (!findTodo) {
    return reponse.status(400).json({ message: "Task not found!" });
  }
  findTodo.done = true;

  response.status(200).json(user);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  user.todos.splice(id, 1);

  response.status(204).json(user);
});

module.exports = app;
