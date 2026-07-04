# LifeOS v4: список закрытия до 10/10

Статус: активный checklist готовности

Последнее обновление: 2026-05-19

Этот файл фиксирует, что нужно закрыть, чтобы перевести LifeOS v4 из сильного
private dogfood-состояния к уровню 10/10 по продуктовой зрелости, безопасности
данных, релизной готовности и поддерживаемости. Это не список новых функций ради
расширения scope. Это список закрытия долгов вокруг уже видимого продукта.

## 1. Убрать preview-only статус у видимых модулей

Видимые рабочие модули не должны зависеть от preview-only frontend snapshot для
долговременного хранения пользовательских данных.

Модули закрыты в текущей реализации:

- [x] Projects
- [x] Contacts
- [x] Diary
- [x] Physical Health
- [x] Trading

Готово означает:

- [x] У модуля есть canonical storage contract: SQLite, Markdown или явно
      описанный hybrid.
- [x] Есть migration path из текущего interim frontend snapshot.
- [x] Есть Rust storage/repository layer для app-owned durable records.
- [x] Есть typed frontend API, который в packaged desktop mode не зависит от
      browser-only fallback.
- [x] Модуль покрыт readable export.
- [x] Модуль покрыт local backup.
- [x] Модуль покрыт integrity/search, где это применимо.
- [x] Есть тесты на read/write/import, export, backup, search, integrity и
      migration.
- [x] Module documentation обновлена и больше не описывает модуль как
      preview-only, либо сужает предупреждение до реально оставшихся ограничений.

## 2. Безопасный restore/import apply

Restore dry-run проверяет artifacts, а реальное применение restore теперь проходит
через staged apply с backup-before-restore. Для 10/10 data-safety boundary restore
должен оставаться безопасной пользовательской операцией.

Выполнено 2026-05-18: restore/import apply поддерживает artifact version `1`
для readable export и local backup. Pre-update backup artifacts остаются отдельным
rollback-сценарием и не должны автоматически считаться тем же самым, что backup/export
restore.

Важно различать два сценария:

- Выбрать старую рабочую `data`-папку означает: "Открой и используй эти данные".
- Restore означает: "Возьми backup/export artifact и безопасно восстанови из
  него текущую установку".

Готово означает:

- [x] Restore/import apply реализован для поддерживаемых artifact versions.
- [x] Перед restore приложение автоматически создаёт backup-before-restore.
- [x] Apply работает атомарно или через staged flow, чтобы partial restore не
      оставлял смешанное состояние.
- [x] Collision behavior описан явно: для artifact version `1` выбран replace-after-safety-backup;
      preserve-both/remap остаются будущими режимами.
- [x] Artifact version policy строго проверяется.
- [x] Link validation запускается до и после apply.
- [x] SQLite integrity проверяется перед принятием restored state.
- [x] Наличие файлов/attachments и checksums проверяются.
- [x] UI показывает, что будет восстановлено, что заблокировано и куда записан
      safety backup.
- [x] Тесты покрывают corrupt artifacts, missing files, collisions, unknown
      versions, encrypted artifacts, partial/interrupted artifacts и successful
      restore.

## 3. Зафиксировать безопасный pre-update backup и откат

Обычный запуск новой версии из той же `data`-папки не равен restore. Если
обновление прошло нормально, пользователь просто продолжает работать с той же
папкой. Backup нужен для ситуации, когда новая версия уже успела изменить данные
и после этого обнаружилась проблема.

Статус: выполнено 2026-05-18. Pre-update backup до migrations реализован и
покрыт тестами; пользовательский rollback UX теперь закрыт через startup-failure
notice, Settings > Data rollback entry point, safe restore/import apply и
owner-facing runbook.

Правильная схема:

1. У пользователя есть старая версия LifeOS и рабочая `data`-папка.
2. Пользователь устанавливает новую версию.
3. При первом запуске новая версия видит, что данные пришли от старой версии.
4. До любых migrations или изменений файлов новая версия делает pre-update
   backup всей важной `data`-папки.
