# ADR-0011: Electron packaging for macOS desktop distribution

- Status: accepted
- Date: 2026-04-19

## Context

The end user is non-technical and should not need to install Node.js, Docker, or any runtime dependency. The goal is a `.dmg` file they drag into `/Applications` and double-click.

## Decision

Wrap the application in Electron, which bundles Node.js 20 and Chromium into a self-contained `.app` bundle. `electron-builder` produces a signed or unsigned `.dmg` with NSIS-style drag-to-install UX.

The Electron main process (`electron/main.js`) is responsible for:

1. Loading or creating `userData/config.json` (SERPAPI_KEY and a per-install SESSION_SECRET).
2. Copying `electron/leadvero-template.db` to `userData/leadvero.db` on first launch (see ADR-0010).
3. Injecting environment variables (`DATABASE_URL`, `SERPAPI_KEY`, `SESSION_SECRET`, `LEADVERO_DATA_DIR`, `PORT`, `HOSTNAME`) before forking child processes.
4. Forking the Next.js standalone server (`server.js`) and the compiled worker (`dist/worker.cjs`).
5. Polling `http://127.0.0.1:3847` for readiness, then opening a `BrowserWindow`.
6. On macOS: hiding rather than closing the window so background jobs continue; the app stays in the dock.

The web UI is served on `127.0.0.1:3847` (not exposed to the network) and loaded in the Electron `BrowserWindow`. No custom protocol or Electron IPC is needed for the core app; the window is simply a browser frame pointed at the local server.

A `/settings` page (admin-only) allows the operator to enter their `SERPAPI_KEY` after first login. The Electron shell redirects to this page automatically (via middleware) if the key is empty.

The build must run on macOS because `electron-builder` does not support cross-compiling macOS targets from Windows. Use a Mac or a GitHub Actions `macos-latest` runner.

## Consequences

- Installer size is ~200–230 MB compressed (Electron ships Chromium).
- Unsigned builds will trigger macOS Gatekeeper on first launch; the user must right-click → Open. Code-signing with an Apple Developer ID ($99/year) removes this friction.
- The Next.js dev server (`npm run dev`) remains the primary workflow for development; the Electron shell is only needed when testing the packaged distribution.
- `dist/worker.cjs` and `electron/leadvero-template.db` are build artifacts excluded from git.

## Evidence

- `electron/main.js` implements the full lifecycle described above.
- `electron-builder.yml` configures the DMG target for `x64` and `arm64` architectures.
- `package.json` — `"main": "electron/main.js"`, `dist` and `build:all` scripts.
- `src/app/settings/page.tsx` and `src/app/api/settings/route.ts` implement the SERPAPI_KEY setup UI.
- `src/middleware.ts` redirects admins to `/settings?setup=1` when `LEADVERO_DATA_DIR` is set and `SERPAPI_KEY` is empty.
