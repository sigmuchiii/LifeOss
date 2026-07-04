# LifeOS v3: объединённый аудит production-candidate, русская версия

Дата: 2026-05-13

Русская версия создана на основе файла `PROJECT_AUDIT_2026-05-13.md`, который объединяет три исходных аудита:

- `PROJECT_AUDIT_5.3CODEX_2026-05-13.md`
- `PROJECT_AUDIT_5.4GPT_2026-05-13.md`
- `PROJECT_AUDIT_5.5GPT_2026-05-13.md`

Цель этого файла: дать читабельную русскую версию объединённого аудита, чтобы можно было быстро понять, что реально важно, где аудиты расходятся, и какой из них справился лучше.

## 1. Короткий вывод

Все три аудита сходятся в главном: LifeOS v3 пока нельзя считать готовым для широкого публичного production-релиза.

Текущий статус ближе к такому сценарию:

- для личного/private dogfood installer проект уже достаточно близко;
- для публичного production-candidate ещё рано;
- главные риски сейчас не в том, что проект вообще не собирается, а в надёжности данных, восстановлении, напоминаниях, приватности, release-процессе и доверии к инсталлятору.

Важное уточнение после перепроверки текущего дерева:

| Проверка | Результат | Комментарий |
| --- | --- | --- |
| `npm run lint` | PASS | ESLint прошёл без ошибок. |
| `npm run typecheck` | PASS | TypeScript сейчас проходит. |
| `npm test` | PASS | 22 test files, 144 tests passed. |
| `npm audit --audit-level=moderate` | PASS | 0 vulnerabilities. |
| `npm run build` | PASS | Vite build проходит. |
| `cargo fmt --all -- --check` | FAIL | Есть один форматирующий diff в `crates/lifeos-storage/src/data_safety.rs` около `tradingRuleSections`. |
| `cargo clippy --workspace --all-targets -- -D warnings` | PASS | Clippy проходит. |
| `cargo test --workspace` | PASS | Rust workspace tests проходят. |
| `cargo audit --deny warnings` | PASS | Проходит с текущим RustSec allowlist. |

Главное расхождение: аудит `5.4GPT` утверждал, что frontend gate красный: `typecheck`, `test` и `build` падают. Сейчас это не подтверждается. Возможно, этот аудит был сделан на более раннем dirty-состоянии, но на текущем дереве его главный P0 уже неверен или устарел.

При этом сейчас есть маленький технический P0: `cargo fmt --all -- --check` не проходит. Это не архитектурная проблема, но пока форматирование не исправлено, релизный gate нельзя считать полностью зелёным.

Лучший исходный аудит: `PROJECT_AUDIT_5.5GPT_2026-05-13.md`.

Почему он лучший:

- лучше всех различает private dogfood и публичный production release;
- даёт самые сильные доказательства по артефактам сборки, подписи, SBOM и Authenticode;
- поймал важнейший архитектурный риск: Stage 13 modules хранят production-значимые данные в frontend `localStorage`;
- меньше ошибается по текущему состоянию frontend gate.

## 2. Чем отличаются три аудита

