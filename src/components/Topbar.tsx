interface Props {
  dark: boolean;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
}

export default function Topbar({ dark, onToggleTheme, onOpenPalette }: Props) {
  return (
    <header className="topbar">
      <button className="search" onClick={onOpenPalette}>
        Поиск… <span className="kbd">Ctrl K</span>
      </button>
      <div className="topbar-actions">
        <button className="icon-btn" title="Переключить тему" onClick={onToggleTheme}>
          {dark ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
}
