# ADR-0006: In-house UI design system with Tailwind + Lucide + Recharts

- Status: accepted
- Date: 2026-04-19

## Context

The initial UI (up to commit `1e184ff`) was a minimal utilitarian scaffold: a single horizontal header, zero reusable components, default Tailwind tokens, and no chart or icon library. Every page embedded Tailwind classes inline.

The product owner requested a redesign modeled on a reference dashboard (card-based layout, sidebar navigation, pastel stat tiles with colored icon chips, analytics charts). The redesign needs a coherent visual language and a small set of reusable primitives so that future pages stay consistent without re-deriving styles.

## Decision

Build an in-house, minimal design system inside the repository rather than adopting a component library:

- **Tokens in `tailwind.config.ts`.** Extend the theme with a `brand` violet scale, `surface`/`ink` neutrals, a `tile.*` palette of paired `*-bg` + `*-icon` colors, a `shadow-card` token, and `rounded-xl`/`rounded-2xl` radii. Typography uses Plus Jakarta Sans loaded via `next/font/google` and bound to `--font-sans`.
- **Primitives under `src/components/ui/`.** `Card`, `Button`, `Badge`, `StatTile`, `Table` (with `THead`/`TH`/`TBody`/`TR`/`TD`), and `Input`/`Select`/`Textarea`/`Field`. They are small, typed, and accept a `className` escape hatch.
- **Shell under `src/components/layout/`.** `Sidebar` (desktop nav with active-state via `usePathname()`), `TopBar` (page title + placeholder search + avatar), and `MobileNav` (bottom tab bar below `md`).
- **Icons via `lucide-react`.** Tree-shakable React SVG icons used in sidebar, stat tiles, and row actions.
- **Charts via `recharts`.** Area chart for lead discovery trend and donut for CMS distribution on the dashboard. Other visualizations from the reference (bar charts, world map) are intentionally out of scope.
- **Conditional classes via `clsx`.** Used instead of template-string concatenation inside primitives.

Alternatives considered and rejected:
- `shadcn/ui` — too much code surface for a single-user MVP; would require committing dozens of generated components.
- `MUI` / `Chakra UI` / `Mantine` — bundle size and opinionated theming that conflict with Tailwind.
- `chart.js` + wrapper — canvas-based, weaker React integration than Recharts for the two charts needed.
- Inline SVG charts only — insufficient for the area/donut fidelity requested.

## Consequences

- New dependencies: `lucide-react`, `recharts`, `clsx` (~100 kb gzipped on the client, acceptable for a local tool).
- New pages must consume primitives from `src/components/ui/` and layout components from `src/components/layout/` rather than embedding raw Tailwind directly for recurring patterns (cards, tables, buttons, badges).
- The home route `/` is now a server-rendered dashboard (reads Prisma directly). The previous form moved to `/searches/new`.
- Design tokens are centralized: color/spacing/typography changes happen in `tailwind.config.ts` and propagate everywhere.
- No dark mode or i18n yet — can be added on top of the tokens without a structural change.

## Evidence

- `tailwind.config.ts` — theme extend with `brand`, `surface`, `ink`, `tile.*`, `shadow-card`, `fontFamily.sans`.
- `src/app/globals.css` — body uses `bg-surface-muted text-ink-900` and `font-sans`.
- `src/app/layout.tsx` — loads `Plus_Jakarta_Sans`, mounts `Sidebar` + `TopBar` + `MobileNav`.
- `src/components/ui/*.tsx` — primitives (`Card`, `Button`, `Badge`, `StatTile`, `Table`, `Input`).
- `src/components/layout/*.tsx` — shell (`Sidebar`, `TopBar`, `MobileNav`).
- `src/components/dashboard/DiscoveryChart.tsx` and `CmsDonut.tsx` — Recharts usage.
- `src/app/page.tsx` — dashboard server component reading directly from Prisma.
- `src/app/searches/new/page.tsx` — form moved from the old root route.
- `package.json` — adds `lucide-react`, `recharts`, `clsx`.