| Критерий | 5.3 Codex | 5.4 GPT | 5.5 GPT | Итоговая оценка |
| --- | --- | --- | --- | --- |
| Общий вывод | Не готов к широкому production из-за signing, recovery, privacy, transactionality, sync/status gaps. | Не готов, потому что якобы красный frontend gate плюс много product drift. | Для private dogfood может быть допустим; для public production нельзя, пока P1 не закрыты. | Самая точная формулировка у 5.5. |
| Точность по frontend gate | Говорит, что lint/typecheck/test/build проходят, 143 теста. | Говорит, что typecheck/test/build падают из-за Trading. | Говорит, что lint/typecheck/test/build проходят, bundle builds. | Текущая проверка подтверждает 5.3/5.5. Сейчас 144 теста. |
| Точность по Rust gate | Говорит, что fmt/clippy/test/audit проходят. | То же. | То же. | Сейчас clippy/test/audit проходят, но fmt падает на одном форматировании. Все три устарели по текущему fmt. |
| P0 | Unsigned release chain как P0. | Broken frontend gate как P0. | P0 не найден. | Сейчас P0 только механический: `cargo fmt`. Unsigned public release может быть P1 или P0 в зависимости от цели релиза. |
| Release/provenance | Сильный по signing, publisher, CI release hardening, SBOM gap. | Нормально покрывает signing и release workflow gap. | Самый сильный: есть evidence по unsigned artifacts, hashes, Authenticode, SBOM tooling. | Лучший 5.5. |
| Data ownership | Видит optional frontend snapshots и export/backup gaps. | Упоминает Stage 13/localStorage, но не делает это главным. | Делает Stage 13 localStorage top P1. | Лучший 5.5. Этот риск надо оставить P1. |
| Focus taskless issue | Почти не выделяет. | Хорошо покрывает как P1. | Хорошо покрывает как P1 и точнее объясняет invariant mismatch. | 5.4 и 5.5 оба полезны, 5.5 яснее. |
| Reminders | Больше про sync readiness/status и integrity. | Хорошо ловит product-contract drift: linked/task/calendar/habit/recurrence gaps. | Сильнее ловит production contract: browser Notification API vs Windows/Tauri delivery. | Надо объединить 5.4 и 5.5. |
| Notes/privacy | Remote Markdown images как P1. | Remote images P2, attachments disabled P2. | Remote images P2 плюс Obsidian import trust boundary и atomic note writes. | 5.5 самый полный, но findings всех трёх полезны. |
| Backup/recovery | Сильный: no restore command, manual restore, unencrypted backup. | Сильный: restore tests missing, manual/unimplemented. | Сильный: restore/import policy, encryption, collision/ID remap open. | Все согласны, 5.5 самый полный. |
| Transactionality | Сильный: domain write + `change_log` не atomic. | Менее центрально. | Сильный: storage writes + `change_log` not grouped. | 5.3 и 5.5 совпадают, оставить P1. |
| Product/UI drift | Theme dark option, sync readiness, docs mismatch. | Самый сильный по Trading/settings/notes attachments/focus sounds/reminders. | Больше про архитектуру, меньше про UI drift. | 5.4 полезен, но его P0 надо отбросить. |
| Evidence quality | Хорошие references, короткий risk register. | Хорошая ширина, но центральный P0 сейчас неверен. | Лучшие evidence: команды, artifacts, hashes, assumptions/limits. | Лучший 5.5. |

## 3. Общая оценка проекта

| Область | Оценка | Объяснение |
| --- | ---: | --- |
| Product / Scope Consistency | 5/10 | Документация сильная, но Focus taskless, reminders, Settings controls, attachments/sounds и Stage 13 storage расходятся с текущей реализацией. |
| Architecture | 6/10 | Rust/React/Tauri границы нормальные для core-модулей, но Stage 13 localStorage и browser fallback ослабляют canonical ownership. |
| Backend / Rust | 7/10 | Domain/repository tests проходят, миграции структурированы; нужны transaction grouping, nullable focus links, schema constraints и file atomicity. |
| Frontend / TypeScript | 7/10 | Текущие lint/typecheck/test/build проходят; Settings/reminder/preview всё ещё показывают поведение слабее, чем кажется пользователю. |
| Data Integrity | 5/10 | Backup/export/integrity есть, но localStorage snapshots, manual restore, taskless focus, stale search и non-atomic writes держат риск высоким. |
| Security | 5/10 | CSP/capabilities/audits есть; unsigned artifacts, remote image loading, broad import boundary и RustSec allowlist остаются проблемами. |
| Privacy | 5/10 | Local-first позиция понятная, но unencrypted backups, remote media beacons и optional frontend snapshots опасны для sensitive data. |
| Performance | 6/10 | Катастрофы нет, но repeated DB opens, full reloads и N+1 habit loading надо чинить до роста данных. |
| Testing | 6/10 | Unit/repository tests нормальные; нет installer smoke, Tauri E2E, restore/import, notification, failure-injection, visual/a11y coverage. |
| CI/CD & Release | 4/10 | Сейчас падает `cargo fmt`; release workflow не делает signing, hashes, SBOM/provenance/license gates, installer smoke. |
| Observability / Debuggability | 4/10 | Есть отдельные error states, но reminder/settings/home всё ещё местами глушат ошибки; нет support diagnostic bundle. |
| Docs Quality | 8/10 | Документация сильная и честная; open questions реально фиксируют важные release decisions. |
| DX / Maintainability | 6/10 | Большие frontend files и слабые TS guardrails повышают риск регрессий, но структура проекта понятная. |
| Compliance / License | 4/10 | `UNLICENSED` явно указан; automated license/SBOM/NOTICE pipeline нет. |

