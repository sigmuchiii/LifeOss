import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ModuleDef } from "../moduleRegistry";

interface AppStatus {
  app: string;
  schemaVersion: number;
  modules: string[];
}

export default function ModuleStub({ module }: { module: ModuleDef }) {
  const [status, setStatus] = useState<AppStatus | null>(null);

  useEffect(() => {
    invoke<AppStatus>("app_status")
      .then(setStatus)
      .catch(() => setStatus(null)); // работает и в браузере без Tauri
  }, []);

  return (
    <div>
      <div className="phead">
        <h1>{module.label}</h1>
        <div className="phead-sub">Модуль «{module.label}» — каркас (Milestone 0)</div>
      </div>
      <div className="card">
        <p>
          Экран модуля будет реализован по спецификации{" "}
          <code>docs/modules/</code> и Bento-дизайну (<code>docs/design/bento-design.html</code>).
        </p>
        <p className="mut">
          {status
            ? `Backend: ${status.app}, миграций применено: ${status.schemaVersion}`
            : "Backend недоступен (запуск вне Tauri)"}
        </p>
      </div>
    </div>
  );
}
