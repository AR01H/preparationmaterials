const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "tododb",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
});

// Init table
pool.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// GET all todos
app.get("/api/todos", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM todos ORDER BY created_at DESC");
  res.json(rows);
});

// POST create todo
app.post("/api/todos", async (req, res) => {
  const { title } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO todos (title) VALUES ($1) RETURNING *",
    [title]
  );
  res.status(201).json(rows[0]);
});

// PUT update todo
app.put("/api/todos/:id", async (req, res) => {
  const { completed } = req.body;
  const { rows } = await pool.query(
    "UPDATE todos SET completed=$1 WHERE id=$2 RETURNING *",
    [completed, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE todo
app.delete("/api/todos/:id", async (req, res) => {
  await pool.query("DELETE FROM todos WHERE id=$1", [req.params.id]);
  res.status(204).send();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
