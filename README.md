# Research Suite (Dual‑Pane)
Two cooperating apps in one monorepo:
- Personal Notebook (private ELN, knowledge management, scheduling)
- LIMS (shared inventory, tasks, lab operations)

## Run
pnpm install
pnpm dev  # runs both apps + both APIs if you add them to scripts

## Structure
- apps/personal  — Personal ELN
- apps/lims      — LIMS
- packages/theme — Global CSS theme
- packages/ui    — Shared UI (DualPaneLayout, editors, sidebar)
- packages/types — Shared types/contracts
- packages/utils — Shared utils
- servers/*      — API servers