## 4. Итоговые findings по приоритетам

### P0

#### F-C-001 — Сейчас красный Rust formatting gate

Серьёзность: P0 как механический release gate.

Что найдено:

- `cargo fmt --all -- --check` падает на `crates/lifeos-storage/src/data_safety.rs`.
- Проблема вокруг форматирования tuple для `tradingRuleSections`.

Риск:

- Любой CI/release процесс с обязательным rustfmt сейчас будет красным, даже если clippy/tests/audit проходят.

Что сделать:

- Запустить `cargo fmt --all` или вручную применить форматирование, которое предлагает rustfmt.

Effort: XS.

### P1

#### F-C-002 — Public-release artifact trust chain неполный

Серьёзность: P1. Может стать P0, если цель — публичный production release.

Что найдено:

- `apps/desktop/package.json` собирает NSIS через `tauri build --bundles nsis --no-sign`.
- В `apps/desktop/src-tauri/tauri.conf.json` publisher всё ещё `LifeOS v3 Publisher Placeholder`.
- CI не выпускает signed artifacts, hashes, provenance, installer smoke evidence, license/SBOM gates.
- В 5.5 executable/installer были проверены как `NotSigned`.

Риск:

- Пользователь не может проверить издателя и происхождение артефакта.
- Публичный installer будет выглядеть как unknown publisher и может ловить SmartScreen/Windows trust проблемы.

Что сделать:

- Добавить clean-tree Windows release workflow.
- Подписывать executable и installer.
- Добавить timestamp signatures.
- Публиковать SHA256 hashes.
- Генерировать npm/Rust SBOM.
- Добавить license scan.
- Делать install/launch/uninstall smoke test.

Источники: 5.3 `F-001`, `F-009`, `F-015`; 5.4 `F3`, `F12`; 5.5 `F-006`.

Effort: L.

#### F-C-003 — Stage 13 basic modules хранят важные данные в frontend localStorage

Серьёзность: P1.

Что найдено:

- `apps/desktop/src/modules/basic/basicModuleData.ts` хранит `lifeos.basic-modules.v1` в browser localStorage.
- `SettingsModuleScreen.tsx` вручную передаёт `frontendRecordsSnapshot()` в export/backup/integrity/search.
- `crates/lifeos-storage/src/data_safety.rs` считает `frontend_records` optional.
- В `open-questions.md` всё ещё открыт вопрос, останется ли localStorage fallback или данные надо переносить в canonical Rust/SQLite/Markdown storage.

Риск:

- Projects, Diary, Physical Health, Finance и Trading могут содержать важные личные, финансовые и health данные.
- Эти данные попадают в backup/export/search/integrity только если UI правильно передал frontend snapshot.
- Backend, future sync и restore не могут считать эти данные canonical.

Что сделать:

- Продвигать эти модули в typed Rust-owned persistence по одному.
- Начать с Finance, Diary и Trading как более чувствительных.
- Если не входит в scope, явно пометить их preview-only и не обещать production-grade сохранность.

