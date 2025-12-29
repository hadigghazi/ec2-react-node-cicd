import { useEffect, useMemo, useState } from "react";
import { createTodo, deleteTodo, fetchTodos, updateTodo, type Todo } from "./api";
import "./App.css";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const totalCount = todos.length;

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);
    try {
      const created = await createTodo(title.trim());
      setTodos((prev) => [created, ...prev]);
      setTitle("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onToggle(todo: Todo) {
    setError(null);
    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onDelete(id: number) {
    setError(null);
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div>
            <h1>Todos</h1>
          </div>
          <div className="badge">
            <span>✅</span>
            <span>
              {completedCount}/{totalCount} done
            </span>
          </div>
        </div>

        <form onSubmit={onAdd} className="row">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New todo title..."
            aria-label="todo-title"
          />
          <button className="btn btnPrimary" type="submit">
            Add
          </button>
          <button className="btn" type="button" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </form>

        {error && <div className="alert">Error: {error}</div>}

        <div className="meta">
          <span>{loading ? "Loading…" : "Ready"}</span>
        </div>

        {todos.length === 0 && !loading ? (
          <div className="empty">No todos yet — add your first one 👆</div>
        ) : (
          <ul className="list">
            {todos.map((t) => (
              <li key={t.id} className="item">
                <div className="left">
                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => void onToggle(t)}
                    aria-label={`toggle-${t.id}`}
                  />
                  <span className={`title ${t.completed ? "done" : ""}`}>{t.title}</span>
                </div>

                <button className="btn btnDanger" onClick={() => void onDelete(t.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}