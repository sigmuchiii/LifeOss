import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toISO, todayISO, fmtDate, MONTHS_FULL, WEEKDAYS_SHORT } from "../lib/dates";

interface Task {
  id: number; title: string; done: boolean; priority: number;
  dueDate: string | null; dueTime: string | null; deletedAt: string | null;
}
interface Snapshot { tasks: Task[] }

export default function CalendarModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = todayISO();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [selected, setSelected] = useState<string>(t);

  const reload = useCallback(() => {
    invoke<Snapshot>("tasks_snapshot").then((s) => setTasks(s.tasks)).catch((e) => setError(String(e)));
  }, []);
  useEffect(() => reload(), [reload]);

  const call = (cmd: string, args?: Record<string, unknown>) =>
    invoke(cmd, args).then(reload).catch((e) => setError(String(e)));

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.filter((x) => !x.deletedAt && x.dueDate).forEach((x) => {
      if (!map.has(x.dueDate!)) map.set(x.dueDate!, []);
      map.get(x.dueDate!)!.push(x);
    });
    return map;
  }, [tasks]);

  // Сетка месяца, недели с понедельника
  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    const out: { iso: string; day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({ iso: toISO(d), day: d.getDate(), inMonth: d.getMonth() === cursor.m });
    }
    return out;
  }, [cursor]);

  const move = (n: number) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const dayTasks = byDate.get(selected) ?? [];

  return (
    <div className="cal">
      <div className="cal-head">
        <h1>{MONTHS_FULL[cursor.m]} {cursor.y}</h1>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => move(-1)}><ChevronLeft size={16} /></button>
          <button className="icon-btn cal-today-btn" onClick={() => { const d = new Date(); setCursor({ y: d.getFullYear(), m: d.getMonth() }); setSelected(t); }}>Сегодня</button>
          <button className="icon-btn" onClick={() => move(1)}><ChevronRight size={16} /></button>
        </div>
      </div>
      {error && <div className="terr">Ошибка: {error}</div>}

      <div className="cal-body">
        <div className="card cal-grid-card">
          <div className="cal-grid cal-grid-head">
            {WEEKDAYS_SHORT.map((w) => <div key={w} className="cal-dow">{w}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map((c) => {
              const list = byDate.get(c.iso) ?? [];
              const activeCnt = list.filter((x) => !x.done).length;
              return (
                <button
                  key={c.iso}
                  className={
                    "cal-cell" + (c.inMonth ? "" : " out") + (c.iso === t ? " now" : "") + (c.iso === selected ? " sel" : "")
                  }
                  onClick={() => setSelected(c.iso)}
                >
                  <span className="cal-daynum">{c.day}</span>
                  <span className="cal-chips">
                    {list.slice(0, 3).map((x) => (
                      <span key={x.id} className={"cal-chip" + (x.done ? " done" : "")}>{x.title}</span>
                    ))}
                    {list.length > 3 && <span className="cal-more">ещё {list.length - 3}</span>}
                  </span>
                  {activeCnt > 0 && <span className="cal-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="card cal-day">
          <h2>{fmtDate(selected)}</h2>
          {dayTasks.length === 0 && <div className="tempty small">Задач нет</div>}
          {dayTasks.map((x) => (
            <div key={x.id} className={"trow" + (x.done ? " done" : "")}>
              <button className={"tcheck p" + x.priority + (x.done ? " checked" : "")} onClick={() => call("tasks_toggle", { id: x.id })}>
                {x.done && <Check size={12} strokeWidth={3} />}
              </button>
              <span className="trow-title">{x.title}</span>
              {x.dueTime && <span className="trow-date">{x.dueTime.slice(0, 5)}</span>}
            </div>
          ))}
          <p className="mut cal-note">Задачи создаются в модуле «Задачи».</p>
        </aside>
      </div>
    </div>
  );
}
