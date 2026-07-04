import { visibleModules } from "../moduleRegistry";
import { moduleIcon } from "../moduleIcons";

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

// Иконочный рейл: без групп и без карточки профиля (решение владельца, 2026-07-04).
export default function Sidebar({ activeId, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand-badge" title="LifeOss">L</div>
      <nav className="nav">
        {visibleModules().map((m) => {
          const Icon = moduleIcon(m.id);
          return (
            <button
              key={m.id}
              title={m.label}
              aria-label={m.label}
              className={"nav-item" + (m.id === activeId ? " active" : "")}
              onClick={() => onSelect(m.id)}
            >
              <Icon size={19} strokeWidth={1.9} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
