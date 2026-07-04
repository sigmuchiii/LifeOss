//! Доменное ядро LifeOss: реестр модулей и общие типы.

pub mod registry {
    /// Канонический список идентификаторов модулей (camelCase).
    /// Зеркалится в src/moduleRegistry.ts на фронтенде.
    pub const MODULE_IDS: &[&str] = &[
        "today",
        "tasks",
        "habits",
        "calendar",
        "focus",
        "diary",
        "physicalHealth",
        "projects",
        "notes",
        "quickNotes",
        "contacts",
        "finance",
        "trading",
        "settings",
        // отложенные: reminders, psychologicalHealth
    ];
}
