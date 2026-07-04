# Trading Module

Status: MVP basic module

## Purpose

Trading is a working surface for quick investment Plays, detailed trade journals, and editable trading rules.

## Current Decisions

- `Плеи` (`Plays`) is a top-level quick list for capturing an investment idea or in-the-moment entry before the user has time to fill the detailed journal.
- Detailed trade journal modes are `Фьючерсы` and `Щиткоины`.
- A top selector button `Правила` opens a separate editable rule-sections screen.
- `Плеи`, `Фьючерсы`, `Щиткоины`, and `Правила` are all top-level Trading selector buttons.
- No left selection table in MVP.
- Plays, Futures, Shitcoins, and Rules should be switchable near the top center as a mode selector.
- The `Плеи` / `Фьючерсы` / `Щиткоины` / `Правила` selector belongs at the very top center of the Trading screen.
- The selector buttons should have equal width and remain centered.
- In `Фьючерсы` and `Щиткоины`, right-side journal controls such as `Реальный` / `На бумаге` and `+ Сделка` must not shift the main `Плеи` / `Фьючерсы` / `Щиткоины` / `Правила` selector. Its absolute top-center position should match `Плеи` and `Правила`.
- Plays, Futures, Shitcoins, and Rules need separate browser preview slides/screens.
- Trading should not show a module-local left sidebar for choosing `Фьючерсы` or `Щиткоины`.
- Trading should not show a right inspector/detail panel in the current preview.
- Each trading type has two separate same-format journals: `Реальный` and `На бумаге`.
- `На бумаге` is for testing a hypothesis without treating the entry as a real trade.
- Futures and Shitcoins screens include a local button/segmented control to switch between the real and paper journal.
- The `Реальный` / `На бумаге` switch is not shown on `Плеи`; Plays are quick captures, not finalized trade journals.
- A Play can record ticker/idea, date, time, a short note/thesis, optional amount, and media.
- Plays are persisted separately from detailed Futures/Shitcoins trade entries so rough captures do not pollute real or paper journals.
- Both modes require a user-entered trading pair for each deal.
- Futures uses entry price.
- Shitcoins use entry market cap.
- User records reasons for trades.
- Trading should be a journal-first surface.
- Every trade row must show the date and time of the deal.
- Trading journal rows use explicit columns for pair, date, time, entry price, leverage, volume, status, direction, and result.
- Trade volume is always a USDT amount. The visible field/header label is `Объём, USDT`, and the volume input/storage value accepts digits only; non-digit characters are stripped before persistence.
- Trading journal rows are ordered by deal date and time, newest first.
- Trading journal columns must stay visually aligned across the header and every row.
- Futures result status uses the label `безубыток` for break-even, not `ровно`.
- Shitcoin entry market cap is recorded per pair/trade, not as a global top metric card.
- Trade reasons are recorded per individual trade, not as a global top metric card.
- The browser reference does not show an always-visible `Новая сделка` entry panel in the journal screen. Deal creation starts from the `+ Сделка` action.
- The Futures and Shitcoins journal screens show only the aligned journal table/empty state. They must not show the full deal parameter form inline under the table.
- Pressing `+ Сделка` opens a modal window with the full deal parameters for the active journal mode.
- Futures deal modal fields: ticker, date, time, direction, entry price, leverage, status, volume, reason, result, media.
- Futures direction is a constrained selector with only `Long` and `Short`; it is not free text.
- Shitcoins deal modal fields: ticker, date, time, entry market cap, status, volume, reason, result, media.
- The deal modal submit button says `Добавить сделку` for new records.
- Deal media is attached through icon controls, with a photo-first attachment button and a fallback file attachment button.
- The `+ Сделка` action belongs only to Futures and Shitcoins. It is not shown on the Rules tab.
- The browser reference uses the shared light LifeOS module shell with no module-local sidebar: compact top-centered selector, tinted workspace, full-width deal rows, explicit trade columns, per-trade metadata, and separate Plays/Futures/Shitcoins/Rules preview screens.
- Rules are a set of editable sections rather than one shared text area. The user can add sections such as `Колы фьючерсов от других` or `Флип щиткоина на Solana`.
- Each rule section has its own title and body. Example content can include checking win rate, risk, margin availability, take-profit, and independently evaluating a futures call; or not holding a Solana shitcoin flip for long without a strong reason and recording concrete cases.
- The selected rules section is available during active trading as a native always-on-top mini-window in desktop mode. The Rules screen keeps the `Мини-режим` action, but it opens/updates the separate mini-window rather than rendering an in-app `Мини-правила` panel.
- The Trading rules mini-window has two explicit modes: view-only and edit. It
  stays plain and low-resource in both modes; view-only is a reference surface,
  while edit mode allows plain-text edits to the selected rule-section body and
  commits them back to the canonical Trading rule section.
