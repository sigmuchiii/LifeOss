// Реестр модулей LifeOss — единый контракт навигации и видимости.
// Источник истины по составу модулей: docs/modules/README.md + decisions-log.md.

export type ModuleVisibility = "visible" | "hidden" | "disabled";
export type ModuleGroup = "Обзор" | "Жизнь" | "Работа" | "Система";

export interface ModuleDef {
  id: string; // camelCase, будущий кросс-клиентский контракт
  label: string; // русский — язык интерфейса по умолчанию
  group: ModuleGroup;
  order: number;
  visibility: ModuleVisibility;
}

export const moduleRegistry: ModuleDef[] = [
  { id: "today", label: "Сегодня", group: "Обзор", order: 10, visibility: "visible" },
  { id: "tasks", label: "Задачи", group: "Жизнь", order: 20, visibility: "visible" },
  { id: "habits", label: "Привычки", group: "Жизнь", order: 30, visibility: "visible" },
  { id: "calendar", label: "Календарь", group: "Жизнь", order: 40, visibility: "visible" },
  { id: "focus", label: "Фокус", group: "Жизнь", order: 50, visibility: "visible" },
  { id: "diary", label: "Дневник", group: "Жизнь", order: 60, visibility: "visible" },
  { id: "physicalHealth", label: "Здоровье", group: "Жизнь", order: 70, visibility: "visible" },
  { id: "projects", label: "Проекты", group: "Работа", order: 80, visibility: "visible" },
  { id: "notes", label: "Заметки", group: "Работа", order: 90, visibility: "visible" },
  { id: "quickNotes", label: "Быстрые заметки", group: "Работа", order: 100, visibility: "visible" },
  { id: "contacts", label: "Контакты", group: "Работа", order: 110, visibility: "visible" },
  { id: "finance", label: "Финансы", group: "Работа", order: 120, visibility: "visible" },
  { id: "trading", label: "Трейдинг", group: "Работа", order: 130, visibility: "visible" },
  { id: "settings", label: "Настройки", group: "Система", order: 140, visibility: "visible" },
  // Отложенные модули (backend-контракты описаны в docs/modules/)
  { id: "reminders", label: "Напоминания", group: "Система", order: 150, visibility: "hidden" },
  { id: "psychologicalHealth", label: "Психологическое здоровье", group: "Жизнь", order: 160, visibility: "hidden" },
];

export const visibleModules = () =>
  moduleRegistry.filter((m) => m.visibility === "visible").sort((a, b) => a.order - b.order);
