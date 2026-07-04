import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { todayISO, dowMon, MONTHS_FULL, WEEKDAYS_SHORT } from "../lib/dates";

interface DiaryEntry {
  date: string;
  rating: number | null;
  mood: string;
  energy: string;
  entry: string;
  doneItems: string; // JSON-массив строк
}
interface Task { id: number; title: string; done: boolean; deletedAt: string | null; completedAt: string | null }
interface Snapshot { tasks: Task[] }
interface Habit { id: number; title: string; days: string; timeOfDay: string | null }
interface HabitMark { habitId: number; date: string; status: string }

const ratingColor = (r: number) => `hsl(${r * 12}, 62%, 44%)`;

export default function DiaryModule() {
  const t = todayISO();
  const [month, setMonth] = useState(t.slice(0, 7)); // YYYY-MM
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    invoke<DiaryEntry[]>("diary_month", { month }).then(setEntries).catch((e) => setError(String(e)));
  }, [month]);
  useEffect(() => reload(), [reload]);

  const entryOf = (date: string) => entries.find((e) => e.date === date) ?? null;

  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDow = dowMon(new Date(y, m - 1, 1));

  const shift = (d: number) => {
    const nm = new Date(y, m - 1 + d, 1);
    setMonth(`${nm.getFullYear()}-${String(nm.getMonth() + 1).padStart(2, "0")}`);
  };

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);

  return (
    <div className="diary">
      <header className="diary-head">
        <h1>Дневник</h1>
        <div className="diary-nav">
          <button className="cal-nav" onClick={() => shift(-1)}><ChevronLeft size={17} /></button>
          <span className="diary-month">{MONTHS_FULL[m - 1]} {y}</span>
          <button className="cal-nav" onClick={() => shift(1)}><ChevronRight size={17} /></button>
          {month !== t.slice(0, 7) && (
            <button className="btn-quiet" onClick={() => setMonth(t.slice(0, 7))}>Сегодня</button>
          )}
        </div>
      </header>
      {error && <div className="terr">Ошибка: {error}</div>}

      <div className="diary-dow">
        {WEEKDAYS_SHORT.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="dgrid">
        {cells.map((date, i) => {
          if (!date) return <div key={"e" + i} className="dcell empty" />;
          const e = entryOf(date);
          const rated = e && e.rating !== null && e.rating !== undefined;
          const num = Number(date.slice(8));
          return (
            <button
              key={date}
              className={"dcell" + (date === t ? " today" : "") + (rated ? " rated" : "")}
              style={rated ? { borderColor: ratingColor(e!.rating!) } : undefined}
              onClick={() => setOpenDate(date)}
            >
              <span className="dcell-head">
                <span className="dcell-num">{num}</span>
                {rated && <span className="dcell-rating" style={{ color: ratingColor(e!.rating!) }}>{e!.rating}/10</span>}
              </span>
            </button>
          );
        })}
      </div>

      {openDate && (
        <DayModal
          date={openDate}
          entry={entryOf(openDate)}
          onClose={() => { setOpenDate(null); reload(); }}
        />
      )}
    </div>
  );
}