- Rule sections are editable in the Rules screen.
- The Rules screen lets the owner delete the selected rule section. Deleting the last section leaves an empty rules state instead of recreating legacy/default text.
- The rule body editor starts immediately below `Правила раздела`; the screen should not leave a large blank gap between the label and the editable text.
- The Rules screen fills the available Trading workspace height rather than staying as a short top panel.
- Trading should not show top summary cards for fields that belong to each individual trade.
- The Trading route does not show the shared top workspace module title/header above the module surface.

## Stage 13 Desktop Implementation

- The desktop Trading route has no module-local left sidebar and no right inspector.
- The `Плеи` / `Фьючерсы` / `Щиткоины` / `Правила` selector is centered at the top of the main workspace.
- `Плеи` is the default Trading screen and provides a quick inline capture form plus a same-screen list of captured investment plays.
- Futures and Shitcoins each have separate `Реальный` and `На бумаге` journals with identical columns and modal fields. New deals are created in the currently selected journal.
- Each mode has its own journal surface with aligned rows. Deal creation and deal editing happen in the modal, not through an always-visible inline editor below the journal.
- The Rules surface presents full-height editable rule sections, allows deleting
  the selected section, and includes a mini-window mode selector plus action for
  the selected section. Packaged desktop mode opens/updates the native
  always-on-top rules mini-window; browser/Vite preview may use a separate
  browser preview window when Tauri commands are unavailable.
- The native rules mini-window preserves editor-entered line breaks by
  normalizing text for the Windows multiline edit control, uses the system GUI
  font, and keeps text away from the raw control edge with internal margins.
  Edit-mode commits update only the selected section body; section title editing
  remains in the Rules screen.
- Futures modal fields are pair, entry date, entry time, entry price, leverage, status (`Открыта`/`Закрыта`), volume, direction selector (`Long`/`Short`), reason, result, and media attachments.
- Shitcoins modal fields are pair, entry date, entry time, entry market capitalization, status (`Открыта`/`Закрыта`), volume, reason, result, and media attachments.
- In Futures and Shitcoins, deal volume is labeled and displayed as `Объём, USDT`; the modal input is numeric-only and stored as a digits-only USDT string.
- Trading quick Plays, detailed journal entries, and editable rule sections are canonical SQLite records in `trading_plays`, `trading_entries`, and `trading_rule_sections` as of migration `0012_basic_modules`.
- Existing `frontend-records.json` / `lifeos.basic-modules.v1` Trading records are imported idempotently into canonical storage and cleared from the packaged frontend snapshot after migration. Legacy `tradingRules` text imports into a rule section when no structured sections exist.
- Settings > Data export, local backup, search, and integrity checks read Trading from canonical storage. Browser/Vite `localStorage` is only a fallback when Tauri commands are unavailable.
- Stats, watchlist, finance links, and automatic Play-to-deal conversion remain future work.

## 2026-05-18 UX Maturity Implementation

- Trading shows useful empty states for Plays, Futures/Shitcoins journals, and Rules instead of demo-table filler.
- Async Trading loading has a quiet loading state and a recoverable error state with retry.
- Play creation, deal creation/editing, and rule-section creation remain keyboard reachable through native controls and modal flows.
- Primary submit actions are honestly disabled until the required user-entered fields are present: Play ticker/idea, deal ticker, or rule-section title.
- Focus rings stay stable on mode selectors, journal switches, table rows, modal fields, media controls, and rule-section controls.
- Trading exposes a compact Settings shortcut near the top selector for expected trading-module preferences.
- The active Trading UI should not show technical helper copy, internal storage/runtime wording, or in-app mini rules panels. Mini-mode belongs in the separate native rules mini-window.

## Open Questions

See Trading questions in [../open-questions.md](../open-questions.md).