Источники: 5.5 `F-001`, частично 5.4 `F9`, частично 5.3 backup/export observations.

Effort: L.

#### F-C-004 — Taskless Focus ломает storage/integrity инварианты

Серьёзность: P1.

Что найдено:

- Документация говорит, что Focus может запускаться с задачей или без задачи.
- `FocusModuleScreen.tsx` при запуске без задачи создаёт синтетический `task_id`.
- `lifeos-core/src/focus.rs` и миграция `0006_focus.sql` требуют `task_id`.
- `data_safety.rs` считает focus session проблемной, если её `task_id` нет в Tasks.

Риск:

- Валидный пользовательский сценарий становится integrity error.
- Settings > Data integrity начинает показывать ошибку на нормальных данных.

Что сделать:

- Сделать task link nullable или tagged.
- Оставить `task_title` как snapshot.
- Проверять только non-null task links.
- Добавить миграцию и regression test.

Источники: 5.4 `F4`, 5.5 `F-002`.

Effort: M.

#### F-C-005 — Reminders ещё не production-grade end-to-end

Серьёзность: P1.

Что найдено:

- Reminder runtime стартует в React.
- Dispatch идёт через `globalThis.Notification`, то есть browser Notification API.
- Некоторые ошибки polling/delivery suppress-ятся.
- В product docs/open questions ещё не до конца определены Windows toast behavior, click action, persistence, sound/failure fallback, permission semantics.
- Нужные сценарии не доказаны desktop E2E тестами: task/calendar/habit reminders, recurrence, dispatch, dedupe, failure states.

Риск:

- Пользователь может пропустить напоминание.
- Ошибка может пройти без нормальной диагностики.
- Реальное поведение может отличаться от ожиданий Windows/Tauri MVP.

Что сделать:

- Описать Windows MVP notification contract.
- Реализовать native Tauri/Windows delivery.
- Сохранять delivery attempts/status.
- Показывать permission/failure state в UI.
- Добавить E2E tests для standalone, linked, recurring, failed и duplicate notifications.

Источники: 5.4 `F2`, 5.5 `F-003`, частично 5.3 reminder/sync observations.

Effort: M/L.

#### F-C-006 — Backup/export есть, но restore/import и encryption не готовы

Серьёзность: P1.

Что найдено:

- Docs и release checklist говорят, что restore manual-only.
- Backups unencrypted.
- Open questions всё ещё покрывают restore flow, collision handling, ID/link remapping, import policy.
- Data-safety warnings говорят, что frontend records включаются только если UI их передал.

Риск:

- Пользователь может создать backup/export с sensitive data, но не имеет безопасного восстановления.
- Передача backup/export через cloud/support может раскрыть personal/health/finance/diary/notes data.

Что сделать:

- Добавить restore/import dry-run.
- Добавить apply path с manifest validation.
- Определить collision/ID policy.
- Определить app-lock или closed-app restore semantics.
- Добавить rollback strategy.
- Добавить optional passphrase encryption.

Источники: 5.3 `F-002`, `F-013`; 5.4 restore/test gaps; 5.5 `F-005`.

Effort: L.

#### F-C-007 — Domain writes и `change_log` writes не atomic

Серьёзность: P1.

Что найдено:

- В нескольких repository flows сначала пишутся domain records, потом отдельно пишется `change_log`.
- Recurring task и trash clearing могут затрагивать несколько row changes и change-log writes без явной transaction wrapper.

Риск:

- Crash, disk-full или SQLite error может оставить record без matching change history.
- Future sync/export/rebuild могут получить частично согласованное состояние.

Что сделать:

- Добавить transaction helpers.
- Передавать transaction handles в domain writes и `record_change`.
- Добавить failure-injection tests для create/update/delete/recurrence/clear-trash.

Источники: 5.3 `F-005`, 5.5 `F-004`.

Effort: M.

## 5. P2 findings

