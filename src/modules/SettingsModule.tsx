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
        <p className="mut">Тема сохраняется и применяется при следующем запуске.</p>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={"theme-card" + (t.id === theme ? " on" : "")}
              onClick={() => onSetTheme(t.id)}
            >
              <span className="theme-prev" style={{ background: t.preview[0] }}>
                <span className="theme-prev-card" style={{ background: t.preview[1] }}>
                  <span className="theme-prev-acc" style={{ background: t.preview[2] }} />
                  <span className="theme-prev-line" style={{ background: t.preview[3], opacity: 0.55 }} />
                  <span className="theme-prev-line short" style={{ background: t.preview[3], opacity: 0.3 }} />
                </span>
              </span>
              <span className="theme-name">
                {t.label}
                {t.id === theme && <Check size={14} strokeWidth={3} />}
              </span>
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
