import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Check, ArrowRight, Minus } from "lucide-react";
import { todayISO, fmtDate, fmtLongDate, dowMon } from "../lib/dates";

interface Task {
  id: number; title: string; done: boolean; priority: number;
  dueDate: string | null; dueTime: string | null; deletedAt: string | null;
  listId: number | null; createdAt: string; completedAt: string | null;
}
interface Snapshot { tasks: Task[] }
interface Habit { id: number; title: string; days: string }
interface HabitMark { habitId: number; date: string; status: string }

export default function TodayModule({ onOpenTasks }: { onOpenTasks: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [marks, setMarks] = useState<HabitMark[]>([]);
  const [quick, setQuick] = useState("");
  const [error, setError] = useState<string | null>(null);
  const t = todayISO();

  const reload = useCallback(() => {
    invoke<Snapshot>("tasks_snapshot").then((s) => setTasks(s.tasks)).catch((e) => setError(String(e)));
    invoke<Habit[]>("habits_list").then(setHabits).catch(() => {});
    invoke<HabitMark[]>("habit_marks_range", { from: t, to: t }).then(setMarks).catch(() => {});
  }, [t]);
  useEffect(() => reload(), [reload]);

  const call = (cmd: string, args?: Record<string, unknown>) =>
    invoke(cmd, args).then(reload).catch((e) => setError(String(e)));

  const activeTasks = tasks.filter((x) => !x.deletedAt && !x.done);
  const overdue = activeTasks.filter((x) => x.dueDate && x.dueDate < t);
  const todays = activeTasks.filter((x) => x.dueDate === t);
  const doneToday = tasks.filter((x) => !x.deletedAt && x.done && (x.completedAt ?? "").slice(0, 10) === t);

  const todayHabits = useMemo(() => {
    const dow = dowMon(new Date());
    return habits.filter((h) => h.days[dow] === "1");
  }, [habits]);
  const markOf = (id: number) => marks.find((m) => m.habitId === id)?.status ?? "";
  const habitsDone = todayHabits.filter((h) => markOf(h.id) === "done").length;

  const cycleHabit = (id: number) => {
    const cur = markOf(id);
    const next = cur === "" ? "done" : cur === "done" ? "skip" : "";
    call("habit_mark_set", { habitId: id, date: t, status: next });
  };

  const addQuick = async () => {
    const title = quick.trim();
    if (!title) return;
    await call("tasks_add", { title, priority: 0, dueDate: t, listId: null });
    setQuick("");
  };

  const hour = new Date().getHours();
  const greet = hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  return (
    <div className="today">
      <div className="phead">
        <h1>{greet}!</h1>
        <div className="phead-sub">{fmtLongDate(new Date())}</div>
      </div>

      {error && <div className="terr">Ошибка: {error}</div>}

      <div className="today-stats">
        <div className="card tstat"><span className="tstat-num">{todays.length + overdue.length}</span><span className="tstat-lbl">задач на сегодня</span></div>
        <div className="card tstat"><span className="tstat-num ok">{doneToday.length}</span><span className="tstat-lbl">выполнено сегодня</span></div>
        <div className="card tstat"><span className="tstat-num acc">{habitsDone}/{todayHabits.length}</span><span className="tstat-lbl">привычки</span></div>
      </div>

      <section className="card today-sec">
        <div className="today-sec-head">
          <h2>Задачи</h2>
          <button className="linkish" onClick={onOpenTasks}>Все задачи <ArrowRight size={14} /></button>
        </div>
        <div className="qa">
          <button className="qa-plus" title="Добавить" onClick={addQuick}><Plus size={16} /></button>
          <input
            value={quick}
            placeholder="Добавить задачу на сегодня…"
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addQuick(); }}
          />
        </div>
        {overdue.length > 0 && (
          <>
            <div className="tgroup-label">Просрочено <span className="tgroup-count">{overdue.length}</span></div>
            {overdue.map((x) => (
              <div key={x.id} className="trow">
                <button className={"tcheck p" + x.priority} onClick={() => call("tasks_toggle", { id: x.id })} />
                <span className="trow-title">{x.title}</span>
                <span className="trow-date over">{fmtDate(x.dueDate!)}</span>
              </div>
            ))}
          </>
        )}
        <div className="tgroup-label">Сегодня <span className="tgroup-count">{todays.length}</span></div>
        {todays.length === 0 && overdue.length === 0 && <div className="tempty small">На сегодня задач нет 🎉</div>}
        {todays.map((x) => (
          <div key={x.id} className="trow">
            <button className={"tcheck p" + x.priority} onClick={() => call("tasks_toggle", { id: x.id })} />
            <span className="trow-title">{x.title}</span>
            {x.dueTime && <span className="trow-date">{x.dueTime.slice(0, 5)}</span>}
          </div>
        ))}
        {doneToday.length > 0 && (
          <>
            <div className="tgroup-label">Выполнено <span className="tgroup-count">{doneToday.length}</span></div>
            {doneToday.map((x) => (
              <div key={x.id} className="trow done">
                <button className="tcheck checked" onClick={() => call("tasks_toggle", { id: x.id })}>
                  <Check size={12} strokeWidth={3} />
                </button>
                <span className="trow-title">{x.title}</span>
              </div>
            ))}
          </>
        )}
      </section>

      {todayHabits.length > 0 && (
        <section className="card today-sec">
          <div className="today-sec-head"><h2>Привычки на сегодня</h2></div>
          <div className="today-habits">
            {todayHabits.map((h) => {
              const st = markOf(h.id);
              return (
                <button
                  key={h.id}
                  className={"hchip" + (st === "done" ? " done" : st === "skip" ? " skip" : "")}
                  title={st === "done" ? "Выполнено (клик — пропустить)" : st === "skip" ? "Пропущено (клик — сбросить)" : "Клик — отметить выполненной"}
                  onClick={() => cycleHabit(h.id)}
                >
                  {st === "done" ? <Check size={14} strokeWidth={3} /> : st === "skip" ? <Minus size={14} /> : <span className="hchip-dot" />}
                  {h.title}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
