import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Plus, Calendar as CalendarIcon, Trash2, RotateCcw, Check, X,
  Sun, Inbox, CalendarDays, CheckCircle2,
} from "lucide-react";
import DatePicker from "../components/DatePicker";
import { todayISO, addDays, fmtDate } from "../lib/dates";

// ---------- Типы (зеркалят Rust-структуры) ----------

interface Subtask {
  id: number;
  taskId: number;
  title: string;
  done: boolean;
  position: number;
}

interface Task {
  id: number;
  title: string;
  notes: string;
  done: boolean;
  priority: number; // 0 обычный, 1 важный, 2 срочный
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:MM
  status: string; // not_started | in_progress | waiting
  waitingFor: string | null;
  listId: number | null;
  createdAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  subtasks: Subtask[];
}

interface TaskList {
  id: number;
  name: string;
  position: number;
}

interface Snapshot {
  tasks: Task[];
  lists: TaskList[];
}

type SmartId = "today" | "inbox" | "next7" | "completed" | "trash";
type Target = { kind: "smart"; id: SmartId } | { kind: "list"; id: number };

const K_TARGET = "lifeoss.tasks.target";
const K_PANEL = "lifeoss.tasks.panelWidth";

// Эмодзи в приоритетах и статусах — решение владельца (2026-07-04)
const PRIORITY_LABEL = ["⚪ Обычный", "⭐ Важный", "🔥 Срочный"];
const STATUS_LABEL: Record<string, string> = {
  not_started: "🕓 Не начато",
  in_progress: "⚡ В процессе",
  waiting: "⏳ Ожидает",
};

const sortTasks = (arr: Task[]) =>
  [...arr].sort(
    (a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt) || a.id - b.id
  );

interface Group {
  key: string;
  label: string;
  overdue?: boolean;
  tasks: Task[];
}

// ---------- Основной экран ----------

