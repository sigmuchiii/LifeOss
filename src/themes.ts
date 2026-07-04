// Темы LifeOss. Выбор темы живёт в «Настройках» (решение владельца, 2026-07-04).
// Выбор минималистичный: цветовые точки (фон + акцент), без больших превью.

export interface ThemeDef {
  id: string;
  label: string;
  dark: boolean;
  /** Цвета для точки-свотча в настройках */
  bg: string;
  acc: string;
}

export const THEMES: ThemeDef[] = [
  { id: "light",    label: "Лаванда", dark: false, bg: "#eef1f7", acc: "#6c5ce7" },
  { id: "dark",     label: "Тёмная",  dark: true,  bg: "#13151c", acc: "#6c5ce7" },
  { id: "midnight", label: "Полночь", dark: true,  bg: "#0b1020", acc: "#4ea3ff" },
  { id: "graphite", label: "Графит",  dark: true,  bg: "#17181c", acc: "#7f8ea3" },
  { id: "forest",   label: "Лес",     dark: false, bg: "#edf4ef", acc: "#0f9d70" },
  { id: "ocean",    label: "Океан",   dark: false, bg: "#eaf3fa", acc: "#0984e3" },
  { id: "sunset",   label: "Закат",   dark: false, bg: "#f7f0ea", acc: "#e17055" },
  { id: "rose",     label: "Роза",    dark: false, bg: "#faeef3", acc: "#e84393" },
];

export const DEFAULT_THEME = "light";

export function applyTheme(id: string) {
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
  document.documentElement.dataset.theme = t.id;
  document.documentElement.classList.toggle("dark", t.dark);
}
