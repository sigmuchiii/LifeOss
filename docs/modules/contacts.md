# Contacts Module

Status: MVP basic module, canonical SQLite storage

## Purpose

Contacts are a lightweight personal address book inside the LifeOS rail.

The module exists for quick access to people and contact context without turning Notes or Projects into an address book. It is a standalone visible module, separate from Tasks, Projects, and Notes.

## Current Decisions

- Contacts is a separate visible module in the global left rail.
- Visible label: `Контакты`.
- Registry id: `contacts`.
- Route: `/contacts`.
- Rail icon: `Contact` from `lucide-react`.
- Contacts sits after `Проекты` and before `Заметки` in the rail order.
- Contacts records are canonical SQLite records in `contacts` as of migration `0012_basic_modules`.
- Existing `frontend-records.json` / `lifeos.basic-modules.v1.contacts` records are imported idempotently into canonical storage and cleared from the packaged frontend snapshot after migration.
- Shopping lists are not a separate LifeOS module in the current scope. The owner will keep shopping-list style notes in Notes/Obsidian for now.

## MVP Fields

Each contact record has:

- name;
- phone;
- Telegram/social handle;
- email;
- category;
- free note.

Only the name is required at creation time. Empty optional fields are valid.

## MVP Screen

The first Contacts screen uses the shared basic-module layout:

- compact left sidebar with `Контакты` as the accessible region label, not as a repeated visible sidebar heading;
- quiet plus icon in the sidebar header for creating a contact;
- search input in the sidebar;
- selectable contact rows;
- central editable contact card for the selected contact;
- no right inspector panel.

## Data Safety

- Packaged desktop stores Contacts in canonical SQLite `contacts`.
- Browser/Vite preview uses `localStorage` only when the Tauri runtime is unavailable.
- Readable export, local backup, search rebuild, and integrity checks read Contacts from canonical storage.
- Restore/import apply for artifact version `1` restores Contacts through the staged replace-after-safety-backup flow.

## 2026-05-18 UX Maturity Implementation

- Contacts shows useful empty states for an empty address book, an empty search result, and the no-selected-contact editor state.
- The empty Contacts sidebar state stays miniature: title-only copy such as `Добавьте первый контакт`, without explanatory helper text about fields or creation mechanics.
- Async contact loading has a quiet loading state and a recoverable error state with retry.
- Contact creation is keyboard reachable from the sidebar plus action; the name input receives focus when the row opens.
- The create action is honestly disabled until the required contact name is filled, while optional phone, Telegram/social, email, category, and note fields can stay empty.
- The selected-contact editor fields are disabled until a contact is selected, with clear user-facing copy instead of technical placeholder text.
- The Contacts sidebar exposes a compact Settings shortcut for module-related configuration.
- Focus rings stay stable on search, sidebar rows, creation controls, and editable contact fields.
- The active Contacts UI should not show technical helper copy or internal storage/runtime wording; data limitations belong in Settings/Data or release documentation.
- The Contacts route should not show repeated top-left module-name chrome. Keep the sidebar `aria-label` and icon actions, but no visible `Контакты` heading.

## Deferred

- contact groups beyond the simple category field;
- birthdays/reminders/calendar integration;
- contact-to-project/task links;
- attachments/photos;
- import/export from phone contacts or vCard.

## Open Questions

See Contacts/System questions in [../open-questions.md](../open-questions.md).
