# Focus Module

Status: MVP deep module

## Purpose

Focus helps the user run a focused work session with a timer, Pomodoro, sounds, optional task context, and session history.

## Current Decisions

- Focus can start with or without a selected task.
- When no task is selected, the session is a taskless free-focus session titled `Фокус без задачи`.
- Taskless Focus sessions store `task_id: null`; the app must not generate a synthetic/fake task id for them.
- Linked Focus sessions store the real task id in `task_id`.
- `task_title` is always a required snapshot for both linked and taskless sessions so history, export, backup, and search remain readable.
- Focus sessions do not appear on Home or Calendar in MVP.
- MVP modes: flexible timer, Pomodoro, breathing, and interval/cardio.
- Active Focus work uses the timer logic from `C:\Users\Nomoregooners\projects\timer site` without copying that project's visual design. The reusable logic includes breathing phases/presets and interval/cardio-style stages with work duration, rests, rounds, exercise list, skip, reset, pause/resume, persistence of settings, and optional sound cues.
- Focus time setting must be reliable: changing duration or mode before start updates the visible timer and the created Focus session, while active sessions keep their own started duration unless the user starts a new session.
- Focus setup settings persist through the app-managed frontend preferences file, with browser `localStorage` only as the Vite/browser fallback.
- Breathing mode supports presets `4-7-8`, `Box`, and `Антистресс`, plus custom inhale/hold/exhale seconds and target rounds.
- Interval/cardio mode supports work/rest/round-rest seconds, round count, editable exercise list, stage skip, reset, pause, resume, and optional phase/stage sound cues.
- Main view centers a circular remaining-time timer/progress ring.
- Controls: pause, stop, sound, mode.
- Built-in sounds are supported.
- Built-in Focus session background sounds (`rain`, `bell`, `noise`) can be generated through Web Audio and do not require bundled audio asset files for the MVP.
- Focus session sound starts only after a Focus session starts. `silent` plays nothing.
- During an active Focus session, `rain`, `noise`, and current-session custom imported audio play as quiet looping background sound. Pausing the session pauses the audio; resuming continues it; stop, finish, complete, timer end, sound replacement, and screen unmount stop playback and release audio resources.
- `bell` is cue-like rather than ambient: it plays a short tone for session lifecycle cues and must not loop as a background texture.
- Optional `sound_cues_enabled` phase/stage cues remain separate from the selected main session sound. Phase/stage cues do not replace the session sound.
- User-imported custom sounds are supported.
- User-imported custom Focus sounds are playable from the current selected file during the current app session; durable playback across app restarts depends on the future app-owned `media/focus-sounds/` copy path.
- Imported custom Focus sounds should be copied into an app-owned data media folder such as `media/focus-sounds/`. Do not store Focus sounds in the Notes vault.
- Focus opens/has a mini-window after launch.
- While a Focus session or mini Focus surface is visible, the desktop app window is pinned above other OS windows, following the native Quick Notes mini-window topmost expectation. The pin is released when mini Focus is closed, the session ends, or Focus unmounts.
- Session history is stored.
- After a session, user can write a result note.
- Result note belongs to Focus history.
- Focus result does not automatically update task, diary, or calendar in MVP.
- Focus stats/streaks by day use fully completed sessions only.
- A Focus streak day is counted when the day has at least one fully completed Focus session. There is no minimum-minute threshold, mode-specific streak split, or planned-time completion requirement.
- Stopped Focus sessions can remain in history/session records where needed, but they do not count toward daily Focus statistics or the Focus streak.
- Focus session is not planned, so it is not projected into Home or Calendar.
- Task selection is optional before starting the session.
- The main Focus surface includes a visible `Выбрать задачу` control for changing/selecting the task.
- When active tasks exist, the task selector still includes a `Без задачи` option.
- The mini-window should remain tied to the chosen task when a task is selected; otherwise it shows the taskless focus session.
- The top Focus action and the compact control button can switch the active Focus module into mini-window mode.
- Pause and stop controls should be icon/video-player-style buttons rather than text-only buttons.
- After completion, the result note records what the user actually did.
- Stage 11 persists Focus sessions as structured local records.
- The custom Focus sound import boundary uses a fixed durable format allowlist: MP3 (`audio/mpeg`, `.mp3`), WAV (`audio/wav`, `.wav`), Ogg/Opus/Vorbis (`audio/ogg`, `.ogg`, `.oga`), and M4A/AAC in MP4 (`audio/mp4`, `.m4a`). Durable imported audio should be copied into the app-owned Focus sounds folder under the runtime data root when the custom-sound persistence path is implemented. Unsupported audio files should be rejected rather than saved as arbitrary `audio/*`.
- The Focus right panel is titled `Статистика`.
- The Focus statistics panel shows six previous date columns plus today's column on the right.
- The Focus statistics chart has a side time scale; per-column time captions are not shown under the columns.
- The statistics panel header does not show a separate total-minutes chip.
- The statistics side scale labels are aligned to the left edge.
- The browser reference does not show a separate `Статистика` card or a `выбрана` badge on the task card.
- The browser reference sound selector is a compact option grid for built-in sounds and mute state, without small secondary status captions inside the options.
- The browser reference uses the shared light LifeOS module shell: compact rail/sidebar/header, selected-task and sound controls as light raised surfaces, a centered circular timer, playback-style icon controls, a mini-window mode button, and a right statistics panel.
- The production Focus screen does not show the shared workspace header or a separate inner task/status header above the timer.
- The Focus setup sidebar stays fixed-width and must not expose a horizontal scrollbar; mode controls, presets, inputs, sound import, and cue controls fit inside the default sidebar width.
- The main session controls live in the lower center area under the circular timer: sound chooser, start/pause/resume, finish session, and mini-window mode.
- The result-note panel is hidden during setup and active timing. It appears after the timer reaches the end or after the user presses finish session, then saves the session result into Focus history.

