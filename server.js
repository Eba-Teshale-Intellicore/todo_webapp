import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");

// ---- Routes ----

// Default: Show All Tasks
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
  res.render("index", { tasks: result.rows, filter: "all" });
});

// Filter: Active Tasks
app.get("/active", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks WHERE completed = FALSE ORDER BY id DESC");
  res.render("index", { tasks: result.rows, filter: "active" });
});

// Filter: Completed Tasks
app.get("/completed", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks WHERE completed = TRUE ORDER BY id DESC");
  res.render("index", { tasks: result.rows, filter: "completed" });
});

// Add New Task
app.post("/tasks", async (req, res) => {
  const { title } = req.body;
  await pool.query("INSERT INTO tasks (title) VALUES ($1)", [title]);
  res.redirect("/");
});

// Toggle Complete
app.post("/tasks/:id/complete", async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE tasks SET completed = NOT completed WHERE id = $1", [id]);
  res.redirect("/");
});

// Delete Task
app.post("/tasks/:id/delete", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  res.redirect("/");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