5. Только после этого новая версия применяет SQLite migrations, меняет file
   structure, version markers или manifest versions.
6. Если всё хорошо, пользователь работает дальше.
7. Если что-то сломалось, точка отката находится в pre-update backup, то есть в
   состоянии данных до миграций новой версии.

Почему это нужно:

- Старая версия может не открыть `data`-папку, если новая версия уже изменила
      SQLite schema.
- Новая версия может создать частично изменённое состояние, которое нельзя
      безопасно считать старым рабочим состоянием.
- Пользователь должен иметь способ откатиться к данным до обновления, а не
      только к текущей папке после неудачного обновления.

Минимально хороший UX:

- [x] Pre-update backup создаётся автоматически до первого изменения данных новой
      версией.
- [x] Critical SQLite/frontend snapshot валидируется до migrations; corrupt critical
      SQLite snapshot блокирует startup backup completion.
- [x] Large Notes/Diary copy идёт как resumable `.in-progress` phase и становится complete
      только после snapshot validation.
- [x] Если migration/startup падает, пользователь видит путь к pre-update backup.
- [x] Settings > Data даёт понятную инструкцию или кнопку восстановления из
      pre-update backup.
- [x] Документация объясняет, что pre-update backup является rollback point до
      migrations/изменений новой версии.
- [x] Документация даёт owner-facing пошаговый restore/rollback runbook: как восстановить `data` из
      pre-update backup и при необходимости запустить старую версию приложения.

Идеальный UX:

- [x] Приложение само обнаруживает неудачное обновление.
- [x] Приложение предлагает "Откатить данные к состоянию до обновления".
- [x] Откат выполняется через безопасный restore flow.
- [x] UI объясняет, какую app version безопасно запускать после отката.

Итоговая схема: release startup пишет `startup-failure.json` и native error
message при сбое backup/startup/migration; Settings > Data показывает failed-upgrade
notice и latest pre-update artifact; complete artifact можно dry-run/apply через
restore/import flow с backup-before-restore; partial `.in-progress` artifact
остаётся disabled. Runbook: [pre-update-rollback-runbook.md](pre-update-rollback-runbook.md).

## 4. Довести публичный release pipeline до реального green path

Текущий проект подходит для private dogfood, но public production release всё ещё
заблокирован, пока release-security gates не станут реальными и повторяемыми.

Статус: выполнено 2026-05-18 для release-pipeline readiness. У public workflow
теперь есть проверяемый `dry-run` green path без реального сертификата и строгий
`production` path с реальным сертификатом. Отсутствие сертификата не считается
тихим пропуском: dry-run фиксирует `NotSignedBlocked`, а production mode требует
`Valid` timestamped Authenticode signatures и final publisher из реального
certificate subject. Production gate additionally verifies that the imported
PFX has a private key and Code Signing EKU, that timestamp URL is configured, and
that release evidence rechecks every executable signer subject against
`LIFEOS_PUBLIC_PUBLISHER`.

Готово означает:

- [x] Выбрана и задокументирована final Windows publisher/legal identity policy:
      `LIFEOS_PUBLIC_PUBLISHER` должен совпадать с subject/publisher реального
      индивидуального code-signing certificate владельца либо будущего юрлица, а
      не с придуманным именем.
- [x] Windows app и installer artifacts подписываются code signing certificate в
      `production` mode; без сертификата workflow идёт только через dry-run и не
      выпускает public production artifact.
- [x] Production mode проверяет реальный certificate material: private key,
      Code Signing EKU, timestamp URL и совпадение `LIFEOS_PUBLIC_PUBLISHER`
      с subject (`CN`, `O` или full subject) импортированного сертификата.
- [x] Release evidence повторно блокирует production, если signer subject у
      любого executable artifact не совпадает с `LIFEOS_PUBLIC_PUBLISHER`.
- [x] `NotSigned` блокирует public production release и записывается как
      `NotSignedBlocked` в `target/security/signatures/signing-gate.json`.
