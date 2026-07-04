# Finance Module

Status: MVP basic module with canonical Rust/SQLite storage

## Purpose

Finance organizes accounts in the left sidebar and shows transactions for the selected account in the central workspace.

## Current Decisions

- Accounts live in the left sidebar.
- The central workspace shows transactions for the selected account, not account cards.
- Existing `Lifeos` finance module is a visual/reference source.
- The Finance sidebar should not show separate `Операции`, `Доходы`, or `Расходы` navigation sections in the current design pass.
- The top header does not show a duplicate `+ Счёт` action.
- The shared module chrome/header title is hidden on Finance; the account workspace starts directly under the app shell.
- Account creation, when shown, belongs in the left sidebar near the accounts list.
- The account creation dialog includes account name and currency. Currency is limited to `RUB` and `USDT` for now.
- Current browser reference account icons use the same `Финансы` module icon for each account.
- Account icons may become user-configurable later, but custom account icons are not part of the current MVP browser pass.
- The selected account name is edited directly in the selected-account header.
- The selected account balance is displayed to the right of the account name in the account header.
- Money amounts in Finance are displayed with a space as the thousands separator, e.g. `100000` is shown as `100 000 RUB`.
- Stored Finance money values use integer minor units in Rust/SQLite. Display strings are formatting only; balance arithmetic must not depend on JavaScript binary floating-point math in the packaged desktop app.
- The selected-account detail form for type, balance, currency, and note is removed from the default account workspace for now.
- Transaction rows show title/description, date, optional time, and signed amount. If time is empty, only the date is shown; if time is filled, the row shows `date · time`.
- The initial selected-account workspace shows the transaction history only; it does not show an always-visible transaction-entry panel.
- Recording a transaction starts from a compact add button in the transaction-history header, which then opens a transaction modal/window for type, amount, `Описание`, date, optional time, and submit action. The submit button sits below the fields.
- Existing transaction rows are clickable edit targets. Editing reuses the transaction modal and can update type, amount, `Описание`, date, and optional time.
- Income and expense transactions update the selected account balance. On load, the canonical SQLite balance is derived from persisted transaction rows so older rows do not leave the account total at zero.
- Editing a transaction also recalculates the selected account balance from canonical transactions.
- Full account setup logic is still under-specified.
- Broader currency setup beyond `RUB` and `USDT` is deferred.
- Budget/filter UI setup is deferred, but the storage boundary already has typed budget records so export/search/integrity can treat future budgets as canonical Finance data.
- User should first be able to choose an account and review its transactions.
- Account balance/count chips in the Finance sidebar should appear as plain text values without pill outlines.
- The browser reference uses the shared light LifeOS module shell: compact account sidebar, no duplicate top `+ Счёт`, tinted workspace, raised transaction list, and dense rows with title/description, date, optional time, and signed amount.

## Expected MVP Direction

User should first be able to choose an account and see its transaction history.

Likely account concepts:

- account name;
- balance;
- currency: `RUB` or `USDT` for now;
- note/comment.

Future/deferred:

- advanced transaction filters, budget UI, and category management;
- full filters;
- budget planning.

## Stage 13 Desktop Implementation And FIX-03A Storage Promotion

- The desktop Finance route is account-first with a compact account list and `+ Счёт`.
- Creating an account selects it and opens an editable account workspace.
- Account creation captures name and currency (`RUB` or `USDT`).
- The selected account workspace edits the account name in the header and displays balance beside it.
- The selected account workspace shows transaction history immediately below the header as dense rows and uses a transaction-header add button to open a transaction modal.
- Clicking an existing transaction row opens the transaction modal in edit mode and saves through the Finance transaction update boundary.
- Displayed Finance balances and transaction amounts use grouped thousands with spaces.
- Transaction records include income/expense type, amount, description, date, optional time, and created timestamp.
- Finance account balance is derived from canonical SQLite transactions using integer minor units.
- FIX-03A promotes Finance accounts, transactions, and budgets to canonical Rust/SQLite storage via `finance_accounts`, `finance_transactions`, and `finance_budgets`.
- Finance Tauri commands expose typed account create/list/update, transaction create/list/update, budget create/list, and local snapshot import helpers.
- The React Finance screen now reads and writes through `dataCore` Finance commands. Browser/Vite mode keeps a localStorage preview fallback only; packaged desktop Finance data is not supported as frontend-only localStorage data.
- Existing Stage 13 Finance records in `lifeos.basic-modules.v1.financeAccounts` are imported into canonical storage by Finance and Settings data actions, then removed from the frontend basic-module snapshot. Import is idempotent through legacy local ids.
- Settings > Data export, local backup, search rebuild, and integrity checks read Finance from canonical storage. Frontend basic-module snapshots are now only legacy import/browser fallback inputs for the promoted basic modules.
- Categories, advanced filters, budget UI, recurring payments, cash/card account types, broader currencies, and cross-module Finance links remain future work.

## Open Questions

See Finance questions in [../open-questions.md](../open-questions.md).