| ID | Проблема | Область | Что сделать |
| --- | --- | --- | --- |
| F-C-008 | Notes preview может загрузить remote images и отправить beacon наружу. | Privacy, Security | Блокировать remote media по умолчанию или показывать opt-in placeholders; tightened CSP. |
| F-C-009 | Obsidian import имеет слишком широкий filesystem trust boundary. | Security, Privacy, Data Integrity | Reject symlinks/external paths, ограничить size/count, классифицировать attachments, показывать skipped files. |
| F-C-010 | Notes file writes/rename/import недостаточно atomic. | Backend/Rust, Data Integrity | Temp-file write, flush/fsync, atomic rename, recovery markers. |
| F-C-011 | Finance хранит деньги строками и считает через JS `Number`. | Frontend/TS, Data Integrity, Product | Перейти на minor units или decimal type, валидировать input на границе, отделить display formatting. |
| F-C-012 | Search может быть stale/incomplete до ручного rebuild. | Data Integrity, UX, Observability | Добавить freshness metadata, auto-rebuild или query canonical stores, показывать stale-index status. |
| F-C-013 | SQLite schemas слишком полагаются на app validation для enum/status/date. | Backend/Rust, Data Integrity | Добавить `CHECK` constraints и migration tests. |
| F-C-014 | Settings показывает controls, которые не fully wired/persisted. | Product/Scope, Frontend/TS | Довести theme/module/notification/sync controls end-to-end или скрыть/disabled. |
| F-C-015 | Notes attachment creation disabled, хотя docs называют attachments MVP. | Product/Docs, Frontend/TS | Реализовать attachment import/copy/index refresh или downgrade docs/UI. |
| F-C-016 | Focus sound selection/import хранит metadata, но playback не доказан. | Product/Scope, Frontend/TS | Реализовать playback/durable file handling или пометить feature unavailable. |
| F-C-017 | Health/integrity checks нужны physical SQLite и broad data coverage. | Data Integrity, Observability | Добавить `PRAGMA integrity_check`/`quick_check`, attachment validation, честное Stage 13 coverage. |
| F-C-018 | Есть performance costs: N+1, full reloads, repeated DB opens. | Performance, Architecture | Bulk habit stats/log APIs, persistent DB state, incremental notes refresh. |
| F-C-019 | Не хватает Tauri/release/E2E/failure-injection coverage. | Testing, CI/CD | Installer smoke, Tauri command E2E, restore/import, notifications, corrupt data, disk-full/privacy tests. |
| F-C-020 | Diagnostics suppress-ятся в user-visible flows. | Observability, Frontend/TS | Structured local diagnostics, redaction, support bundle/export, actionable user errors. |
| F-C-021 | RustSec allowlist широкий и требует ownership/expiry governance. | Security, Supply Chain | Owner/review-date per ignore, fail CI on expired review, reduce allowlist. |

## 6. P3 findings

| ID | Проблема | Область | Что сделать |
| --- | --- | --- | --- |
| F-C-022 | Большие frontend files повышают риск регрессий и merge conflicts. | DX, Maintainability | Разделить `dataCore.ts` и `BasicModuleScreens.tsx` по domain/boundary. |
| F-C-023 | `@typescript-eslint/no-explicit-any` отключён. | DX, Frontend/TS | Включить warning, добавить narrow exceptions, tightened Tauri payload types. |
| F-C-024 | UI tests сильно опираются на static HTML string assertions. | Testing, Frontend/TS | Добавить behavior-level Testing Library/Playwright/Tauri E2E для ключевых flows. |
| F-C-025 | Compliance/license/SBOM automation остаётся manual. | Compliance, CI/CD | Добавить cargo/npm license inventory, NOTICE policy, SBOM artifacts, release gating. |
| F-C-026 | Accessibility minimum bar остаётся open. | Product/Design QA | Определить keyboard, focus, contrast, labels, reduced motion, target-size requirements. |

## 7. Приоритетный план исправлений