export default function TasksModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [target, setTarget] = useState<Target>(() => {
    try {
      const raw = localStorage.getItem(K_TARGET);
      if (raw) return JSON.parse(raw) as Target;
    } catch { /* игнорируем */ }
    return { kind: "smart", id: "today" };
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDate, setQuickDate] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [newListOpen, setNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [panelW, setPanelW] = useState(() => Number(localStorage.getItem(K_PANEL)) || 360);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    invoke<Snapshot>("tasks_snapshot")
      .then((s) => {
        setTasks(s.tasks);
        setLists(s.lists);
        setError(null);
      })
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => reload(), [reload]);
  useEffect(() => localStorage.setItem(K_TARGET, JSON.stringify(target)), [target]);
  useEffect(() => localStorage.setItem(K_PANEL, String(panelW)), [panelW]);

  const t = todayISO();
  const active = useMemo(() => tasks.filter((x) => !x.done && !x.deletedAt), [tasks]);
  const todayCount = active.filter((x) => x.dueDate && x.dueDate <= t).length;
  const inboxCount = active.filter((x) => x.listId === null).length;

  const targetLabel = (() => {
    if (target.kind === "smart") {
      return { today: "Сегодня", inbox: "Входящие", next7: "Следующие 7 дней", completed: "Выполнено", trash: "Корзина" }[target.id];
    }
    return lists.find((l) => l.id === target.id)?.name ?? "Список";
  })();

  const groups: Group[] = useMemo(() => {
    const groupActive = (arr: Task[], onlyDated: boolean): Group[] => {
      const res: Group[] = [];
      const overdue = arr.filter((x) => x.dueDate && x.dueDate < t);
      if (overdue.length) res.push({ key: "overdue", label: "Просрочено", overdue: true, tasks: sortTasks(overdue) });
      const byDate = new Map<string, Task[]>();
      arr.filter((x) => x.dueDate && x.dueDate >= t).forEach((x) => {
        const k = x.dueDate!;
        if (!byDate.has(k)) byDate.set(k, []);
        byDate.get(k)!.push(x);
      });
      [...byDate.keys()].sort().forEach((k) => res.push({ key: k, label: fmtDate(k), tasks: sortTasks(byDate.get(k)!) }));
      const undated = arr.filter((x) => !x.dueDate);
      if (!onlyDated && undated.length) res.push({ key: "nodate", label: "Без даты", tasks: undated }); // порядок создания
      return res;
    };

    if (target.kind === "list") return groupActive(active.filter((x) => x.listId === target.id), false);
    switch (target.id) {
      case "today":
        return groupActive(active.filter((x) => x.dueDate && x.dueDate <= t), true);
      case "inbox":
        return groupActive(active.filter((x) => x.listId === null), false);
      case "next7":
        return groupActive(active.filter((x) => x.dueDate && x.dueDate > t && x.dueDate <= addDays(t, 7)), true);
      case "completed": {
        const done = tasks.filter((x) => x.done && !x.deletedAt);
        const byDay = new Map<string, Task[]>();
        done.forEach((x) => {
          const k = (x.completedAt ?? x.createdAt).slice(0, 10);
          if (!byDay.has(k)) byDay.set(k, []);
          byDay.get(k)!.push(x);
        });
        return [...byDay.keys()].sort().reverse().map((k) => ({ key: k, label: fmtDate(k), tasks: byDay.get(k)! }));
      }
      case "trash": {
        const del = tasks.filter((x) => x.deletedAt);
        return del.length ? [{ key: "trash", label: "Удалённые", tasks: del }] : [];
      }
    }
  }, [tasks, active, target, t]);

  const selected = selectedId !== null ? tasks.find((x) => x.id === selectedId) ?? null : null;
  const isTrash = target.kind === "smart" && target.id === "trash";
  const showQuickAdd = !isTrash && !(target.kind === "smart" && target.id === "completed");

  // ---------- Действия ----------

  const call = (cmd: string, args?: Record<string, unknown>) =>
    invoke(cmd, args).then(reload).catch((e) => setError(String(e)));

  const quickAdd = async () => {
    const title = quickTitle.trim();
    if (!title) return;
    let dueDate = quickDate;
    let listId: number | null = null;
    if (target.kind === "list") listId = target.id;
    else if (target.id === "today" && !dueDate) dueDate = t;
    else if (target.id === "next7" && !dueDate) dueDate = addDays(t, 1);
    await call("tasks_add", { title, priority: 0, dueDate, listId });
    setQuickTitle("");
    setQuickDate(null);
  };

  const addList = async () => {
    const name = newListName.trim();
    if (!name) return;
    await call("lists_add", { name });
    setNewListName("");
    setNewListOpen(false);
  };

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const start = panelW;
    const move = (ev: MouseEvent) =>
      setPanelW(Math.min(620, Math.max(300, start + (startX - ev.clientX))));
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const smartTop: SmartId[] = ["today", "inbox", "next7"];
  const smartBottom: SmartId[] = ["completed", "trash"];
  const SMART_ICON: Record<SmartId, typeof Sun> = {
    today: Sun, inbox: Inbox, next7: CalendarDays, completed: CheckCircle2, trash: Trash2,
  };
  const SMART_COUNT: Partial<Record<SmartId, number>> = { today: todayCount, inbox: inboxCount };

  const smartBtn = (id: SmartId) => {
    const Icon = SMART_ICON[id];
    const activeCls = target.kind === "smart" && target.id === id ? " on" : "";
    const label = { today: "Сегодня", inbox: "Входящие", next7: "Следующие 7 дней", completed: "Выполнено", trash: "Корзина" }[id];
    return (
      <button key={id} className={"tsb-item" + activeCls} onClick={() => { setTarget({ kind: "smart", id }); setSelectedId(null); }}>
        <Icon size={16} />
        <span className="tsb-label">{label}</span>
        {SMART_COUNT[id] ? <span className="tsb-count">{SMART_COUNT[id]}</span> : null}
      </button>
    );
  };

  return (
    <div className="tasks">
      {/* ---- Внутренний сайдбар модуля ---- */}
      <aside className="tsb">
        {smartTop.map(smartBtn)}
        <div className="tsb-sec">
          <span>Списки</span>
          <button className="tsb-plus" title="Новый список" onClick={() => setNewListOpen((v) => !v)}>
            <Plus size={14} />
          </button>
        </div>
        {newListOpen && (
          <input
            className="tsb-newlist"
            autoFocus
            value={newListName}
            placeholder="Название списка…"
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addList();
              if (e.key === "Escape") setNewListOpen(false);
            }}
          />
        )}
        {lists.map((l) => {
          const cnt = active.filter((x) => x.listId === l.id).length;
          const on = target.kind === "list" && target.id === l.id ? " on" : "";
          return (
            <div key={l.id} className={"tsb-item tsb-list" + on} onClick={() => { setTarget({ kind: "list", id: l.id }); setSelectedId(null); }}>
              <span className="tsb-dot" />
              <span className="tsb-label">{l.name}</span>
              {cnt ? <span className="tsb-count">{cnt}</span> : null}
              <button
                className="tsb-del"
                title="Удалить список (задачи перейдут во Входящие)"
                onClick={(e) => {
                  e.stopPropagation();
                  if (target.kind === "list" && target.id === l.id) setTarget({ kind: "smart", id: "inbox" });
                  call("lists_delete", { id: l.id });
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
        <div className="tsb-bottom">{smartBottom.map(smartBtn)}</div>
      </aside>

      {/* ---- Список задач ---- */}
      <section className="tlist">
        <header className="tlist-head">
          <h1>{targetLabel}</h1>
          {isTrash && tasks.some((x) => x.deletedAt) && (
            <button className="tlist-clear" onClick={() => { setSelectedId(null); call("trash_clear"); }}>
              Очистить корзину
            </button>
          )}
        </header>

        {showQuickAdd && (
          <div className="qa">
            <button className="qa-plus" title="Добавить" onClick={quickAdd}>
              <Plus size={16} />
            </button>
            <input
              value={quickTitle}
              placeholder="Добавить задачу…"
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") quickAdd(); }}
            />
            {quickDate && <span className="qa-chip">{fmtDate(quickDate)}</span>}
            <button className="qa-cal" title="Дата" onClick={() => setDateOpen((v) => !v)}>
              <CalendarIcon size={16} />
            </button>
            {dateOpen && (
              <>
                <div className="pop-backdrop" onClick={() => setDateOpen(false)} />
                <div className="dp-pop right">
                  <DatePicker
                    date={quickDate}
                    onChange={(d) => setQuickDate(d)}
                    onClose={() => setDateOpen(false)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {error && <div className="terr">Ошибка: {error}</div>}

        <div className="tgroups">
          {groups.length === 0 && <div className="tempty">Пусто</div>}
          {groups.map((g) => (
            <div key={g.key} className="tgroup">
              <div className="tgroup-label">
                {g.label} <span className="tgroup-count">{g.tasks.length}</span>
              </div>
              <div className="tgroup-card">
                {g.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    inTrash={isTrash}
                    overdueGroup={!!g.overdue}
                    selected={task.id === selectedId}
                    onSelect={() => setSelectedId(task.id)}
                    onToggle={() => call("tasks_toggle", { id: task.id })}
                    onRestore={() => call("tasks_restore", { id: task.id })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Правая панель редактора ---- */}
      {selected && !isTrash && (
        <>
          <div className="tdivider" onMouseDown={startDrag} />
          <aside className="teditor" style={{ width: panelW }}>
            <TaskEditor
              key={selected.id}
              task={selected}
              lists={lists}
              onClose={() => setSelectedId(null)}
              call={call}
            />
          </aside>
        </>
      )}
    </div>
  );
}

// ---------- Строка задачи ----------

function TaskRow({ task, inTrash, overdueGroup, selected, onSelect, onToggle, onRestore }: {
  task: Task;
  inTrash: boolean;
  overdueGroup: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onRestore: () => void;
}) {
  return (
    <div className={"trow" + (task.done ? " done" : "") + (selected ? " sel" : "")} onClick={inTrash ? undefined : onSelect}>
      <button
        className={"tcheck p" + task.priority + (task.done ? " checked" : "")}
        title={PRIORITY_LABEL[task.priority]}
        onClick={(e) => { e.stopPropagation(); if (!inTrash) onToggle(); }}
      >
        {task.done && <Check size={12} strokeWidth={3} />}
      </button>
      <span className="trow-title">{task.title}</span>
      {task.subtasks.length > 0 && (
        <span className="trow-sub">{task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}</span>
      )}
      {task.dueDate && (
        <span className={"trow-date" + (overdueGroup && !task.done ? " over" : "")}>
          {fmtDate(task.dueDate)}
          {task.dueTime ? ` ${task.dueTime.slice(0, 5)}` : ""}
        </span>
      )}
      {inTrash && (
        <button className="trow-restore" title="Восстановить" onClick={(e) => { e.stopPropagation(); onRestore(); }}>
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
}

// ---------- Редактор задачи ----------

function TaskEditor({ task, lists, onClose, call }: {
  task: Task;
  lists: TaskList[];
  onClose: () => void;
  call: (cmd: string, args?: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [waiting, setWaiting] = useState(task.waitingFor ?? "");
  const [subTitle, setSubTitle] = useState("");
  const [dpOpen, setDpOpen] = useState(false);

  const save = (patch: Partial<{
    title: string; notes: string; priority: number; dueDate: string | null;
    dueTime: string | null; status: string; waitingFor: string | null; listId: number | null;
  }>) =>
    call("tasks_update", {
      id: task.id,
      title: patch.title ?? title,
      notes: patch.notes ?? notes,
      priority: patch.priority ?? task.priority,
      dueDate: patch.dueDate !== undefined ? patch.dueDate : task.dueDate,
      dueTime: patch.dueTime !== undefined ? patch.dueTime : task.dueTime,
      status: patch.status ?? task.status,
      waitingFor: patch.waitingFor !== undefined ? patch.waitingFor : (task.waitingFor ?? null),
      listId: patch.listId !== undefined ? patch.listId : task.listId,
    });

  const addSub = async () => {
    const s = subTitle.trim();
    if (!s) return;
    await call("subtasks_add", { taskId: task.id, title: s });
    setSubTitle("");
  };

  const dateLabel = task.dueDate
    ? `${fmtDate(task.dueDate)}${task.dueTime ? " · " + task.dueTime.slice(0, 5) : ""}`
    : "Дата";

  return (
    <div className="ted">
      <div className="ted-top">
        <button
          className={"tcheck p" + task.priority + (task.done ? " checked" : "")}
          onClick={() => call("tasks_toggle", { id: task.id })}
        >
          {task.done && <Check size={12} strokeWidth={3} />}
        </button>
        <div className="dp-anchor">
          <button
            className={"field ted-datebtn" + (task.dueDate ? "" : " empty")}
            onClick={() => setDpOpen((v) => !v)}
          >
            <CalendarIcon size={14} />
            {dateLabel}
          </button>
          {dpOpen && (
            <>
              <div className="pop-backdrop" onClick={() => setDpOpen(false)} />
              <div className="dp-pop">
                <DatePicker
                  date={task.dueDate}
                  time={task.dueTime ? task.dueTime.slice(0, 5) : null}
                  withTime
                  onChange={(d, tm) => save({ dueDate: d, dueTime: tm })}
                  onClose={() => setDpOpen(false)}
                />
              </div>
            </>
          )}
        </div>
        <select className="field" value={task.priority} onChange={(e) => save({ priority: Number(e.target.value) })}>
          {PRIORITY_LABEL.map((p, i) => <option key={i} value={i}>{p}</option>)}
        </select>
        <button className="ted-close" title="Закрыть" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="ted-body">
        <textarea
          className="ted-title field"
          rows={2}
          value={title}
          placeholder="Название задачи"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if (title.trim() && title !== task.title) save({ title: title.trim() }); }}
        />
        <div className="ted-status">
          <select className="field" value={task.status} onChange={(e) => save({ status: e.target.value })}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {task.status === "waiting" && (
            <input
              className="field"
              value={waiting}
              placeholder="Чего ждём?"
              onChange={(e) => setWaiting(e.target.value)}
              onBlur={() => save({ waitingFor: waiting.trim() || null })}
            />
          )}
        </div>
        <textarea
          className="ted-notes field"
          value={notes}
          placeholder="Описание…"
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => { if (notes !== task.notes) save({ notes }); }}
        />

        <div className="ted-subs">
          {task.subtasks.map((s) => (
            <div key={s.id} className={"ted-sub" + (s.done ? " done" : "")}>
              <button
                className={"tcheck p0" + (s.done ? " checked" : "")}
                onClick={() => call("subtasks_toggle", { id: s.id })}
              >
                {s.done && <Check size={12} strokeWidth={3} />}
              </button>
              <span>{s.title}</span>
              <button className="ted-sub-del" onClick={() => call("subtasks_delete", { id: s.id })}>
                <X size={13} />
              </button>
            </div>
          ))}
          <div className="ted-sub-add field">
            <Plus size={14} />
            <input
              value={subTitle}
              placeholder="Добавить подзадачу…"
              onChange={(e) => setSubTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addSub(); }}
            />
          </div>
        </div>
      </div>

      <div className="ted-foot">
        <select
          className="field"
          value={task.listId ?? ""}
          onChange={(e) => save({ listId: e.target.value === "" ? null : Number(e.target.value) })}
        >
          <option value="">📥 Входящие</option>
          {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <button
          className="ted-del"
          title="В корзину"
          onClick={() => { call("tasks_delete", { id: task.id }); onClose(); }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