## Future Work

- Allowed app/process control.
- Warning when user leaves allowed apps.
- Blocking distractions.
- Recording deviations.
- Redirecting the user back to allowed apps/processes.

## Stage 11 Implementation Contract

- Rust domain model lives in `crates/lifeos-core/src/focus.rs`.
- SQLite focus persistence lives in `crates/lifeos-storage/src/focus.rs`; initial schema is migration `0006_focus.sql`.
- Structured Focus storage uses SQLite table `focus_sessions`.
- `focus_sessions.task_id` is nullable as of migration `0008_focus_taskless.sql`; recognized legacy taskless synthetic ids are migrated to `NULL` when the snapshot title is `Фокус без задачи` and the id does not match an existing task.
- Focus create/pause/resume/stop/complete operations append `focus` entries to the sync-ready `change_log`.
- Typed desktop command helpers and Tauri commands expose `list_focus_sessions`, `start_focus_session`, `pause_focus_session`, `resume_focus_session`, `stop_focus_session`, and `complete_focus_session`.
- Frontend Focus data calls live in `apps/desktop/src/dataCore.ts`.
- The React Focus module lives in `apps/desktop/src/modules/focus/FocusModuleScreen.tsx` with helper view logic in `focusViews.ts` and mode/timer logic in `focusTimerLogic.ts`.
- Focus loads Tasks for optional task selection but does not call task completion commands when a session stops or completes.
- Focus sessions are not consumed by Home or Calendar view models and therefore do not project into those modules in MVP.
- Data-safety integrity checks validate only non-null Focus task links. A linked session pointing to a missing task remains broken; a taskless session with `task_id: null` is healthy.
- Readable export, local backup, and rebuildable search keep Focus sessions as structured records. Taskless sessions are represented with `task_id: null` and indexed by their `task_title` snapshot.
- The browser/Vite preview supports Focus session start, pause/resume, stop, complete, and history through localStorage when Tauri commands are unavailable. Packaged desktop mode continues to use the Rust/SQLite Focus commands.
- Packaged desktop mode stores Focus setup settings in `<data>/frontend-preferences.json`; browser/Vite stores the same preference shape in `lifeos-v4:frontend-preferences`.
- The production UI includes a visible `Выбрать задачу` control, task selector, flexible/Pomodoro/breathing/interval mode controls, centered circular remaining-time timer, a lower session-control dock for sound/start-pause/finish/skip/reset/mini-window actions, sound selector, custom audio-file import boundary, mini-focus panel while a session is active, desktop topmost pinning for visible mini/active Focus, weekly focus-time columns, history, and a result-note save flow that appears only after session end.
- Focus daily statistics, session totals, and streaks are based on fully completed sessions only. Stopped sessions remain historical facts but are excluded from those statistics.
- Durable custom Focus sound validation follows the fixed allowlist documented above rather than platform wildcard acceptance.

## Open Questions

See Focus questions in [../open-questions.md](../open-questions.md).