- [x] Для каждого release artifact генерируются SHA256 hashes.
- [x] Rust SBOM генерируется и архивируется.
- [x] npm/frontend SBOM генерируется и архивируется.
- [x] Rust dependency license gate запускается и блокирует denied или unknown
      licenses.
- [x] npm production dependency license gate запускается и блокирует denied или
      unknown licenses.
- [x] Build provenance фиксирует commit, workflow, toolchain и artifact names.
- [x] Installer smoke evidence сохраняется.
- [x] Для каждого release candidate создаётся release evidence file.
- [x] Public release workflow имеет доказанный dry-run green path на текущем
      release candidate настолько, насколько возможно без реального
      сертификата; signed production green остаётся намеренно заблокированным до
      появления certificate inputs.

## 5. Разрезать крупные агрегаторы

Несколько файлов уже достаточно большие, чтобы замедлять будущие изменения и
code review. Они работают сейчас, но их нужно делить по устойчивым domain
boundaries до дальнейшего расширения модулей.

Основные кандидаты:

- [x] `apps/desktop/src/dataCore.ts` — публичный barrel сохранён, frontend data
      boundary разрезан на typed domains: settings/preferences/basic-module
      bridge, Tasks, Calendar/Reminders, Habits, Quick Notes, Finance, Focus,
      Notes, shared browser fallback helpers и shared types. Проверено:
      `npm test -- dataCore.test.ts`, `npm run typecheck`, `npm run lint`.
- [x] `apps/desktop/src/modules/basic/BasicModuleScreens.tsx` — public export
      surface сохранён, runtime/state orchestration вынесена в
      `BasicModuleRuntime.tsx`, presentational basic-module views в
      `BasicModuleScreenViews.tsx`, shared field controls в
      `BasicModuleScreenFields.tsx`, shared action/type contracts в
      `BasicModuleScreenTypes.ts`. Проверено: `npm test --
      BasicModuleScreens.test.tsx`, `npm run typecheck`, `npm run lint`.
- [x] `apps/desktop/src/styles.css` — файл оставлен ordered CSS entrypoint с
      `@import`, существующие правила вынесены по module/domain boundaries, а новые
      селекторы ограничены UX-зрелостью basic modules и покрыты CSS source tests:
      `src/styles/base.css`, `home.css`, `tasks.css`, `calendar.css`,
      `habits.css`, `focus.css`, `notes.css`, `basic-modules.css`,
      `settings.css`, `quick-notes.css`; CSS source tests read the combined
      imported stylesheet through `src/test/readStyles.ts`. Проверено:
      `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- [x] `apps/desktop/src-tauri/src/lib.rs` — Tauri command names and public
      desktop helpers stay exported through the crate root, while command
      helpers and `#[tauri::command]` wrappers are split into domain modules
      under `apps/desktop/src-tauri/src/commands/`: Tasks,
      Calendar/Reminders, Habits, Finance, Focus, Notes, Quick Notes, and
      Data Safety/Settings. `lib.rs` now keeps app startup, tray lifecycle,
      packaged-smoke ownership, and grouped command registration. Earlier
      runtime data startup, pre-update backup, runtime version marker, and
      startup failure notice ownership remains in `runtime_data.rs`.
      Проверено: `cargo fmt --all -- --check`, `cargo clippy --workspace
      --all-targets -- -D warnings`, `cargo test -p lifeos-desktop --tests`,
      `cargo test --workspace`.
- [x] `crates/lifeos-storage/src/data_safety.rs` — public `DataSafetyService`
      reports and method contracts stay in `data_safety.rs`; restore/import
      artifact specs, dry-run/apply helpers, link/collision validation, and
      staging ownership moved to `data_safety/restore_import.rs`. Проверено:
      `cargo test -p lifeos-storage --test data_safety -- --nocapture`,
      `cargo test -p lifeos-desktop --tests -- --nocapture`.

Готово означает:

