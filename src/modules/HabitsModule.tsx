import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Check, Minus, X, Flame } from "lucide-react";
import { todayISO, addDays, dowMon, WEEKDAYS_SHORT, MONTHS } from "../lib/dates";

interface Habit { id: number; title: string; days: string }
interface HabitMark { habitId: number; date: string; status: string }

const DAYS_ALL = "1111111";

export default function HabitsModule() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [marks, setMarks] = useState<HabitMark[]>([]);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(DAYS_ALL);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = todayISO();
  const from = addDays(t, -13); // две недели

  const reload = useCallback(() => {
    invoke<Habit[]>("habits_list").then(setHabits).catch((e) => setError(String(e)));
    invoke<HabitMark[]>("habit_marks_range", { from, to: t }).then(setMarks).catch(() => {});
  }, [from, t]);
  useEffect(() => reload(), [reload]);

  const call = (cmd: string, args?: Record<string, unknown>) =>
    invoke(cmd, args).then(reload).catch((e) => setError(String(e)));

  const dates: string[] = [];
  for (let i = 13; i >= 0; i--) dates.push(addDays(t, -i));

  const markOf = (hid: number, date: string) =>
    marks.find((m) => m.habitId === hid && m.date === date)?.status ?? "";

  const cycle = (hid: number, date: string) => {
    const cur = markOf(hid, date);
    const next = cur === "" ? "done" : cur === "done" ? "skip" : "";
    call("habit_mark_set", { habitId: hid, date, status: next });
  };

  const streak = (h: Habit) => {
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = addDays(t, -i);
      const dow = dowMon(new Date(d + "T00:00:00"));
      if (h.days[dow] !== "1") continue; // незапланированные дни не рвут серию
      const st = markOf(h.id, d);
      if (st === "done") s++;
      else if (i === 0 && st === "") continue; // сегодня ещё можно успеть
      else break;
    }
    return s;
  };

  const add = async () => {
    const v = title.trim();
    if (!v) return;
    await call("habits_add", { title: v, days });
    setTitle("");
    setDays(DAYS_ALL);
    setAdding(false);
  };

  const fmtCol = (d: string) => {
    const dd = new Date(d + "T00:00:00");
    return { top: WEEKDAYS_SHORT[dowMon(dd)], num: `${dd.getDate()}`, month: MONTHS[dd.getMonth()] };
  };

  return (
    <div className="habits">
      <div className="phead">
        <h1>Привычки</h1>
        <div className="phead-sub">Клик по ячейке: выполнено → пропущено → пусто</div>
      </div>
      {error && <div className="terr">Ошибка: {error}</div>}

      {!adding ? (
        <button className="hadd-open" onClick={() => setAdding(true)}><Plus size={15} /> Новая привычка</button>
      ) : (
        <div className="card hadd">
          <input
            autoFocus
            value={title}
            placeholder="Название привычки…"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }}
          />
          <div className="hadd-days">
            {WEEKDAYS_SHORT.map((w, i) => (
              <button
                key={w}
                className={"hday" + (days[i] === "1" ? " on" : "")}
                onClick={() => setDays(days.slice(0, i) + (days[i] === "1" ? "0" : "1") + days.slice(i + 1))}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="hadd-actions">
            <button className="btn-acc" onClick={add}>Добавить</button>
            <button className="btn-quiet" onClick={() => setAdding(false)}>Отмена</button>
          </div>
        </div>
      )}

      {habits.length === 0 && !adding && <div className="tempty">Привычек пока нет — добавь первую!</div>}

      {habits.length > 0 && (
        <div className="card hgrid-card">
          <table className="hgrid">
            <thead>
              <tr>
                <th className="hg-name" />
                {dates.map((d) => {
                  const c = fmtCol(d);
                  return (
                    <th key={d} className={d === t ? "hg-today" : ""}>
                      <span className="hg-dow">{c.top}</span>
                      <span className="hg-num">{c.num}</span>
                    </th>
                  );
                })}
                <th className="hg-streak" title="Серия"><Flame size={14} /></th>
                <th />
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  <td className="hg-name">{h.title}</td>
                  {dates.map((d) => {
                    const dow = dowMon(new Date(d + "T00:00:00"));
                    const scheduled = h.days[dow] === "1";
                    const st = markOf(h.id, d);
                    return (
                      <td key={d} className={d === t ? "hg-today" : ""}>
                        {scheduled ? (
                          <button
                            className={"hcell" + (st === "done" ? " done" : st === "skip" ? " skip" : "")}
                            onClick={() => cycle(h.id, d)}
                          >
                            {st === "done" ? <Check size={13} strokeWidth={3} /> : st === "skip" ? <Minus size={13} /> : null}
                          </button>
                        ) : (
                          <span className="hcell off" />
                        )}
                      </td>
                    );
                  })}
                  <td className="hg-streak">{streak(h)}</td>
                  <td>
                    <button className="hdel" title="Удалить привычку" onClick={() => call("habits_delete", { id: h.id })}>
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
