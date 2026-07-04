import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Pin, Trash2 } from "lucide-react";
import { fmtDate } from "../lib/dates";

interface QuickNote { id: number; content: string; pinned: boolean; createdAt: string; updatedAt: string }

export default function QuickNotesModule() {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    invoke<QuickNote[]>("qnotes_list").then(setNotes).catch((e) => setError(String(e)));
  }, []);
  useEffect(() => reload(), [reload]);

  const call = (cmd: string, args?: Record<string, unknown>) =>
    invoke(cmd, args).then(reload).catch((e) => setError(String(e)));

  const add = async () => {
    const v = draft.trim();
    if (!v) return;
    await call("qnotes_add", { content: v });
    setDraft("");
  };

  const pinned = notes.filter((n) => n.pinned);
  const rest = notes.filter((n) => !n.pinned);

  const NoteCard = ({ n }: { n: QuickNote }) => {
    const [text, setText] = useState(n.content);
    return (
      <div className={"qnote card" + (n.pinned ? " pinned" : "")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => { if (text.trim() && text !== n.content) call("qnotes_update", { id: n.id, content: text, pinned: n.pinned }); }}
        />
        <div className="qnote-foot">
          <span className="qnote-date">{fmtDate(n.createdAt.slice(0, 10))}</span>
          <span className="qnote-actions">
            <button className={"qn-btn" + (n.pinned ? " on" : "")} title={n.pinned ? "Открепить" : "Закрепить"}
              onClick={() => call("qnotes_update", { id: n.id, content: n.content, pinned: !n.pinned })}>
              <Pin size={14} />
            </button>
            <button className="qn-btn del" title="Удалить" onClick={() => call("qnotes_delete", { id: n.id })}>
              <Trash2 size={14} />
            </button>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="qnotes">
      <div className="phead">
        <h1>Быстрые заметки</h1>
        <div className="phead-sub">Ctrl+Enter — сохранить</div>
      </div>
      {error && <div className="terr">Ошибка: {error}</div>}

      <div className="card qnote-new">
        <textarea
          value={draft}
          placeholder="Быстрая мысль, идея, ссылка…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) add(); }}
        />
        <div className="qnote-new-foot">
          <button className="btn-acc" onClick={add}>Сохранить</button>
        </div>
      </div>

      {pinned.length > 0 && (
        <>
          <div className="tgroup-label">Закреплённые</div>
          <div className="qnote-grid">{pinned.map((n) => <NoteCard key={n.id} n={n} />)}</div>
        </>
      )}
      {rest.length > 0 && (
        <>
          {pinned.length > 0 && <div className="tgroup-label">Остальные</div>}
          <div className="qnote-grid">{rest.map((n) => <NoteCard key={n.id} n={n} />)}</div>
        </>
      )}
      {notes.length === 0 && <div className="tempty">Заметок пока нет</div>}
    </div>
  );
}