- [x] Чистые structural splits не содержат behavior changes.
- [x] Module/domain API boundaries описаны явно.
- [x] Tests продолжают проходить после каждого split.
- [x] Imports остаются читаемыми и не создают circular dependencies.
- [x] Новые файлы имеют понятные ownership и names.

## 6. Закрыть ключевые open questions

Документация проекта сильная, но несколько product contracts всё ещё блокируют
10/10 readiness.

Статус: triage выполнен 2026-05-18. Resolved пункты перенесены в
`decisions-log.md`, `spec-draft.md` и module specs; нерешённые пункты оставлены в
`open-questions.md` как `Open` или `Partial` с конкретным выбором владельца.

Приоритетные вопросы:

- [x] Diary media/attachments handling for entries закрыт для private dogfood
      MVP как attach/preview/full-screen review/rename/delete внутри day modal;
      durable shared media strategy остаётся отдельным system/future вопросом.
- [x] Mobile offline write policy триажирован как будущий mobile-scope выбор, не
      desktop dogfood blocker; Partial item сохранён.
- [x] Sync metadata triage выполнен: device id, operation id, revisions,
      tombstones, conflict base и clock-skew rules остаются будущим
      multi-device contract. Текущий `change_log` не является таким contract;
      Partial item сохранён до mobile/sync planning.
- [x] Standalone reminders creation/editing UI триажирован: storage/delivery
      есть, visible management UI требует выбора владельца; Partial item
      сохранён.
- [x] Cross-module attachments/media strategy сужен: Notes и текущий Diary MVP
      описаны, shared strategy для остальных модулей остаётся Partial item.
- [x] Accessibility baseline: keyboard navigation, contrast, focus states,
      screen-reader labels, reduced motion и target sizes.

Готово означает:

- [x] Каждый resolved/partial ответ перенесён в `decisions-log.md`.
- [x] Затронутые module specs обновлены.
- [x] `spec-draft.md` обновлён, если ответ меняет high-level behavior.
- [x] Resolved entries удалены или переписаны в `open-questions.md`.

## 7. Добавить packaged-app QA

Unit и integration tests недостаточны для local-first desktop app. Нужно
проверять installed/bundled application так, как его будет запускать пользователь.

Выполнено 2026-05-18: `npm run qa:packaged` расширен до полного packaged-app QA
покрытия для private dogfood. Packaged smoke CLI для `lifeos-v4.exe` пишет JSON
report и Rust integration test `packaged_app_smoke`; smoke проверяет launch,
install-local `data`, migrations, repeat launch persistence, same-folder
upgrade/pre-update backup, readable export, local backup, search, integrity,
Notes gateway, browser-preview Notes safety, Quick Notes mini-window, reminders
due/dedupe плюс permission-denied/unavailable statuses, Windows paths с
кириллицей и длинным сегментом, а также data-preserving uninstall/reinstall
policy.

Готово означает, что packaged smoke coverage существует для:

- [x] First launch after install.
- [x] Создание правильного data root.
- [x] SQLite open и application of migrations.
- [x] Repeat launch с сохранением данных.
- [x] Upgrade from older app version с pre-update backup.
- [x] Settings > Data readable export.
- [x] Settings > Data local backup.
- [x] Search rebuild и basic search.
- [x] Integrity check.
- [x] Notes gateway behavior в packaged desktop mode.
- [x] Browser preview Notes остаётся безопасным и не запускает fake Obsidian
      links.
- [x] Quick Notes native mini-window open/reopen behavior.
- [x] Reminder runtime delivery, dedupe и permission-denied/unavailable cases.
- [x] Windows paths с пробелами, кириллицей и длинными path segments.
- [x] Uninstall/reinstall data policy решена, задокументирована и протестирована.

## 8. Усилить UX-зрелость модулей

Каждый видимый модуль должен ощущаться как реальная рабочая поверхность, а не
demo screen.

