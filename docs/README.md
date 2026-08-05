# TYP Documentation

This folder is the detailed reference layer behind `CLAUDE.md`. `CLAUDE.md` stays short and states decisions; these files hold the exhaustive evidence and punch lists a full codebase sweep produced. Written after reading every page in `app/**` line-by-line (Aug 2026).

- **[specification.md](./specification.md)** — the full product & technical specification: vision (including the course-marketplace direction), functional and non-functional requirements, data model summary, workflows, tech stack, and open decisions/risks in one place. Start here for a top-down view; the other three files are the detailed reference underneath it.
- **[data-model.md](./data-model.md)** — every entity implied by the frontend, its fields, and every enum/status value actually used, with conflicts flagged inline where two pages disagree.
- **[inconsistencies.md](./inconsistencies.md)** — a prioritized punch list of real conflicts and dead/unwired UI found during the sweep. Each item needs a product decision or a cleanup pass before backend work locks in a schema.
- **[page-inventory.md](./page-inventory.md)** — every route, grouped by role, with its purpose and the entities it touches. Use this to find "which pages will be affected if I change X."

## Why this exists

The app is frontend-only with hardcoded demo data spread across `lib/demo-data.ts` and inline arrays in ~40 individual page files. Because there's no single schema anywhere, the same real-world concept (a plan price, a class name, a payment status) was often invented independently on different pages and drifted. Before writing a real backend schema, those drifts need to be seen in one place and resolved deliberately — that's what these docs are for.

## Keeping this current

These docs describe the state of the frontend as of the full sweep. If you add or change a page, update the relevant doc in the same change — don't let this drift the way the demo data did.
