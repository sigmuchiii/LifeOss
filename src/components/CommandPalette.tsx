import { useEffect, useRef, useState } from "react";
import { visibleModules } from "../moduleRegistry";
import { moduleIcon } from "../moduleIcons";

interface Props {
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function CommandPalette({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const items = visibleModules().filter((m) =>
    m.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          placeholder="Перейти к модулю…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && items[0]) onSelect(items[0].id);
          }}
        />
        <div className="palette-list">
          {items.map((m) => {
            const Icon = moduleIcon(m.id);
            return (
              <button key={m.id} className="palette-item" onClick={() => onSelect(m.id)}>
                <span className="palette-label">
                  <Icon size={15} strokeWidth={1.9} />
                  {m.label}
                </span>
              </button>
            );
          })}
          {items.length === 0 && <div className="palette-empty">Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
}