Статус: выполнено 2026-05-18 для Projects, Contacts, Diary, Physical Health и
Trading. Basic-module screens теперь показывают полезные пустые состояния,
загрузку и recoverable errors для async data, честно блокируют незаполнимые
primary actions, сохраняют keyboard/focus flow, имеют ожидаемые переходы в
Settings и не показывают техническую helper copy в активном UI, кроме честных
release/data limitations.

Готово означает, что каждый видимый модуль имеет:

- [x] Useful empty states.
- [x] Loading states там, где есть async data.
- [x] Error states с recoverable actions.
- [x] Honest disabled states.
- [x] Keyboard flow для primary actions.
- [x] Stable focus states.
- [x] Clear creation/editing flows.
- [x] Settings там, где пользователь естественно ждёт настройки.
- [x] Нет видимого technical helper copy в активном UI, кроме случаев, когда
      модуль намеренно предупреждает о release/data limitations.

## 9. Причесать документацию как single source of truth

Документация является сильной стороной проекта, но stale или duplicate docs могут
сбивать будущие implementation sessions.

Статус: выполнено 2026-05-18 для текущего documentation drift pass.

Готово означает:

- [x] Stale README claims обновлены или удалены.
- [x] Historical audit files заархивированы, переименованы как historical или
      сведены в текущие docs.
- [x] Module specs совпадают с текущей implementation и release status.
- [x] `agent-handoff.md` остаётся достаточно компактным для новых sessions.
- [x] `open-questions.md` содержит только Open или Partial items.
- [x] Ни одно product decision не существует только в чате.
- [x] Release docs ясно различают private dogfood и public production.

## Остаточные замечания после проверки 2026-05-19

Проверка 2026-05-19 подтвердила, что текущая ветка готова для private dogfood и
для public-release dry-run. При этом ниже остаются замечания, которые нужно
отдельно отслеживать, чтобы не смешивать "dry-run готов" и "public production
готов".

