import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Play, Pause, RotateCcw } from "lucide-react";

interface FocusSession { id: number; minutes: number; label: string | null; endedAt: string }

const PRESETS = [
  { label: "Фокус 25", min: 25, kind: "focus" },
  { label: "Фокус 45", min: 45, kind: "focus" },
  { label: "Фокус 60", min: 60, kind: "focus" },
  { label: "Перерыв 5", min: 5, kind: "break" },
  { label: "Перерыв 15", min: 15, kind: "break" },
];

export default function FocusModule() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [left, setLeft] = useState(PRESETS[0].min * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const tick = useRef<number | null>(null);

  const reload = () =>
    invoke<FocusSession[]>("focus_today").then(setSessions).catch(() => {});
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          if (preset.kind === "focus") {
            invoke("focus_add", { minutes: preset.min, label: null }).then(reload).catch(() => {});
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (tick.current) window.clearInterval(tick.current); };
  }, [running, preset]);

  const choose = (p: typeof PRESETS[number]) => {
    setPreset(p);
    setLeft(p.min * 60);
    setRunning(false);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const total = preset.min * 60;
  const progress = total > 0 ? 1 - left / total : 0;
  const R = 110;
  const CIRC = 2 * Math.PI * R;
  const totalMin = sessions.reduce((a, s) => a + s.minutes, 0);

  return (
    <div className="focus">
      <div className="phead">
        <h1>Фокус</h1>
        <div className="phead-sub">Помодоро-таймер. Завершённые фокус-сессии сохраняются.</div>
      </div>

      <div className="focus-body">
        <div className="card focus-timer">
          <div className="focus-presets">
            {PRESETS.map((p) => (
              <button key={p.label} className={"fpreset" + (p === preset ? " on" : "") + (p.kind === "break" ? " brk" : "")} onClick={() => choose(p)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className={"focus-ring" + (left === 0 ? " donepulse" : "")}>
            <svg width="260" height="260" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r={R} className="fr-track" />
              <circle
                cx="130" cy="130" r={R} className="fr-bar"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - progress)}
                transform="rotate(-90 130 130)"
              />
            </svg>
            <div className="focus-time">{left === 0 ? "Готово!" : `${mm}:${ss}`}</div>
          </div>

          <div className="focus-controls">
            {left > 0 && (
              <button className="btn-acc big" onClick={() => setRunning((v) => !v)}>
                {running ? <Pause size={18} /> : <Play size={18} />}
                {running ? "Пауза" : "Старт"}
              </button>
            )}
            <button className="btn-quiet big" onClick={() => choose(preset)}>
              <RotateCcw size={16} /> Сброс
            </button>
          </div>
        </div>

        <div className="card focus-log">
          <h2>Сегодня</h2>
          <div className="focus-total">{totalMin} мин в фокусе · {sessions.length} сессий</div>
          {sessions.length === 0 && <div className="tempty small">Пока нет завершённых сессий</div>}
          {sessions.map((s) => (
            <div key={s.id} className="fsession">
              <span className="fs-dot" />
              <span className="fs-min">{s.minutes} мин</span>
              <span className="fs-time">{s.endedAt.slice(11, 16)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
