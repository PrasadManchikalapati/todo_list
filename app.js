const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  if (status != "" && priority === "" && search_q === "") {
    const dbQuery = `SELECT * FROM todo WHERE status=${status}`;
    const result = await db.all(dbQuery);
    response.send(result);
  } else if (priority != "" && status == "" && search_q === "") {
    const dbQuery = `SELECT * FROM todo WHERE priority=${priority}`;
    const result = await db.all(dbQuery);
    response.send(result);
  } else if (priority != "" && status != "" && search_q === "") {
    const dbQuery = `SELECT * FROM todo WHERE priority=${priority} AND status=${status}`;
    const result = await db.all(dbQuery);
    response.send(result);
  } else {
    const dbQuery = `SELECT * FROM todo WHERE todo LIKE '${search_q}%';`;
    const result = await db.all(dbQuery);
    response.send(result);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const result = await db.get(dbQuery);
  response.send(result);
});
app.use(express.json());

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const dbQuery = `INSERT INTO todo(id,todo,priority,status)
                   VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(dbQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  if (status != undefined) {
    const dbQuery = `UPDATE todo 
  SET status='${status}' WHERE id=${todoId};`;
    await db.run(dbQuery);
    response.send("Status Updated");
  } else if (priority != undefined) {
    const dbQuery = `UPDATE todo 
  SET priority='${priority}' WHERE id=${todoId};`;
    await db.run(dbQuery);
    response.send("Priority Updated");
  } else if (todo != undefined) {
    const dbQuery = `UPDATE todo 
  SET todo='${todo}' WHERE id=${todoId};`;
    await db.run(dbQuery);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(dbQuery);
  response.send("Todo Deleted");
});

module.exports = app;