### Wave 0 — механический gate

1. Исправить `cargo fmt --all -- --check` в `crates/lifeos-storage/src/data_safety.rs`.
2. Перезапустить полный local gate: npm lint/typecheck/test/audit/build и cargo fmt/clippy/test/audit.

### Wave 1 — release blockers

1. Явно решить цель релиза: private dogfood или public production candidate.
2. Если public: signing, publisher identity, hashes, SBOM/provenance/license gates, installer smoke.
3. Если private dogfood: честно задокументировать unsigned/untrusted artifact limitation и держать scope узким.

### Wave 2 — data correctness и recovery

1. Убрать Stage 13 basic-module data из localStorage или формально отметить preview-only.
2. Исправить taskless Focus через nullable/tagged task link и integrity regression tests.
3. Сделать domain writes + `change_log` transactional.
4. Реализовать restore/import dry-run и recovery path; определить encryption/passphrase policy.

### Wave 3 — reminders и privacy

1. Описать native Windows/Tauri reminder delivery contract.
2. Сохранять reminder delivery status и показывать permission/failure diagnostics.
3. Блокировать remote note images по умолчанию.
4. Harden Obsidian import и сделать note writes atomic.

### Wave 4 — quality hardening

1. Добавить Tauri E2E, installer smoke, restore/import, notification и failure-injection tests.
2. Добавить structured diagnostics/support bundle с redaction.
3. Улучшить performance hot paths: bulk habit APIs, persistent DB handle, incremental notes refresh.
4. Разделить monolithic frontend files и tightened TypeScript guardrails.

## 8. Definition of Done для закрытия аудита

Аудит можно считать закрытым, когда:

1. `cargo fmt --all -- --check` снова проходит.
2. Все P1 findings исправлены или явно downgraded через documented product/security decisions в `docs/lifeos-v3/decisions-log.md` и affected module docs.
3. CI доказывает: npm lint/typecheck/test/audit/build и cargo fmt/clippy/test/audit.
4. Release workflow соответствует выбранной цели:
   - private dogfood: limitations explicit and accepted;
   - public production: signed artifacts, publisher identity, hashes, SBOMs, provenance, license gate, installer smoke.
5. Settings > Data backup/export/integrity/search покрывает все release-supported modules через canonical storage или явно маркирует preview-only data.
6. Restore/import имеет хотя бы dry-run validation, collision policy и documented safe recovery procedure.
7. Reminder delivery имеет documented Windows MVP contract и automated tests для dispatch, dedupe, failure, linked/recurring cases.
8. Privacy-sensitive flows документируют, что unencrypted, что может обращаться к remote hosts, и что остаётся local-only.

## 9. Финальный рейтинг трёх аудитов

| Место | Аудит | Почему |
| ---: | --- | --- |
| 1 | `PROJECT_AUDIT_5.5GPT_2026-05-13.md` | Лучший общий аудит: самый точный относительно текущих frontend gates, лучшие artifact evidence, лучшее разделение private dogfood vs public release, самый сильный finding по Stage 13 localStorage. |
| 2 | `PROJECT_AUDIT_5.3CODEX_2026-05-13.md` | Очень сильный и лаконичный: хорошо покрывает release/security/recovery/transactionality. Слабее 5.5, потому что недооценивает Stage 13 localStorage и Focus taskless. |
| 3 | `PROJECT_AUDIT_5.4GPT_2026-05-13.md` | Полезен по product-drift, но менее надёжен, потому что его центральный P0 про frontend gate сейчас не подтверждается. Его уникальные P2 findings стоит сохранить, но не использовать как основной release truth. |

Итоговая рекомендация:

- Брать `5.5GPT` как базовый аудит.
- Из `5.3CODEX` сохранить сильную framing по release/security/recovery/transactionality.
- Из `5.4GPT` сохранить уникальные product-drift findings, но отбросить или downgrade его устаревший P0 про frontend build/test/typecheck failures.
