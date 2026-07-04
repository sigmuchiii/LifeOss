import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import CommandPalette from "./components/CommandPalette";
import { ContextMenuProvider } from "./components/ContextMenu";
import ModuleStub from "./modules/ModuleStub";
import TasksModule from "./modules/TasksModule";
import TodayModule from "./modules/TodayModule";
import HabitsModule from "./modules/HabitsModule";
import CalendarModule from "./modules/CalendarModule";
import FocusModule from "./modules/FocusModule";
import QuickNotesModule from "./modules/QuickNotesModule";
import ProjectsModule from "./modules/ProjectsModule";
import DiaryModule from "./modules/DiaryModule";
import SettingsModule from "./modules/SettingsModule";
import { moduleRegistry } from "./moduleRegistry";
import { applyTheme, DEFAULT_THEME } from "./themes";

const K_THEME = "lifeoss.theme";

// Модули, занимающие всю рабочую область без внешних отступов
const FLUSH = new Set(["tasks", "projects", "diary"]);

export default function App() {
  const [activeId, setActiveId] = useState("today");
  const [theme, setThemeState] = useState(() => localStorage.getItem(K_THEME) ?? DEFAULT_THEME);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => applyTheme(theme), [theme]);

  // Тема хранится в базе (settings), localStorage — быстрый кэш до ответа бэкенда.
  useEffect(() => {
    invoke<string | null>("settings_get", { key: "theme" })
      .then((v) => { if (v) setThemeState(v); })
      .catch(() => { /* браузерный режим без Tauri */ });
  }, []);

  // Глушим системное контекстное меню вебвью — у нас своё (ContextMenu).
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", block);
    return () => window.removeEventListener("contextmenu", block);
  }, []);

  const setTheme = (id: string) => {
    setThemeState(id);
    localStorage.setItem(K_THEME, id);
    invoke("settings_set", { key: "theme", value: id }).catch(() => {});
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = moduleRegistry.find((m) => m.id === activeId) ?? moduleRegistry[0];

  const screen = (() => {
    switch (active.id) {
      case "today": return <TodayModule onOpenTasks={() => setActiveId("tasks")} />;
      case "tasks": return <TasksModule />;
      case "habits": return <HabitsModule />;
      case "calendar": return <CalendarModule />;
      case "focus": return <FocusModule />;
      case "quickNotes": return <QuickNotesModule />;
      case "projects": return <ProjectsModule />;
      case "diary": return <DiaryModule />;
      case "settings": return <SettingsModule theme={theme} onSetTheme={setTheme} />;
      default: return <ModuleStub module={active} />;
    }
  })();

  return (
    <ContextMenuProvider>
      <div className="shell">
        <Sidebar activeId={activeId} onSelect={setActiveId} />
        <main className="workspace">
          <Topbar />
          <div key={active.id} className={"content" + (FLUSH.has(active.id) ? " content-flush" : "")}>
            {screen}
          </div>
        </main>
        {paletteOpen && (
          <CommandPalette
            onSelect={(id) => {
              setActiveId(id);
              setPaletteOpen(false);
            }}
            onClose={() => setPaletteOpen(false)}
          />
        )}
      </div>
    </ContextMenuProvider>
  );
}
