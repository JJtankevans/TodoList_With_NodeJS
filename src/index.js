const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  /*Passa o objeto user para a requisição fazendo assim com que 
  todas as rotas que usarem esse middleware tenham acesso a user*/

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlredyExists = users.some((user) => user.username === username);

  if (userAlredyExists) {
    return response.status(400).json({ error: "User alredy exists!" });
  }

  users.push({ id: uuidv4(), name: name, username: username, todos: [] });

  return response.status(201).json(users[users.length - 1]);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  return response.status(201).send(user.todos[user.todos.length - 1]);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoFiltered = user.todos.filter((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
      return todo;
    }
  });

  if (todoFiltered.length != 0) {
    return response
      .status(201)
      .json(todoFiltered[0]);
  } 
  
  return response.status(404).send({ error: "No todo found with this id!"});
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFiltered = user.todos.filter((todo) => {
    if (todo.id === id) {
      todo.done = true;
      return todo;
    }
  });

  if (todoFiltered.length != 0) {
    return response
      .status(201)
      .json(todoFiltered[0]);
  }

  return response.status(404).send({ error: "No todo found with this id!"});
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFiltered = user.todos.filter((todo) => {
    if (todo.id === id) {
      return todo;
    }
  });

  if(todoFiltered != 0) {
    const index = user.todos.indexOf(todoFiltered[0]);
    user.todos.splice(index,1);
    return response.status(204).json(users);
  }

  return response.status(404).send({ error: "No todo found with this id!"});

});

module.exports = app;
