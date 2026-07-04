import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { toISO, todayISO, addDays, MONTHS_FULL, WEEKDAYS_SHORT } from "../lib/dates";

interface Props {
  date: string | null;
  time?: string | null;
  withTime?: boolean;
  onChange: (date: string | null, time: string | null) => void;
  onClose: () => void;
}

/** Красивый выбор даты (и опционально времени): быстрые кнопки + мини-календарь. */
export default function DatePicker({ date, time, withTime, onChange, onClose }: Props) {
  const t = todayISO();
  const init = date ?? t;
  const [cur, setCur] = useState(() => ({ y: +init.slice(0, 4), m: +init.slice(5, 7) - 1 }));

  const cells = useMemo(() => {
    const first = new Date(cur.y, cur.m, 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    const out: { iso: string; day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({ iso: toISO(d), day: d.getDate(), inMonth: d.getMonth() === cur.m });
    }
    return out;
  }, [cur]);

  const move = (n: number) => {
    const d = new Date(cur.y, cur.m + n, 1);
    setCur({ y: d.getFullYear(), m: d.getMonth() });
  };

  const pick = (iso: string | null) => {
    onChange(iso, iso ? (time ?? null) : null);
    if (!withTime) onClose();
  };

  return (
    <div className="dp" onClick={(e) => e.stopPropagation()}>
      <div className="dp-quick">
        <button onClick={() => pick(t)}>Сегодня</button>
        <button onClick={() => pick(addDays(t, 1))}>Завтра</button>
        <button onClick={() => pick(addDays(t, 7))}>Через неделю</button>
        <button className="dp-clear" onClick={() => pick(null)}>Без даты</button>
      </div>
      <div className="dp-head">
        <button className="dp-nav" onClick={() => move(-1)}><ChevronLeft size={15} /></button>
        <span>{MONTHS_FULL[cur.m]} {cur.y}</span>
        <button className="dp-nav" onClick={() => move(1)}><ChevronRight size={15} /></button>
      </div>
      <div className="dp-grid">
        {WEEKDAYS_SHORT.map((w) => <span key={w} className="dp-dow">{w}</span>)}
        {cells.map((c) => (
          <button
            key={c.iso}
            className={
              "dp-day" + (c.inMonth ? "" : " out") + (c.iso === t ? " now" : "") + (c.iso === date ? " sel" : "")
            }
            onClick={() => pick(c.iso)}
          >
            {c.day}
          </button>
        ))}
      </div>
      {withTime && (
        <div className="dp-time">
          <Clock size={14} />
          <input
            type="time"
            className="field"
            value={time ?? ""}
            disabled={!date}
            onChange={(e) => onChange(date, e.target.value || null)}
          />
          {time && (
            <button className="dp-timeclear" title="Убрать время" onClick={() => onChange(date, null)}>
              <X size={13} />
            </button>
          )}
          <button className="btn-acc dp-done" onClick={onClose}>Готово</button>
        </div>
      )}
    </div>
  );
}
