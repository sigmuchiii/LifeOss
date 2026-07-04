// Темы LifeOss. Выбор темы живёт в «Настройках» (решение владельца, 2026-07-04).

export interface ThemeDef {
  id: string;
  label: string;
  dark: boolean;
  /** Свотчи для карточки-превью в настройках: фон, карточка, акцент, текст */
  preview: [string, string, string, string];
}

export const THEMES: ThemeDef[] = [
  { id: "light",    label: "Лаванда",  dark: false, preview: ["#eef1f7", "#ffffff", "#6c5ce7", "#1f2430"] },
  { id: "dark",     label: "Тёмная",   dark: true,  preview: ["#13151c", "#1c1f29", "#6c5ce7", "#e8eaf1"] },
  { id: "midnight", label: "Полночь",  dark: true,  preview: ["#0b1020", "#141b31", "#4ea3ff", "#e6ecf7"] },
  { id: "forest",   label: "Лес",      dark: false, preview: ["#edf4ef", "#ffffff", "#0f9d70", "#1e2b25"] },
  { id: "sunset",   label: "Закат",    dark: false, preview: ["#f7f0ea", "#ffffff", "#e17055", "#2e2620"] },
];

export const DEFAULT_THEME = "light";

export function applyTheme(id: string) {
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
  document.documentElement.dataset.theme = t.id;
  document.documentElement.classList.toggle("dark", t.dark);
}
