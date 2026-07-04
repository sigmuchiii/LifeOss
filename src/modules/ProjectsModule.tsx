import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus } from "lucide-react";
import { useCtxMenu } from "../components/ContextMenu";

interface Project {
  id: number;
  title: string;
  description: string;
  stage: string;
  blockers: string;
  nextActions: string;
  notes: string;
}

export default function ProjectsModule() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selId, setSelId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ctx = useCtxMenu();

  const reload = useCallback(() => {
    invoke<Project[]>("projects_list").then(setProjects).catch((e) => setError(String(e)));
  }, []);
  useEffect(() => reload(), [reload]);

  const call = (cmd: string, args?: Record<string, unknown>) =>
    invoke(cmd, args).then(reload).catch((e) => setError(String(e)));

  const add = async () => {
    const v = newTitle.trim();
    if (!v) return;
    try {
      const id = await invoke<number>("projects_add", { title: v });
      setNewTitle("");
      setAdding(false);
      reload();
      setSelId(id);
    } catch (e) { setError(String(e)); }
  };

  const sel = projects.find((p) => p.id === selId) ?? null;

  return (
    <div className="projects">
      <aside className="tsb">
        <div className="tsb-sec">
          <span>Список</span>
          <button className="tsb-plus" title="Новый проект" onClick={() => setAdding((v) => !v)}>
            <Plus size={14} />
          </button>
        </div>
        {adding && (
          <input
            className="tsb-newlist"
            autoFocus
            value={newTitle}
            placeholder="Название проекта…"
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }}
          />
        )}
        {projects.map((p) => (
          <button
            key={p.id}
            className={"tsb-item" + (p.id === selId ? " on" : "")}
            onClick={() => setSelId(p.id)}
            onContextMenu={(e) => ctx.open(e, [
              { label: "🗄 Архивировать", danger: true, onClick: () => { if (selId === p.id) setSelId(null); call("projects_archive", { id: p.id }); } },
            ])}
          >
            <span className="tsb-dot" />
            <span className="tsb-label">{p.title || "Без названия"}</span>
          </button>
        ))}
        {projects.length === 0 && !adding && <div className="proj-empty-side">Создайте проект</div>}
      </aside>

      <section className="proj-main">
        {error && <div className="terr">Ошибка: {error}</div>}
        {!sel ? (
          <div className="tempty proj-empty">
            {projects.length === 0 ? "Создайте проект — плюс слева сверху" : "Выберите проект слева"}
          </div>
        ) : (
          <ProjectEditor key={sel.id} project={sel} onSave={(p) =>
            call("projects_update", {
              id: p.id, title: p.title, description: p.description, stage: p.stage,
              blockers: p.blockers, nextActions: p.nextActions, notes: p.notes,
            })
          } />
        )}
      </section>
    </div>
  );
}

function ProjectEditor({ project, onSave }: { project: Project; onSave: (p: Project) => void }) {
  const [p, setP] = useState(project);
  const save = () => onSave(p);
  const upd = (patch: Partial<Project>) => setP((prev) => ({ ...prev, ...patch }));

  const fields: { key: keyof Project; label: string; rows: number; ph: string }[] = [
    { key: "description", label: "Описание", rows: 3, ph: "О чём этот проект…" },
    { key: "stage", label: "Этап", rows: 1, ph: "Например: идея, в работе, пауза…" },
    { key: "blockers", label: "Что мешает", rows: 2, ph: "Пусто, если ничего не мешает" },
    { key: "nextActions", label: "Следующие действия", rows: 3, ph: "Что делать дальше…" },
    { key: "notes", label: "Заметки", rows: 6, ph: "Свободные заметки (Markdown приветствуется)" },
  ];

  return (
    <div className="proj-editor">
      <input
        className="proj-title"
        value={p.title}
        placeholder="Название проекта"
        onChange={(e) => upd({ title: e.target.value })}
        onBlur={save}
      />
      <div className="proj-fields">
        {fields.map((f) => (
          <label key={f.key} className="proj-field">
            <span className="proj-lbl">{f.label}</span>
            <textarea
              className="field"
              rows={f.rows}
              value={p[f.key] as string}
              placeholder={f.ph}
              onChange={(e) => upd({ [f.key]: e.target.value } as Partial<Project>)}
              onBlur={save}
            />
          </label>
        ))}
      </div>
      <p className="mut proj-hint">Сохраняется автоматически · ПКМ по проекту слева — архивирование</p>
    </div>
  );
}
