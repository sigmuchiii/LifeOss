import { fmtLongDate } from "../lib/dates";

interface Props {
  onOpenPalette: () => void;
}

// Переключатель темы убран из топбара — темы выбираются в «Настройках»
// (решение владельца, 2026-07-04).
export default function Topbar({ onOpenPalette }: Props) {
  return (
    <header className="topbar">
      <button className="search" onClick={onOpenPalette}>
        Поиск… <span className="kbd">Ctrl K</span>
      </button>
      <span className="topbar-date">{fmtLongDate(new Date())}</span>
    </header>
  );
}
