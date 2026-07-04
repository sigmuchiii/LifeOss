import { fmtLongDate } from "../lib/dates";

// Строка поиска убрана (решение владельца, 2026-07-04) — палитра осталась на Ctrl+K.
// В топбаре только дата.
export default function Topbar() {
  return (
    <header className="topbar">
      <span className="topbar-date">{fmtLongDate(new Date())}</span>
    </header>
  );
}
