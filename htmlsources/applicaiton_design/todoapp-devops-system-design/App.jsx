import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API}/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (e) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async () => {
    if (!input.trim()) return;
    const res = await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: input }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setInput("");
  };

  const toggleTodo = async (id, completed) => {
    const res = await fetch(`${API}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    const updated = await res.json();
    setTodos(todos.map(t => t.id === id ? updated : t));
  };

  const deleteTodo = async (id) => {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter(t => t.id !== id));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <h1>Todo App</h1>
      {error && <div className="error">{error}</div>}
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTodo()}
          placeholder="Add a new task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? "done" : ""}>
            <span onClick={() => toggleTodo(todo.id, todo.completed)}>
              {todo.completed ? "✅" : "⬜"} {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>×</button>
          </li>
        ))}
      </ul>
      <p className="count">{todos.filter(t => !t.completed).length} remaining</p>
    </div>
  );
}
