# Quick Notes Module

Status: MVP native mini-window implemented

## Purpose

Quick Notes is a separate visible LifeOS module for writing short notes and
opening a selected note in a small always-on-top mini-window.

The main product goal is fast reference on a second monitor while the owner is
doing another activity, especially gaming. The mini-window is not meant to draw
over the game itself. It should stay above other windows on the secondary
screen while using as little CPU, memory, disk IO, rendering work, and polling
as practical.

## Current Decisions

- Quick Notes is a separate visible module, not a hidden tray-only function and
  not just a mode inside the existing Notes module.
- The module exists for lightweight quick notes, not for replacing the Obsidian
  Companion Gateway used by the main Notes module.
- A note can be opened in a small always-on-top text window.
- The always-on-top window must be optimized to avoid affecting game
  performance.
- The first mini-window implementation should be a lightweight native Windows
  text window owned by the desktop process, not a second React/WebView route.
- The mini-window is positioned for second-monitor reference use. It does not
  need game-overlay or exclusive-fullscreen behavior.
- Quick Notes records use canonical Rust/SQLite storage from the start. Do not
  store them in the interim frontend snapshot.
- The mini-window has two explicit modes: view-only and edit. View-only keeps
  the low-resource reference behavior; edit mode allows plain-text body edits
  inside the native mini-window and commits them back to the selected Quick Note.
- Global hotkeys and tray entry points for Quick Notes are deferred until the
  module and native mini-window are stable.
- The main Quick Notes module follows the shared light LifeOS shell: global
  rail, compact note list, lightweight editor, dense rows, quiet icon/action
  controls, and no Obsidian-style file tree, graph, backlinks, or heavy
  Markdown workspace.
- The Quick Notes sidebar should not repeat the visible `Быстрые заметки`
  module title in the top-left header. The global rail owns module identity;
  the sidebar keeps its accessible label and compact create action.
- The native mini-window is the only design exception. It should look like a
  plain low-resource text reference window, not a styled dashboard card and not
  another full LifeOS module surface.

## MVP Features

- The main module surface should stay simple: a compact list of quick notes,
  a lightweight text editor, and an explicit action to open the selected note in
  mini-window mode.
- Quick note fields: title, body text, created timestamp, updated timestamp,
  and optional pinned/active selection state if needed for UI convenience.
- The main editor saves explicitly and on focus/selection boundaries. It must
  not write on every keystroke and must not rely on frequent autosave timers.
- The mini-window renders plain text only. It receives the selected note text
  and selected mode from the main process/UI and does not run its own data
  polling loop.
- In edit mode, the mini-window edits only the note body. The note title remains
  owned by the main Quick Notes module.
- The mini-window should avoid timers, animations, frequent autosave, expensive
  layout work, or background polling.
- There should be only one Quick Notes mini-window at a time. Opening another
  note reuses the same window and replaces its text.
- The selected note text and mode are pushed to the mini-window only when the
  payload changes.
- Runtime metrics should remain available for verification: process count,
  working set, CPU seconds, and sampled idle CPU percentage.
- Closing the main LifeOS window should not leave uncontrolled mini-window
  processes behind.
- Browser/Vite preview may show an in-app approximation of the mini-window, but
  the real optimized behavior is desktop-only.

## Desktop App Sync Status

- The React desktop app now exposes Quick Notes as a visible rail module at
  `/quick-notes` with the `StickyNote` icon, shared light LifeOS workspace
  geometry, a compact quick-note list, a plain text editor, and an explicit
  mini-window action.
- Quick Notes records now persist through Rust/SQLite commands and are included
  in readable export/search data-safety paths.
- The desktop app owns one native Windows always-on-top text mini-window with a
  view-only mode and an edit mode. It is positioned on a secondary monitor when
  available, uses no React/WebView renderer, no timers, no animations, no
  polling loop, and no disk-write loop while only displaying a note.
- Native edit-mode commits are sent back to canonical Quick Notes storage
  through the desktop process instead of making the mini-window a separate data
  owner.
- The app pushes selected note text only when the selected payload changes, and
  closes the native mini-window through the managed desktop lifecycle.
- Browser/Vite preview may still show an in-app approximation for development
  and demo use when Tauri/native commands are unavailable. It is not the
  production mini-window runtime.

## Not MVP

- Markdown preview.
- Attachments.
- Tags, backlinks, graph, or live indexing.
- Multiple simultaneous mini-windows.
- Global hotkey and tray quick-open controls.
- Drawing over the game itself or supporting exclusive-fullscreen game overlay
  behavior.
