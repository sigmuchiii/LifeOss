# LifeOS v3 Milestone 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: historical milestone plan. It preserves the original 13-module foundation scope for traceability; the current product scope is the 14 visible MVP modules documented in `docs/lifeos-v3/spec-draft.md`, with Contacts and Quick Notes visible and Psychological Health disabled/deferred unless explicitly promoted again.

**Goal:** Create the new LifeOS v3 desktop foundation with the approved shell, module registry, Rust-owned core boundary, and the first TickTick-informed daily hub skeleton.

**Architecture:** Build a new modular monolith under `lifeos-v3-app/`. React owns UI composition and transient UI state; Rust-owned services own durable commands, storage boundaries, and future domain rules. The first milestone creates the architecture and visible shell, not full module depth.

**Tech Stack:** Tauri 2, React, TypeScript, Vite, Rust, Vitest, pnpm workspace, CSS variables.

---

## Scope Check

The approved product covers 13 modules and multiple subsystems. This plan intentionally implements only Milestone 0. It does not implement full Tasks, Habits, Calendar, Notes, Finance, Trading, Health, backup/export, or sync.

## References

- `docs/lifeos-v3/lifeos-v3-design.md`
- `docs/lifeos-v3/decisions-log.md`
- `docs/lifeos-v3/design-selection.md`
- Figma board: `https://www.figma.com/design/MZuEFdqQ1iAaEZ6PjptRPq`
- TickTick app: `C:\Program Files (x86)\TickTick`
- TickTick docs: `LifrOs 2/docs/reference/ticktick-full-description.md`
- TickTick module notes: `LifrOs 2/docs/requirements/ticktick-reference-modules.md`

## File Structure

Create a new project folder:

```text
lifeos-v3-app/
  package.json
  pnpm-workspace.yaml
  .gitignore
  apps/
    desktop/
      package.json
      index.html
      vite.config.ts
      tsconfig.json
      tsconfig.app.json
      tsconfig.node.json
      src/
        main.tsx
        App.tsx
        app/
          AppShell.tsx
          moduleRegistry.ts
          moduleRegistry.test.ts
          routes.tsx
        components/
          ui/
            LifeButton.tsx
            IconButton.tsx
            ModuleHeader.tsx
            EmptyState.tsx
        core/
          runtime.ts
          runtime.test.ts
        pages/
          HomePage.tsx
          TasksPage.tsx
          HabitsPage.tsx
          CalendarPage.tsx
          FocusPage.tsx
          NotesPage.tsx
          BasicModulePage.tsx
        styles/
          theme.css
      src-tauri/
        Cargo.toml
        build.rs
        tauri.conf.json
        src/
          main.rs
          lib.rs
          core.rs
```

## Task 1: Create New Workspace Skeleton

**Files:**

- Create: `lifeos-v3-app/package.json`
- Create: `lifeos-v3-app/pnpm-workspace.yaml`
- Create: `lifeos-v3-app/.gitignore`
- Create: `lifeos-v3-app/apps/desktop/package.json`

- [ ] **Step 1: Create directories**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'lifeos-v3-app/apps/desktop/src/app','lifeos-v3-app/apps/desktop/src/components/ui','lifeos-v3-app/apps/desktop/src/core','lifeos-v3-app/apps/desktop/src/pages','lifeos-v3-app/apps/desktop/src/styles','lifeos-v3-app/apps/desktop/src-tauri/src'
```

Expected: directories exist.

- [ ] **Step 2: Add root package manifest**

Create `lifeos-v3-app/package.json`:

```json
{
  "name": "lifeos-v3",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@10.33.0",
  "scripts": {
    "dev": "corepack pnpm --filter @lifeos-v3/desktop dev",
    "build:desktop": "corepack pnpm --filter @lifeos-v3/desktop build",
    "typecheck:desktop": "corepack pnpm --filter @lifeos-v3/desktop typecheck",
    "test:desktop": "corepack pnpm --filter @lifeos-v3/desktop test",
    "tauri:dev:desktop": "corepack pnpm --filter @lifeos-v3/desktop tauri dev"
  }
}
```

- [ ] **Step 3: Add workspace config**

Create `lifeos-v3-app/pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
```

- [ ] **Step 4: Add ignore rules**

Create `lifeos-v3-app/.gitignore`:

```gitignore
node_modules/
dist/
target/
.vite/
.env
.env.local
.lifeos/
*.log
```

- [ ] **Step 5: Add desktop package manifest**

Create `lifeos-v3-app/apps/desktop/package.json`:

```json
{
  "name": "@lifeos-v3/desktop",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.10.1",
    "lucide-react": "^1.8.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.14.1",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.10.1",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "typescript": "~6.0.2",
    "vite": "^8.0.4",
    "vitest": "^4.1.4",
    "jsdom": "^29.0.2"
  }
}
```

- [ ] **Step 6: Install dependencies**

Run:

```powershell
corepack pnpm install
```

Expected: `pnpm-lock.yaml` is created under `lifeos-v3-app/`.

## Task 2: Add Vite React Entry

**Files:**

- Create: `lifeos-v3-app/apps/desktop/index.html`
- Create: `lifeos-v3-app/apps/desktop/vite.config.ts`
- Create: `lifeos-v3-app/apps/desktop/tsconfig.json`
- Create: `lifeos-v3-app/apps/desktop/tsconfig.app.json`
- Create: `lifeos-v3-app/apps/desktop/tsconfig.node.json`
- Create: `lifeos-v3-app/apps/desktop/src/main.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/App.tsx`

- [ ] **Step 1: Add `index.html`**

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LifeOS v3</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Add Vite config**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 1420,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: Add TypeScript configs**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Create `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Add React entry**

