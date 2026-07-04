import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Check } from "lucide-react";
import { todayISO, fmtLongDate, fmtDate, dowMon } from "../lib/dates";
import { useCtxMenu } from "../components/ContextMenu";

interface Task {
  id: number; title: string; done: boolean; priority: number;
  dueDate: string | null; dueTime: string | null; deletedAt: string | null;
  completedAt: string | null;
}
interface Snapshot { tasks: Task[] }
interface Habit { id: number; title: string; days: string; timeOfDay: string | null }
interface HabitMark { habitId: number; date: string; status: string }

interface TlItem {
  key: string;
  kind: "task" | "habit";
  id: number;
  title: string;
  time: string;    // HH:MM
  minutes: number;
  done: boolean;
}

const COLS = [
  { label: "08:00 – 16:00", start: 8 * 60, end: 16 * 60 },
  { label: "16:00 – 23:59", start: 16 * 60, end: 24 * 60 },
];
const COL_H = 620;
const CARD_MIN_GAP = 68;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export default function TodayModule({ onOpenTasks }: { onOpenTasks: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [marks, setMarks] = useState<HabitMark[]>([]);
  const [quick, setQuick] = useState("");
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const ctx = useCtxMenu();
  const t = todayISO();

  const reload = useCallback(() => {
    invoke<Snapshot>("tasks_snapshot").then((s) => setTasks(s.tasks)).catch((e) => setError(String(e)));
    invoke<Habit[]>("habits_list").then(setHabits).catch(() => {});
    invoke<HabitMark[]>("habit_marks_range", { from: t, to: t }).then(setMarks).catch(() => {});
  }, [t]);
  useEffect(() => reload(), [reload]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

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

  // ---- Таймлайн: задачи со временем + привычки со временем ----
  const timeline: TlItem[] = useMemo(() => {
    const items: TlItem[] = [];
    const doneTasks = tasks.filter((x) => !x.deletedAt && x.done && (x.completedAt ?? "").slice(0, 10) === t);
    [...todays, ...doneTasks].forEach((x) => {
      if (x.dueTime) {
        items.push({
          key: "t" + x.id, kind: "task", id: x.id, title: x.title,
          time: x.dueTime.slice(0, 5), minutes: toMin(x.dueTime), done: x.done,
        });
      }
    });
    todayHabits.forEach((h) => {
      if (h.timeOfDay) {
        items.push({
          key: "h" + h.id, kind: "habit", id: h.id, title: h.title,
          time: h.timeOfDay.slice(0, 5), minutes: toMin(h.timeOfDay), done: markOf(h.id) === "done",
        });
      }
    });
    return items.sort((a, b) => a.minutes - b.minutes);
  }, [tasks, todays, todayHabits, marks, t]);

  const untimedTasks = [...overdue, ...todays.filter((x) => !x.dueTime)];
  const untimedHabits = todayHabits.filter((h) => !h.timeOfDay);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const addQuick = async () => {
    const title = quick.trim();
    if (!title) return;
    await call("tasks_add", { title, priority: 0, dueDate: t, listId: null });
    setQuick("");
  };

  const hour = now.getHours();
  const greet = hour < 5 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  const itemMenu = (it: TlItem) =>
    it.kind === "task"
      ? [
          { label: it.done ? "↩️ Вернуть в работу" : "✅ Выполнить", onClick: () => call("tasks_toggle", { id: it.id }) },
          { label: "📋 Открыть «Задачи»", onClick: onOpenTasks },
        ]
      : [
          { label: it.done ? "↩️ Снять отметку" : "✅ Выполнено", onClick: () => cycleHabit(it.id) },
        ];

  const renderColumn = (ci: number) => {
    const col = COLS[ci];
    const items = timeline.filter((x) =>
      ci === 0 ? x.minutes < col.end : x.minutes >= col.start
    );
    // раскладываем: пропорционально времени, но без наложений
    let lastTop = -CARD_MIN_GAP;
    const placed = items.map((it) => {
      const clamped = Math.max(col.start, Math.min(it.minutes, col.end - 1));
      let top = ((clamped - col.start) / (col.end - col.start)) * (COL_H - 60);
      if (top < lastTop + CARD_MIN_GAP) top = lastTop + CARD_MIN_GAP;
      lastTop = top;
      return { it, top };
    });
    const showNow = ci === (nowMin < COLS[1].start ? 0 : 1);
    const nowClamped = Math.max(col.start, Math.min(nowMin, col.end - 1));
    const nowTop = ((nowClamped - col.start) / (col.end - col.start)) * (COL_H - 60);

    return (
      <div className="tl-col" key={ci}>
        <div className="tl-head">{col.label}</div>
        <div className="tl-track" style={{ height: COL_H }}>
          <div className="tl-line" />
          {showNow && (
            <div className="tl-now" style={{ top: nowTop }}>
              <span className="tl-now-pill">Сейчас {nowLabel}</span>
              <span className="tl-now-dot" />
              <span className="tl-now-line" />
            </div>
          )}
          {placed.map(({ it, top }) => (
            <div key={it.key}>
              <span className="tl-time" style={{ top }}>{it.time}</span>
              <div
                className={"tl-item " + it.kind + (it.done ? " done" : "")}
                style={{ top }}
                onContextMenu={(e) => ctx.open(e, itemMenu(it))}
              >
                <span className="tl-emoji">{it.kind === "task" ? "✅" : "🔁"}</span>
                <span className="tl-t">
                  <b>{it.title}</b>
                  <span>{it.time} · {it.kind === "task" ? "Задача" : "Привычка"}</span>
                </span>
                <button
                  className={"tl-check" + (it.done ? " on" : "")}
                  title={it.done ? "Снять отметку" : "Выполнено"}
                  onClick={() => (it.kind === "task" ? call("tasks_toggle", { id: it.id }) : cycleHabit(it.id))}
                >
                  {it.done && <Check size={14} strokeWidth={3} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="today">
      <div className="today-top">
        <div className="phead">
          <h1>{greet}!</h1>
          <div className="phead-sub">{fmtLongDate(now)}</div>
        </div>
        <div className="today-chips">
          <span className="tchip">📋 {todays.length + overdue.length} задач</span>
          <span className="tchip ok">✅ {doneToday.length} выполнено</span>
          <span className="tchip acc">🔁 {habitsDone}/{todayHabits.length} привычки</span>
        </div>
      </div>

      {error && <div className="terr">Ошибка: {error}</div>}

      <div className="qa today-qa">
        <button className="qa-plus" title="Добавить" onClick={addQuick}><Plus size={16} /></button>
        <input
          value={quick}
          placeholder="Добавить задачу на сегодня…"
          onChange={(e) => setQuick(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addQuick(); }}
        />
      </div>

      {(untimedTasks.length > 0 || untimedHabits.length > 0) && (
        <div className="tl-untimed">
          {untimedTasks.map((x) => (
            <button
              key={"t" + x.id}
              className={"uchip" + (x.dueDate && x.dueDate < t ? " over" : "")}
              onClick={() => call("tasks_toggle", { id: x.id })}
              onContextMenu={(e) => ctx.open(e, [
                { label: "✅ Выполнить", onClick: () => call("tasks_toggle", { id: x.id }) },
                { label: "📋 Открыть «Задачи»", onClick: onOpenTasks },
              ])}
              title="Клик — выполнить"
            >
              <span className="uchip-ring" />
              {x.title}
              {x.dueDate && x.dueDate < t && <em>{fmtDate(x.dueDate)}</em>}
            </button>
          ))}
          {untimedHabits.map((h) => {
            const st = markOf(h.id);
            return (
              <button
                key={"h" + h.id}
                className={"uchip habit" + (st === "done" ? " done" : "")}
                onClick={() => cycleHabit(h.id)}
                onContextMenu={(e) => ctx.open(e, [
                  { label: st === "done" ? "↩️ Снять отметку" : "✅ Выполнено", onClick: () => cycleHabit(h.id) },
                ])}
              >
                <span className="uchip-ring" />
                🔁 {h.title}
              </button>
            );
          })}
        </div>
      )}

      {timeline.length === 0 ? (
        <div className="tempty">
          На таймлайне пусто — добавь задачам время или укажи время у привычек, и они появятся здесь 🕓
        </div>
      ) : (
        <div className="tl">
          {renderColumn(0)}
          {renderColumn(1)}
        </div>
      )}
    </div>
  );
}