function DayModal({ date, entry, onClose }: {
  date: string;
  entry: DiaryEntry | null;
  onClose: () => void;
}) {
  const [rating, setRating] = useState<number | null>(entry?.rating ?? null);
  const [mood, setMood] = useState(entry?.mood ?? "");
  const [energy, setEnergy] = useState(entry?.energy ?? "");
  const [text, setText] = useState(entry?.entry ?? "");
  const [manual, setManual] = useState<string[]>(() => {
    try { return JSON.parse(entry?.doneItems ?? "[]"); } catch { return []; }
  });
  const [manualDraft, setManualDraft] = useState("");
  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const [doneHabits, setDoneHabits] = useState<string[]>([]);

  useEffect(() => {
    invoke<Snapshot>("tasks_snapshot").then((s) => {
      setDoneTasks(
        s.tasks
          .filter((x) => !x.deletedAt && x.done && (x.completedAt ?? "").slice(0, 10) === date)
          .map((x) => x.title)
      );
    }).catch(() => {});
    invoke<Habit[]>("habits_list").then((hs) => {
      invoke<HabitMark[]>("habit_marks_range", { from: date, to: date }).then((ms) => {
        const doneIds = new Set(ms.filter((x) => x.status === "done").map((x) => x.habitId));
        setDoneHabits(hs.filter((h) => doneIds.has(h.id)).map((h) => h.title));
      }).catch(() => {});
    }).catch(() => {});
  }, [date]);

  const save = (patch?: { rating?: number | null; manual?: string[] }) => {
    invoke("diary_set", {
      date,
      rating: patch && "rating" in patch ? patch.rating : rating,
      mood, energy, entry: text,
      doneItems: JSON.stringify(patch?.manual ?? manual),
    }).catch(() => {});
  };

  const setR = (r: number) => {
    const next = rating === r ? null : r;
    setRating(next);
    save({ rating: next });
  };

  const addManual = () => {
    const v = manualDraft.trim();
    if (!v) return;
    const next = [...manual, v];
    setManual(next);
    setManualDraft("");
    save({ manual: next });
  };

  const rmManual = (i: number) => {
    const next = manual.filter((_, idx) => idx !== i);
    setManual(next);
    save({ manual: next });
  };

  const [yy, mm, dd] = date.split("-").map(Number);

  return (
    <>
      <div className="dmodal-backdrop" onClick={onClose} />
      <div className="dmodal card">
        <header className="dmodal-head">
          <h2>{dd} {MONTHS_FULL[mm - 1].toLowerCase()} {yy}</h2>
          <button className="qn-btn" onClick={onClose}><X size={17} /></button>
        </header>

        <div className="dmodal-lbl">Оценка дня</div>
        <div className="drating">
          {Array.from({ length: 11 }, (_, r) => (
            <button
              key={r}
              className={"drate" + (rating === r ? " on" : "")}
              style={rating === r ? { background: ratingColor(r), borderColor: ratingColor(r) } : undefined}
              onClick={() => setR(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="dmodal-2col">
          <label>
            <span className="dmodal-lbl">Настроение</span>
            <input className="field" value={mood} placeholder="Например: 🙂 спокойное"
              onChange={(e) => setMood(e.target.value)} onBlur={() => save()} />
          </label>
          <label>
            <span className="dmodal-lbl">Энергия</span>
            <input className="field" value={energy} placeholder="Например: ⚡ высокая"
              onChange={(e) => setEnergy(e.target.value)} onBlur={() => save()} />
          </label>
        </div>

        <div className="dmodal-lbl">Что сделано</div>
        <div className="ddone">
          {doneTasks.map((x, i) => <div key={"t" + i} className="ddone-row">✅ {x}</div>)}
          {doneHabits.map((x, i) => <div key={"h" + i} className="ddone-row">🔁 {x}</div>)}
          {manual.map((x, i) => (
            <div key={"m" + i} className="ddone-row manual">
              <span className="ddot" /> {x}
              <button className="qn-btn del" onClick={() => rmManual(i)}><X size={13} /></button>
            </div>
          ))}
          {doneTasks.length === 0 && doneHabits.length === 0 && manual.length === 0 && (
            <div className="mut">Пока пусто</div>
          )}
          <div className="ddone-add">
            <input
              className="field"
              value={manualDraft}
              placeholder="Добавить пункт вручную…"
              onChange={(e) => setManualDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addManual(); }}
            />
          </div>
        </div>

        <div className="dmodal-lbl">Запись дня</div>
        <textarea
          className="field dmodal-entry"
          rows={7}
          value={text}
          placeholder="Как прошёл день…"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => save()}
        />
      </div>
    </>
  );
}