Create `src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles/theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

Create `src/App.tsx`:

```tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { moduleRoutes } from './app/routes'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {moduleRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 5: Run typecheck**

Run:

```powershell
corepack pnpm --filter @lifeos-v3/desktop typecheck
```

Expected: fails because `AppShell`, `routes`, and `theme.css` do not exist. This verifies the next tasks are required.

## Task 3: Add Module Registry

**Files:**

- Create: `lifeos-v3-app/apps/desktop/src/app/moduleRegistry.ts`
- Create: `lifeos-v3-app/apps/desktop/src/app/moduleRegistry.test.ts`

- [ ] **Step 1: Write module registry test**

```ts
import { describe, expect, it } from 'vitest'
import { deepModuleIds, moduleRegistry, planningHubModuleIds } from './moduleRegistry'

describe('moduleRegistry', () => {
  it('contains the approved 13 modules in navigation order', () => {
    expect(moduleRegistry.map((module) => module.id)).toEqual([
      'home',
      'tasks',
      'habits',
      'calendar',
      'projects',
      'notes',
      'diary',
      'physical-health',
      'psychological-health',
      'finance',
      'focus',
      'trading',
      'settings',
    ])
  })

  it('marks the approved deep modules', () => {
    expect(deepModuleIds).toEqual(['home', 'tasks', 'habits', 'calendar', 'focus', 'notes'])
  })

  it('keeps the daily planning hub narrower than all deep modules', () => {
    expect(planningHubModuleIds).toEqual(['home', 'tasks', 'habits', 'calendar'])
  })
})
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
corepack pnpm --filter @lifeos-v3/desktop test -- src/app/moduleRegistry.test.ts
```

Expected: FAIL with import error for `moduleRegistry`.

- [ ] **Step 3: Implement module registry**

Create `moduleRegistry.ts`:

```ts
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  ClipboardList,
  FolderKanban,
  HeartPulse,
  Home,
  NotebookPen,
  Settings,
  Timer,
  type LucideIcon,
} from 'lucide-react'

export type ModuleDepth = 'deep' | 'basic'

export type LifeModuleId =
  | 'home'
  | 'tasks'
  | 'habits'
  | 'calendar'
  | 'projects'
  | 'notes'
  | 'diary'
  | 'physical-health'
  | 'psychological-health'
  | 'finance'
  | 'focus'
  | 'trading'
  | 'settings'

export type LifeModule = {
  id: LifeModuleId
  title: string
  route: string
  depth: ModuleDepth
  hub: boolean
  icon: LucideIcon
  summary: string
}

export const moduleRegistry: LifeModule[] = [
  { id: 'home', title: 'Главная', route: '/', depth: 'deep', hub: true, icon: Home, summary: 'Центр текущего дня.' },
  { id: 'tasks', title: 'Задачи', route: '/tasks', depth: 'deep', hub: true, icon: CheckSquare, summary: 'TickTick-style рабочий список задач.' },
  { id: 'habits', title: 'Привычки', route: '/habits', depth: 'deep', hub: true, icon: Activity, summary: 'Повторяемые действия и отметки выполнения.' },
  { id: 'calendar', title: 'Календарь', route: '/calendar', depth: 'deep', hub: true, icon: CalendarDays, summary: 'Планирование по датам и времени.' },
  { id: 'projects', title: 'Проекты', route: '/projects', depth: 'basic', hub: false, icon: FolderKanban, summary: 'Контекст направлений и связка с задачами.' },
  { id: 'notes', title: 'Заметки', route: '/notes', depth: 'deep', hub: false, icon: BookOpen, summary: 'Markdown vault и база знаний.' },
  { id: 'diary', title: 'Дневник', route: '/diary', depth: 'basic', hub: false, icon: NotebookPen, summary: 'Личные записи по дням.' },
  { id: 'physical-health', title: 'Физическое здоровье', route: '/physical-health', depth: 'basic', hub: false, icon: HeartPulse, summary: 'Симптомы, визиты, наблюдения.' },
  { id: 'psychological-health', title: 'Психологическое здоровье', route: '/psychological-health', depth: 'basic', hub: false, icon: Brain, summary: 'Состояние и лёгкие записи самонаблюдения.' },
  { id: 'finance', title: 'Финансы', route: '/finance', depth: 'basic', hub: false, icon: CircleDollarSign, summary: 'Счета, операции, базовая статистика.' },
  { id: 'focus', title: 'Фокус', route: '/focus', depth: 'deep', hub: false, icon: Timer, summary: 'Фокус-сессии с опциональной задачей.' },
  { id: 'trading', title: 'Трейдинг', route: '/trading', depth: 'basic', hub: false, icon: BarChart3, summary: 'Ручной журнал сделок.' },
  { id: 'settings', title: 'Настройки', route: '/settings', depth: 'basic', hub: false, icon: Settings, summary: 'Тема, данные, backup/export.' },
]

export const deepModuleIds = moduleRegistry.filter((module) => module.depth === 'deep').map((module) => module.id)

export const planningHubModuleIds = moduleRegistry.filter((module) => module.hub).map((module) => module.id)

export function getModuleById(moduleId: string | undefined) {
  return moduleRegistry.find((module) => module.id === moduleId)
}
```

- [ ] **Step 4: Run registry test**

Run:

```powershell
corepack pnpm --filter @lifeos-v3/desktop test -- src/app/moduleRegistry.test.ts
```

Expected: PASS.

## Task 4: Add Approved Theme Tokens And Shell UI

**Files:**

- Create: `lifeos-v3-app/apps/desktop/src/styles/theme.css`
- Create: `lifeos-v3-app/apps/desktop/src/app/AppShell.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/components/ui/IconButton.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/components/ui/ModuleHeader.tsx`

- [ ] **Step 1: Add theme tokens**

Create `theme.css`:

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
  background: #f5f7fb;
  --app-bg: #f5f7fb;
  --chrome: #fbfcfe;
  --surface: #ffffff;
  --surface-subtle: #f8fbff;
  --border: #dce4ef;
  --border-strong: #c8d4e4;
  --text: #111827;
  --text-muted: #667085;
  --text-faint: #98a2b3;
  --primary: #1667e8;
  --primary-hover: #0f56cc;
  --primary-soft: #eaf2ff;
  --radius-sm: 8px;
  --radius-md: 12px;
  --shadow-overlay: 0 18px 50px rgba(17, 24, 39, 0.12);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 1024px;
  min-height: 100vh;
  background: var(--app-bg);
}

