# LifeOss

**LifeOss** — личное local-first desktop-приложение («операционная система жизни») для Windows. Проект для личного использования владельца (private dogfood).

> ⚠️ **Перезапуск 2026-07-04:** приложение строится с нуля по документации. Историческая документация описывает прежнюю реализацию («LifeOS v4») и служит источником требований, но не описанием текущего кода. Актуальные решения — в `docs/decisions-log.md` (раздел 2026-07-04).

## Стек

- **Frontend:** Tauri 2 + React + TypeScript + Vite
- **Backend/домен:** Rust (крейты `lifeos-core`, `lifeos-storage`)
- **Данные:** SQLite + Markdown-файлы
- **UI:** русский по умолчанию, дизайн-система **Bento** (`docs/design/bento-design.html`)

## Модули (MVP)

Today (Home), Tasks, Habits, Calendar, Focus, Notes (Obsidian gateway), Quick Notes, Projects, Contacts, Diary, Physical Health, Finance, Trading, Settings. Psychological Health — отложен; Reminders — отложен (backend-контракт описан).

## Документация

**Порядок чтения для новой сессии агента:**
1. Этот README
2. [`docs/decisions-log.md`](docs/decisions-log.md) — журнал решений (последние записи = текущая истина)
3. [`docs/spec-draft.md`](docs/spec-draft.md) — спецификация
4. [`docs/agent-handoff.md`](docs/agent-handoff.md) — операционный handoff
5. Спека нужного модуля: [`docs/modules/`](docs/modules/)
6. [`docs/open-questions.md`](docs/open-questions.md) — открытые вопросы (отложены, не блокеры)

**Структура:**
- `docs/` — ядро: спецификация, handoff, журналы, дизайн-доки, релизные чеклисты
- `docs/modules/` — спецификации модулей (индекс: `docs/modules/README.md`)
- `docs/design/` — Bento-дизайн (источник истины по визуалу)
- `docs/archive/` — историческое (roadmap, аудиты, milestone-отчёты) — **не** источник истины

**Правила работы:**
- Решения владельца фиксируются в `docs/decisions-log.md`
- При конфликте документов: `decisions-log.md` (свежие записи) > модульные спеки > `spec-draft.md` > архив
- Дизайн: `docs/design/bento-design.html` побеждает текстовые описания визуала в старых доках
