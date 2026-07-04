import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Trash2 } from "lucide-react";

interface Task {
  id: number;
  title: string;
  notes: string;
  done: boolean;
  priority: number; // 0 обычный, 1 важный, 2 срочный
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

type Filter = "all" | "active" | "done";

const PRIORITY_LABEL = ["Обычный", "Важный", "Срочный"];

export default function TasksModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    invoke<Task[]>("tasks_list")
      .then((t) => { setTasks(t); setError(null); })
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => reload(), [reload]);

  const add = async () => {
    const t = title.trim();
    if (!t) return;
    await invoke("tasks_add", { title: t, priority }).catch((e) => setError(String(e)));
    setTitle("");
    reload();
  };

  const toggle = async (id: number) => {
    await invoke("tasks_toggle", { id }).catch((e) => setError(String(e)));
    reload();
  };

  const remove = async (id: number) => {
    await invoke("tasks_delete", { id }).catch((e) => setError(String(e)));
    reload();
  };

  const shown = tasks.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );
  const activeCount = tasks.filter((t) => !t.done).length;

  return (
    <div>
      <div className="phead">
        <h1>Задачи</h1>
        <div className="phead-sub">
          {activeCount === 0 ? "Все задачи выполнены 🎉" : `Активных задач: ${activeCount}`}
        </div>
      </div>

      <div className="card task-add">
        <input
          value={title}
          placeholder="Новая задача…"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
          {PRIORITY_LABEL.map((p, i) => (
            <option key={i} value={i}>{p}</option>
          ))}
        </select>
        <button className="btn-acc" onClick={add}>Добавить</button>
      </div>

      <div className="chips">
        {([["all", "Все"], ["active", "Активные"], ["done", "Выполненные"]] as [Filter, string][]).map(([f, label]) => (
          <button
            key={f}
            className={"chip" + (filter === f ? " chip-on" : "")}
            onClick={() => setFilter(f)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="card task-error">Ошибка: {error}</div>}

      <div className="card task-list">
        {shown.length === 0 && <div className="palette-empty">Пусто</div>}
        {shown.map((t) => (
          <div key={t.id} className={"task-row" + (t.done ? " done" : "")}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span className="task-title">{t.title}</span>
            {t.priority > 0 && (
              <span className={"badge p" + t.priority}>{PRIORITY_LABEL[t.priority]}</span>
            )}
            <button className="task-del" title="Удалить" onClick={() => remove(t.id)}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