button,
input,
textarea,
select {
  font: inherit;
}

.app-shell {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  min-height: 100vh;
  background: var(--app-bg);
}

.app-sidebar {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 18px 14px;
  background: var(--surface);
  border-right: 1px solid var(--border);
}

.app-content {
  min-width: 0;
  display: grid;
  grid-template-rows: 76px minmax(0, 1fr);
}

.app-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--chrome);
  border-bottom: 1px solid var(--border);
}

.module-workspace {
  min-height: 0;
  padding: 16px;
}

.workspace-panel {
  min-height: calc(100vh - 108px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
```

- [ ] **Step 2: Add `IconButton`**

Create `IconButton.tsx`:

```tsx
import type { ButtonHTMLAttributes, ComponentType } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ComponentType<{ size?: number }>
  label: string
  active?: boolean
}

export function IconButton({ icon: Icon, label, active = false, ...buttonProps }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-active={active}
      style={{
        width: 48,
        height: 48,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        color: active ? '#fff' : 'var(--text-muted)',
        background: active ? 'var(--primary)' : 'var(--surface-subtle)',
        cursor: 'pointer',
      }}
      {...buttonProps}
    >
      <Icon size={20} />
    </button>
  )
}
```

- [ ] **Step 3: Add `ModuleHeader`**

Create `ModuleHeader.tsx`:

```tsx
type ModuleHeaderProps = {
  title: string
  summary: string
  depth: 'deep' | 'basic'
}