Проверки, которые прошли:

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test` — 190 tests passed.
- [x] `npm run build`
- [x] `npm audit --audit-level=moderate` — 0 vulnerabilities.
- [x] `cargo fmt --all -- --check`
- [x] `cargo clippy --workspace --all-targets -- -D warnings`
- [x] `cargo test --workspace`
- [x] `cargo audit --deny warnings`
- [x] `npm run release:dry-run -- -SkipQualityGates`
- [x] Packaged smoke внутри release dry-run.

Свежие evidence artifacts:

- Release evidence: `target/security/release-evidence.md`.
- Release evidence JSON: `target/security/release-evidence.json`.
- Packaged smoke report:
  `target/security/smoke/run-e670b103e91d/packaged-smoke-report.json`.
- SHA256 artifacts:
  `target/security/hashes/SHA256SUMS.txt` и
  `target/security/hashes/sha256.json`.
- Signing evidence:
  `target/security/signatures/authenticode.json` и
  `target/security/signatures/signing-gate.json`.
- SBOM files under `target/security/sbom/`.
- License inventories under `target/security/licenses/`.

### A. Public production всё ещё заблокирован реальным signing

Статус: не блокирует private dogfood и dry-run, блокирует настоящий public
production.

Текущее состояние:

- [x] Dry-run release pipeline проходит.
- [x] Workflow создаёт unsigned NSIS bundle и release evidence.
- [x] Signing gate фиксирует `NotSignedBlocked`.
- [x] Evidence явно говорит, что public production остаётся заблокированным,
      пока не настроены реальные signing inputs.
- [ ] Настоящий code-signing certificate ещё не подключён.
- [ ] `LIFEOS_PUBLIC_PUBLISHER` ещё не имеет финального значения из subject
      реального сертификата.
- [ ] Signed production green run ещё не проводился.

Что нужно закрыть позже:

- [ ] Купить/получить реальный Windows code-signing certificate.
- [ ] Настроить secrets/inputs для production workflow.
- [ ] Проверить, что app exe и NSIS installer имеют `Valid` Authenticode
      signatures с timestamp.
- [ ] Подтвердить, что `LIFEOS_PUBLIC_PUBLISHER` совпадает с certificate subject
      и не является придуманным именем.
- [ ] Запустить full public production workflow без dry-run shortcuts.
- [ ] Заархивировать production release evidence с `Signed` gate, hashes, SBOM,
      provenance, license inventory и installer smoke.

### B. Open questions остаются, но больше не являются desktop-dogfood blockers

Статус: не блокирует текущий private dogfood, но блокирует утверждение "в продукте
вообще всё закрыто".

После проверки 2026-05-28 в `docs/lifeos-v4/open-questions.md` осталось 19
пункта со статусами `Open` или `Partial`. Это соответствует правилу `AGENTS.md`:
в файле больше нет русских status markers `Открыт`/`Частично` и нет resolved
history.

Основные оставшиеся группы вопросов:

- [ ] Physical Health: будущая медицинская модель за пределами body-zone MVP,
      shared attachment storage, severity/history taxonomy.
- [ ] Mobile/sync: глубина чтения/записи для all-module first mobile scope,
      offline writes, time-zone rules, device metadata, operation ids,
      revisions, tombstones, conflict base, clock-skew rules.
- [ ] Notifications/reminders: platform-neutral notification channel contract,
      duplicate-delivery policy across devices, visible standalone reminders
      create/edit UI.
- [ ] Attachments/media: общая durable-модель для файлов за пределами Notes и
      текущего Diary MVP.
- [ ] Finance: budget UI, categories, recurring payments, account types, broader
      currencies, links to Trading/Projects.
- [ ] Demo/QA data: какие тестовые и демонстрационные данные нужны для дизайна,
      screenshots, manual QA и разработки.

Правило движения дальше:

- [ ] Не помечать эти пункты как done без решения владельца.
- [ ] После решения переносить итог в `decisions-log.md`.
- [ ] Обновлять affected module specs и `spec-draft.md`, если меняется
      high-level behavior.
- [ ] Удалять или переписывать resolved item в `open-questions.md`, чтобы файл
      оставался только для `Open`/`Partial`.

### C. Разрезание агрегаторов улучшено, но не закончено идеально

Статус: `lib.rs` command/helper split выполнен 2026-05-19 и не блокирует
текущую готовность; остальной maintainability debt остаётся отдельным backlog.

Что уже улучшилось:

- [x] `apps/desktop/src/dataCore.ts` стал public barrel около 41 строки.
- [x] `apps/desktop/src/modules/basic/BasicModuleScreens.tsx` стал public export
      surface около 22 строк.
- [x] `apps/desktop/src/styles.css` стал ordered CSS entrypoint около 10 строк.
- [x] `apps/desktop/src-tauri/src/runtime_data.rs` отделил runtime data startup,
      pre-update backup и startup failure notice от Tauri command registry.
- [x] `apps/desktop/src-tauri/src/commands/` отделил Tauri command helpers и
      wrappers по безопасным domain groups: `tasks.rs`,
      `calendar_reminders.rs`, `habits.rs`, `finance.rs`, `focus.rs`,
      `notes.rs`, `quick_notes.rs` и `data_safety_settings.rs`. Public command
      names и test-visible helpers остаются доступными через crate root.
- [x] `crates/lifeos-storage/src/data_safety/restore_import.rs` отделил
      restore/import logic от основного data-safety service.
- [x] `crates/lifeos-storage/src/data_safety/restore_import/` разделил
      artifact parsing, staging, validation, collision policy и commit/rollback
      на internal modules; facade `restore_import.rs` оставляет прежние helper
      exports для `data_safety.rs`.

Что остаётся крупным:

- [x] `apps/desktop/src-tauri/src/lib.rs` — около 1556 строк после command
      split. Он больше не держит domain helper bodies; remaining ownership:
      app startup/setup, tray lifecycle, packaged-app smoke runner and grouped
      command registration.
- [ ] `crates/lifeos-storage/src/data_safety.rs` — около 2432 строк. Часть
      restore/import вынесена, но readable export, backup, search, integrity и
      reports всё ещё находятся в одном крупном service file.
- [x] `apps/desktop/src/modules/basic/BasicModuleScreenViews.tsx` — старый
      views-монолит разрезан на barrel и focused files в
      `apps/desktop/src/modules/basic/views/`: shared layout states,
      Projects, Contacts, Diary, Physical Health, Finance, Trading и Settings.

Рекомендуемое правило:

- [ ] Не делать большой рефактор ради самого рефактора.
- [ ] Делить эти файлы только при следующей работе в соответствующем domain.
- [ ] Каждый split делать без behavior change и с отдельной проверкой.
- [x] Для `lib.rs` сначала выделять группы command registration/helpers по
      modules.
- [ ] Для `data_safety.rs` сначала выделять export/backup/search/integrity
      submodules.
- [x] Для `restore_import.rs` выделены artifact parsing, staging, validation,
      collision policy и commit/rollback submodules без behavior change.
- [x] Для `BasicModuleScreenViews.tsx` выделены shared layout states и крупные
      per-module views без намеренного behavior/UX change.

### D. Internal crates license metadata больше не шумит в SBOM

Статус: закрыто 2026-05-19 для private/internal проекта.

Во время предыдущего `npm run release:dry-run -- -SkipQualityGates`
`cargo-cyclonedx` выдавал warnings:

- `Package lifeos-core has an invalid license expression (UNLICENSED)`.
- `Package lifeos-storage has an invalid license expression (UNLICENSED)`.
- `Package lifeos-sync has an invalid license expression (UNLICENSED)`.
- `Package lifeos-desktop has an invalid license expression (UNLICENSED)`.

Выбранная политика:

- [x] LifeOS v4 остаётся private/internal; проект не переведён в open-source.
- [x] Workspace больше не объявляет `license = "UNLICENSED"` как SPDX
      expression.
- [x] Workspace объявляет `publish = false`, а внутренние packages наследуют
      `publish.workspace = true`, чтобы `lifeos-core`, `lifeos-storage`,
      `lifeos-sync` и `lifeos-desktop` не публиковались в registry.
- [x] Workspace объявляет `license-file = "LICENSE.txt"`, а internal packages
      наследуют `license-file.workspace = true`; root `LICENSE.txt` фиксирует
      private proprietary notice without granting public/open-source rights.
- [x] Dependency license gate остаётся отдельным gate для внешних production
      dependencies.
- [x] Повторный `cargo cyclonedx --manifest-path Cargo.toml --format json
      --override-filename rust-sbom.cdx` прошёл без `invalid license expression
      (UNLICENSED)` warnings.
- [x] `cargo metadata --locked --format-version 1` принимает metadata и
      показывает для internal packages `publish: []`, пустой `license` и
      `license_file` на `LICENSE.txt`.

Правило дальше:

- [ ] Не заменять `license-file` на public SPDX license expression без явного
      решения владельца сделать проект open-source.
- [ ] Любой будущий SBOM warning по internal license metadata снова считать
      release-doc/security cleanup item, а не игнорировать молча.

### E. Generated release evidence не является source artifact

Статус: не блокирует готовность, но важно для git hygiene.

`npm run release:dry-run -- -SkipQualityGates` создаёт файлы в `target/security`
и release bundle в `target/release`. Эти files являются evidence/build outputs,
а не source changes. Их нужно хранить как локальные evidence artifacts или
публиковать через CI artifacts, но не смешивать с product source diff без
явного решения.

Правило:

- [ ] В source commit включать scripts, docs, tests и implementation.
- [ ] `target/security/*` использовать как локальное доказательство проверки или
      CI artifact.
- [ ] Не коммитить `target/release/*` и bundled installers в обычную source
      ветку.
- [ ] Для публичного релиза release evidence должен быть прикреплён к release
      artifact/CI run, а не спрятан только в локальном `target/`.

## Рекомендуемый порядок закрытия

1. Довести public release green path.
2. Разрезать крупные агрегаторы по мере работы с затронутыми domains.
3. Закрывать open questions и documentation drift непрерывно во время работы.
