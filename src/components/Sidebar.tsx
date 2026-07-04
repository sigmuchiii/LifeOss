import { visibleModules, ModuleGroup } from "../moduleRegistry";

const GROUP_ORDER: ModuleGroup[] = ["Обзор", "Жизнь", "Работа", "Система"];

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ activeId, onSelect }: Props) {
  const modules = visibleModules();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge">L</div>
        <div>
          <div className="brand-name">LifeOss</div>
          <div className="brand-sub">персональная ОС жизни</div>
        </div>
      </div>
      <nav className="nav">
        {GROUP_ORDER.map((group) => {
          const items = modules.filter((m) => m.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="nav-group">
              <div className="nav-group-title">{group}</div>
              {items.map((m) => (
                <button
                  key={m.id}
                  className={"nav-item" + (m.id === activeId ? " active" : "")}
                  onClick={() => onSelect(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">W</div>
          <div className="user-name">Владелец</div>
        </div>
      </div>
    </aside>
  );
}
