import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Check } from "lucide-react";
import { THEMES } from "../themes";

interface AppStatus {
  app: string;
  schemaVersion: number;
  modules: string[];
}

export default function SettingsModule({ theme, onSetTheme }: {
  theme: string;
  onSetTheme: (id: string) => void;
}) {
  const [status, setStatus] = useState<AppStatus | null>(null);

  useEffect(() => {
    invoke<AppStatus>("app_status").then(setStatus).catch(() => setStatus(null));
  }, []);

  return (
    <div className="settings">
      <div className="phead">
        <h1>Настройки</h1>
      </div>

      <section className="card set-card">
        <h2>Тема оформления</h2>
        <p className="mut">Минималистичный выбор: точка показывает фон и акцент темы.</p>
        <div className="thdots">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={"thdot" + (t.id === theme ? " on" : "")}
              onClick={() => onSetTheme(t.id)}
              title={t.label}
            >
              <span className="thdot-c" style={{ background: t.bg }}>
                {t.id === theme ? <Check size={15} strokeWidth={3.5} color={t.acc} /> : <span style={{ background: t.acc }} />}
              </span>
              <span className="thdot-lbl">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card set-card">
        <h2>О приложении</h2>
        <p className="mut">
          {status
            ? `${status.app} · миграций базы: ${status.schemaVersion} · модулей: ${status.modules.length}`
            : "LifeOss (браузерный режим — Rust-бэкенд недоступен)"}
        </p>
      </section>
    </div>
  );
}