export function ModuleHeader({ title, summary, depth }: ModuleHeaderProps) {
  return (
    <header className="app-topbar">
      <div>
        <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.2 }}>{title}</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>{summary}</p>
      </div>
      <span
        style={{
          borderRadius: 999,
          border: '1px solid var(--border)',
          background: depth === 'deep' ? 'var(--primary-soft)' : 'var(--surface-subtle)',
          color: depth === 'deep' ? 'var(--primary-hover)' : 'var(--text-muted)',
          padding: '7px 10px',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {depth === 'deep' ? 'Глубокий модуль' : 'Базовый модуль'}
      </span>
    </header>
  )
}
```

- [ ] **Step 4: Add shell**

Create `AppShell.tsx`:

```tsx
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { IconButton } from '../components/ui/IconButton'
import { getModuleById, moduleRegistry } from './moduleRegistry'

export function AppShell() {
  const location = useLocation()
  const activeModule = moduleRegistry.find((module) => module.route === location.pathname) ?? getModuleById('home')

  return (
    <div className="app-shell">
      <nav className="app-sidebar" aria-label="LifeOS modules">
        {moduleRegistry.map((module) => (
          <NavLink key={module.id} to={module.route} aria-label={module.title}>
            {({ isActive }) => <IconButton icon={module.icon} label={module.title} active={isActive} />}
          </NavLink>
        ))}
      </nav>
      <main className="app-content">
        <div className="app-topbar">
          <div>
            <strong>{activeModule?.title ?? 'LifeOS'}</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Quiet Command Workspace
            </p>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Run typecheck**

Run:

```powershell
corepack pnpm --filter @lifeos-v3/desktop typecheck
```

Expected: still fails because routes/pages do not exist.

## Task 5: Add First Routes And Module Pages

**Files:**

- Create: `lifeos-v3-app/apps/desktop/src/app/routes.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/pages/HomePage.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/pages/TasksPage.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/pages/HabitsPage.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/pages/CalendarPage.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/pages/FocusPage.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/pages/NotesPage.tsx`
- Create: `lifeos-v3-app/apps/desktop/src/pages/BasicModulePage.tsx`

- [ ] **Step 1: Add basic module page**

```tsx
import type { LifeModule } from '../app/moduleRegistry'

type BasicModulePageProps = {
  module: LifeModule
}

export function BasicModulePage({ module }: BasicModulePageProps) {
  return (
    <section className="module-workspace">
      <div className="workspace-panel" style={{ padding: 24 }}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>Базовый рабочий модуль</p>
        <h2 style={{ margin: '10px 0 8px', fontSize: 28 }}>{module.title}</h2>
        <p style={{ margin: 0, maxWidth: 680, color: 'var(--text-muted)', lineHeight: 1.6 }}>{module.summary}</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Home skeleton**

Create `HomePage.tsx`:

```tsx
export function HomePage() {
  return (
    <section className="module-workspace">
      <div className="workspace-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: 20, borderRight: '1px solid var(--border)' }}>
          <h2 style={{ marginTop: 0 }}>Сегодня</h2>
          <p style={{ color: 'var(--text-muted)' }}>Расписание дня будет собирать задачи и привычки.</p>
        </div>
        <div style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>План</h2>
          <p style={{ color: 'var(--text-muted)' }}>TickTick-style daily planning surface.</p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add planning module skeletons**

Create `TasksPage.tsx`:

```tsx
export function TasksPage() {
  return (
    <section className="module-workspace">
      <div className="workspace-panel" style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr) 340px' }}>
        <aside style={{ padding: 16, borderRight: '1px solid var(--border)' }}>Сегодня / Входящие / Проекты</aside>
        <section style={{ padding: 16, borderRight: '1px solid var(--border)' }}>Список задач</section>
        <aside style={{ padding: 16 }}>Детали задачи</aside>
      </div>
    </section>
  )
}
```

Create `HabitsPage.tsx`:

```tsx
export function HabitsPage() {
  return (
    <section className="module-workspace">
      <div className="workspace-panel" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Привычки</h2>
        <p style={{ color: 'var(--text-muted)' }}>Список привычек, отметки выполнения и статистика появятся в следующем milestone.</p>
      </div>
    </section>
  )
}
```

Create `CalendarPage.tsx`:

```tsx
export function CalendarPage() {
  return (
    <section className="module-workspace">
      <div className="workspace-panel" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Календарь</h2>
        <p style={{ color: 'var(--text-muted)' }}>День, неделя и месяц будут строиться вокруг scheduled tasks and habits.</p>
      </div>
    </section>
  )
}
```

Create `FocusPage.tsx`:

```tsx
export function FocusPage() {
  return (
    <section className="module-workspace">
      <div className="workspace-panel" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Фокус</h2>
        <p style={{ color: 'var(--text-muted)' }}>Фокус-сессии будут подключаться к задачам, но не входят в центральный hub.</p>
      </div>
    </section>
  )
}
```

Create `NotesPage.tsx`:

```tsx
export function NotesPage() {
  return (
    <section className="module-workspace">
      <div className="workspace-panel" style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)' }}>
        <aside style={{ padding: 16, borderRight: '1px solid var(--border)' }}>Markdown vault</aside>
        <section style={{ padding: 16 }}>Editor / Preview</section>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Add routes**

Create `routes.tsx`:

```tsx
import type { ReactElement } from 'react'
import { BasicModulePage } from '../pages/BasicModulePage'
import { CalendarPage } from '../pages/CalendarPage'
import { FocusPage } from '../pages/FocusPage'
import { HabitsPage } from '../pages/HabitsPage'
import { HomePage } from '../pages/HomePage'
import { NotesPage } from '../pages/NotesPage'
import { TasksPage } from '../pages/TasksPage'
import { moduleRegistry } from './moduleRegistry'

export type ModuleRoute = {
  path: string
  element: ReactElement
}

export const moduleRoutes: ModuleRoute[] = moduleRegistry.map((module) => {
  if (module.id === 'home') return { path: '/', element: <HomePage /> }
  if (module.id === 'tasks') return { path: module.route, element: <TasksPage /> }
  if (module.id === 'habits') return { path: module.route, element: <HabitsPage /> }
  if (module.id === 'calendar') return { path: module.route, element: <CalendarPage /> }
  if (module.id === 'focus') return { path: module.route, element: <FocusPage /> }
  if (module.id === 'notes') return { path: module.route, element: <NotesPage /> }
  return { path: module.route, element: <BasicModulePage module={module} /> }
})
```

- [ ] **Step 5: Run checks**

Run:

```powershell
corepack pnpm --filter @lifeos-v3/desktop typecheck
corepack pnpm --filter @lifeos-v3/desktop test
```

Expected: both PASS.

## Task 6: Add Rust Core Boundary

**Files:**

- Create: `lifeos-v3-app/apps/desktop/src-tauri/Cargo.toml`
- Create: `lifeos-v3-app/apps/desktop/src-tauri/build.rs`
- Create: `lifeos-v3-app/apps/desktop/src-tauri/tauri.conf.json`
- Create: `lifeos-v3-app/apps/desktop/src-tauri/src/main.rs`
- Create: `lifeos-v3-app/apps/desktop/src-tauri/src/lib.rs`
- Create: `lifeos-v3-app/apps/desktop/src-tauri/src/core.rs`
- Create: `lifeos-v3-app/apps/desktop/src/core/runtime.ts`
- Create: `lifeos-v3-app/apps/desktop/src/core/runtime.test.ts`

- [ ] **Step 1: Add Rust manifest**

Create `Cargo.toml`:

```toml
[package]
name = "lifeos-v3-desktop"
version = "0.1.0"
edition = "2021"
rust-version = "1.77.2"

[lib]
name = "lifeos_v3_desktop_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.5.6", features = [] }

[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tauri = { version = "2.10.3", features = [] }
```

- [ ] **Step 2: Add Tauri config**

Create `build.rs`:

```rust
fn main() {
    tauri_build::build()
}
```

Create `tauri.conf.json`:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "LifeOS v3",
  "version": "0.1.0",
  "identifier": "local.lifeos.v3",
  "build": {
    "beforeDevCommand": "corepack pnpm dev",
    "devUrl": "http://127.0.0.1:1420",
    "beforeBuildCommand": "corepack pnpm build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "LifeOS v3",
        "width": 1280,
        "height": 820,
        "minWidth": 1024,
        "minHeight": 720
      }
    ]
  }
}
```

- [ ] **Step 3: Add Rust command boundary**

Create `src/core.rs`:

```rust
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AppCoreStatus {
    pub product: String,
    pub storage_mode: String,
    pub sync_enabled: bool,
}

pub fn app_core_status() -> AppCoreStatus {
    AppCoreStatus {
        product: "LifeOS v3".to_string(),
        storage_mode: "hybrid-sqlite-markdown".to_string(),
        sync_enabled: false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn app_core_status_reflects_mvp_decisions() {
        let status = app_core_status();
        assert_eq!(status.product, "LifeOS v3");
        assert_eq!(status.storage_mode, "hybrid-sqlite-markdown");
        assert!(!status.sync_enabled);
    }
}
```

Create `src/lib.rs`:

```rust
mod core;

#[tauri::command]
fn get_app_core_status() -> core::AppCoreStatus {
    core::app_core_status()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_app_core_status])
        .run(tauri::generate_context!())
        .expect("error while running LifeOS v3");
}
```

Create `src/main.rs`:

```rust
fn main() {
    lifeos_v3_desktop_lib::run()
}
```

- [ ] **Step 4: Add frontend runtime facade**

Create `src/core/runtime.ts`:

```ts
export type AppCoreStatus = {
  product: string
  storage_mode: 'hybrid-sqlite-markdown'
  sync_enabled: boolean
}

export async function getAppCoreStatus(): Promise<AppCoreStatus> {
  if (!('__TAURI_INTERNALS__' in window)) {
    return {
      product: 'LifeOS v3',
      storage_mode: 'hybrid-sqlite-markdown',
      sync_enabled: false,
    }
  }

  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<AppCoreStatus>('get_app_core_status')
}
```

Create `src/core/runtime.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getAppCoreStatus } from './runtime'

describe('runtime facade', () => {
  it('returns local MVP core status in browser mode', async () => {
    await expect(getAppCoreStatus()).resolves.toEqual({
      product: 'LifeOS v3',
      storage_mode: 'hybrid-sqlite-markdown',
      sync_enabled: false,
    })
  })
})
```

- [ ] **Step 5: Run Rust and TS checks**

Run:

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
corepack pnpm --filter @lifeos-v3/desktop test
corepack pnpm --filter @lifeos-v3/desktop typecheck
```

Expected: all PASS.

## Task 7: Run The Desktop Preview

**Files:**

- No new files.

- [ ] **Step 1: Start Vite dev server**

Run:

```powershell
corepack pnpm --filter @lifeos-v3/desktop dev
```

Expected: Vite starts on a localhost port, usually `http://127.0.0.1:1420`.

- [ ] **Step 2: Open the app in browser**

Open:

```text
http://127.0.0.1:1420
```

Expected:

- left icon sidebar is visible;
- all 13 modules are reachable;
- Home, Tasks, Habits, Calendar, Focus, Notes have dedicated surfaces;
- remaining modules show basic working surfaces;
- style follows Quiet Command Workspace.

- [ ] **Step 3: Stop server after verification**

Stop the dev server with `Ctrl+C`.

## Task 8: Update Documentation After Milestone 0

**Files:**

- Modify: `docs/lifeos-v3/implementation-roadmap.md`
- Modify: `docs/lifeos-v3/open-questions.md`

- [ ] **Step 1: Mark Milestone 0 as implemented**

In `implementation-roadmap.md`, add a status line under Milestone 0:

```markdown
Status: implemented in `lifeos-v3-app/`.
```

- [ ] **Step 2: Remove resolved first-implementation question**

If `open-questions.md` still asks which module or foundation to build first, remove that question because Milestone 0 answers it.

- [ ] **Step 3: Run final checks**

Run:

```powershell
corepack pnpm --filter @lifeos-v3/desktop typecheck
corepack pnpm --filter @lifeos-v3/desktop test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Expected: all PASS.

## Self-Review

Spec coverage:

- New project from scratch: Task 1.
- Windows desktop first: Tasks 1, 2, 6, 7.
- 13 modules: Task 3 and Task 5.
- Deep module distinction: Task 3.
- Daily hub: Task 3 and Task 5.
- Quiet Command Workspace: Task 4 and Task 7.
- Rust-owned boundary: Task 6.
- Hybrid storage decision represented as core status: Task 6.
- Sync postponed: Task 6.
- TickTick reference included for planning modules: References and Task 5 skeleton.

Known gaps intentionally deferred:

- Full task CRUD.
- SQLite schema and migrations.
- Markdown notes vault implementation.
- Backup/export.
- Search index.
- Full Tauri packaging verification.

These gaps belong to later milestone plans.
