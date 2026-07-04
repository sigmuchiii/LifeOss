import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Свой контекстный менюшник LifeOss (ПКМ). Системное меню вебвью глушится в App.tsx.

export interface CtxItem {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

interface CtxState { x: number; y: number; items: CtxItem[] }

const Ctx = createContext<{ open: (e: React.MouseEvent, items: CtxItem[]) => void }>({
  open: () => {},
});

export const useCtxMenu = () => useContext(Ctx);

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [st, setSt] = useState<CtxState | null>(null);

  const open = useCallback((e: React.MouseEvent, items: CtxItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    if (!items.length) return;
    const x = Math.min(e.clientX, window.innerWidth - 240);
    const y = Math.min(e.clientY, window.innerHeight - items.length * 40 - 18);
    setSt({ x, y, items });
  }, []);

  useEffect(() => {
    if (!st) return;
    const close = () => setSt(null);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close, true);
    window.addEventListener("keydown", key);
    window.addEventListener("blur", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close, true);
      window.removeEventListener("keydown", key);
      window.removeEventListener("blur", close);
    };
  }, [st]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {st && (
        <div className="ctxmenu" style={{ left: st.x, top: st.y }}>
          {st.items.map((it, i) => (
            <button
              key={i}
              className={"ctx-item" + (it.danger ? " danger" : "")}
              onClick={() => { setSt(null); it.onClick(); }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}
