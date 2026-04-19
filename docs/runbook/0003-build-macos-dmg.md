# RB-0003: Build and distribute the macOS desktop app

## When to use

Use this procedure when you need to produce a distributable `.dmg` installer for macOS (Intel or Apple Silicon).

## Prerequisites

- A macOS machine or a GitHub Actions runner (`macos-latest`).
- Node.js 20+ installed.
- `npm install` completed (including `electron`, `electron-builder`, `esbuild`).
- `.env` with `SERPAPI_KEY` set (used only to smoke-test; the build itself does not need it).
- `build-resources/icon.icns` present (512×512 app icon in ICNS format).

## Steps

1. From the repo root, run:
   ```bash
   npm run dist
   ```
   This script runs in order:
   - `prisma generate` — regenerates the Prisma client with `darwin`/`darwin-arm64` binaries.
   - `next build` — produces `.next/standalone/` with the production server.
   - `build:worker` — compiles `src/server/jobs/worker.ts` to `dist/worker.cjs` via esbuild.
   - Copies `.next/static/` into `.next/standalone/.next/static/` so the standalone server can serve assets.
   - `build:db-template` — runs `prisma db push` + `seed-admin` into `electron/leadvero-template.db`.
   - `electron-builder --mac` — assembles `release/Leadvero-x.x.x.dmg` for `x64` and `arm64`.

2. The finished installers appear in `release/`.

## Verification

1. Mount the `.dmg`, drag Leadvero to `/Applications`, and launch it.
2. A splash screen appears briefly while the server starts.
3. The app opens at the login screen on `http://127.0.0.1:3847`.
4. Log in with `admin` / `admin`. You are prompted to change your password.
5. After the password change you are redirected to `/settings?setup=1` to enter the SerpAPI key.
6. Enter the key, save, and create a test search to verify the worker processes it.
7. Close the window — the dock icon remains. Clicking it reopens the window.
8. Quit via the menu (`Cmd+Q`) — both Next.js and the worker terminate cleanly.

## Distributing without code-signing

An unsigned build will trigger a macOS Gatekeeper warning on the recipient's machine. They must right-click the app → **Apri** to bypass it on first launch. For smooth distribution, sign with an Apple Developer ID via `electron-builder`'s `win.certificateFile` / `mac.identity` options.

## Rollback / Rebuild

- Delete `release/`, `.next/`, `dist/`, and `electron/leadvero-template.db`, then re-run `npm run dist`.
- The template DB is a build artifact — never commit it to git.

## Evidence

- `package.json` — `dist` and `build:all` scripts.
- `electron-builder.yml` — DMG target configuration.
- `electron/main.js` — runtime startup and process management.
- `scripts/build-db-template.ts` — template DB generation.
- `docs/adr/0011-electron-macos-packaging.md` — architecture rationale.
