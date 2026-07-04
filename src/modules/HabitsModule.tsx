import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Check, Minus, Flame } from "lucide-react";
import { todayISO, addDays, dowMon, WEEKDAYS_SHORT } from "../lib/dates";
import { useCtxMenu } from "../components/ContextMenu";

interface Habit { id: number; title: string; days: string; timeOfDay: string | null }
interface HabitMark { habitId: number; date: string; status: string }

const DAYS_ALL = "1111111";

export default function HabitsModule() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [marks, setMarks] = useState<HabitMark[]>([]);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(DAYS_ALL);
  const [time, setTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctx = useCtxMenu();

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
    await call("habits_add", { title: v, days, timeOfDay: time || null });
    setTitle("");
    setDays(DAYS_ALL);
    setTime("");
    setAdding(false);
  };

  const preset = (p: string) => setDays(p);
  const presetCls = (p: string) => "hp-btn" + (days === p ? " on" : "");

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
        <div className="card hadd2">
          <div className="hadd2-row">
            <span className="hadd2-emoji">🔁</span>
            <input
              className="field"
              autoFocus
              value={title}
              placeholder="Например: Чтение 30 минут"
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }}
            />
          </div>

          <div className="hadd2-cols">
            <div>
              <div className="hadd2-lbl">Дни недели</div>
              <div className="hadd2-presets">
                <button className={presetCls("1111111")} onClick={() => preset("1111111")}>Каждый день</button>
                <button className={presetCls("1111100")} onClick={() => preset("1111100")}>Будни</button>
                <button className={presetCls("0000011")} onClick={() => preset("0000011")}>Выходные</button>
              </div>
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
            </div>
            <div>
              <div className="hadd2-lbl">Время <span className="mut">(появится на таймлайне «Сегодня»)</span></div>
              <input type="time" className="field hadd2-time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="hadd-actions">
            <button className="btn-acc" disabled={!title.trim()} onClick={add}>Добавить привычку</button>
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
                  const dd = new Date(d + "T00:00:00");
                  return (
                    <th key={d} className={d === t ? "hg-today" : ""}>
                      <span className="hg-dow">{WEEKDAYS_SHORT[dowMon(dd)]}</span>
                      <span className="hg-num">{dd.getDate()}</span>
                    </th>
                  );
                })}
                <th className="hg-streak" title="Серия"><Flame size={14} /></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  <td
                    className="hg-name"
                    onContextMenu={(e) => ctx.open(e, [
                      { label: "🗑 Удалить привычку", danger: true, onClick: () => call("habits_delete", { id: h.id }) },
                    ])}
                  >
                    {h.title}
                    {h.timeOfDay && <span className="hg-time">🕓 {h.timeOfDay.slice(0, 5)}</span>}
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mut hgrid-hint">ПКМ по названию привычки — удаление</p>
        </div>
      )}
    </div>
  );
}
