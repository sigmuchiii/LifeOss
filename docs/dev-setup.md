# Локальная сборка LifeOss

## Требования (Windows)

1. **Node.js 20+** — https://nodejs.org
2. **Rust (stable)** — https://rustup.rs (`rustup default stable`)
3. **Visual Studio Build Tools** с workload «Desktop development with C++» (нужно для Rust/MSVC)
4. **WebView2 Runtime** — на Windows 10/11 обычно уже установлен

## Первый запуск

```bash
git clone https://github.com/sigmuchiii/LifeOss.git
cd LifeOss
npm install
npm run tauri dev
```

Первый запуск долгий (компиляция Rust-зависимостей, включая bundled SQLite). Далее — быстрее.

## Полезное

- Только фронтенд в браузере (без Rust): `npm run dev` → http://localhost:1420 (backend-статус покажет «недоступен» — это нормально)
- База данных создаётся в `%APPDATA%/app.lifeoss.desktop/lifeoss.db`
- Прод-сборка: `npm run tauri build` (bundle сейчас выключен — включим на этапе релиза)

## Схема работы с агентом

Код пишет агент lifeos (PromptQL) и коммитит в `main`. Локально:

```bash
git pull
npm install   # если менялся package.json
npm run tauri dev
```

Ошибки сборки/скриншоты — в чат агенту, он правит и пушит снова.
