import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import CommandPalette from "./components/CommandPalette";
import ModuleStub from "./modules/ModuleStub";
import TasksModule from "./modules/TasksModule";
import { moduleRegistry } from "./moduleRegistry";

export default function App() {
  const [activeId, setActiveId] = useState("today");
  const [dark, setDark] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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

  return (
    <div className="shell">
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      <main className="workspace">
        <Topbar dark={dark} onToggleTheme={() => setDark((v) => !v)} onOpenPalette={() => setPaletteOpen(true)} />
        <div className={"content" + (active.id === "tasks" ? " content-flush" : "")}>
          {active.id === "tasks" ? <TasksModule /> : <ModuleStub module={active} />}
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
  );
}
