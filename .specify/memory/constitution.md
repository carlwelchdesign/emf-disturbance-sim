<!--
Sync Impact Report
Version change: 1.0.1 -> 1.1.0
Modified principles:
- None
Added sections:
- VI. Visualization Quality and Graphical Integrity (NEW)
Removed sections:
- None
Amendments:
- MINOR v1.1.0: Added Principle VI for EMF visualization quality standards (data-ink ratio, graphical integrity, truthful particle-cloud rendering)
Templates requiring updates:
- ✅ updated /Users/carl.welch/Documents/Github Projects/emf-visualizer/.specify/templates/plan-template.md
- ✅ updated /Users/carl.welch/Documents/Github Projects/emf-visualizer/.specify/templates/spec-template.md
- ✅ updated /Users/carl.welch/Documents/Github Projects/emf-visualizer/.specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->

# EMF Visualizer Constitution

## Core Principles

### I. Feature-Boundary Architecture
All work MUST preserve clear feature boundaries. Route handlers perform authentication,
authorization, validation, and delegation only; they MUST NOT embed business logic,
OpenAI calls, or Prisma orchestration inline. Business behavior belongs in feature-level
services and repositories, and shared utilities belong in `lib/` only when reused by
multiple features. New capabilities MUST extend existing feature modules before adding
new top-level structure.

Rationale: The repository already uses feature-oriented organization across the main app
and admin app. Enforcing boundaries keeps changes local, reviewable, and safe to evolve.

### II. Dependency Inversion and SOLID Delivery
Every module, component, hook, service, and route MUST follow SOLID principles. Each
unit MUST have one reason to change, implementations MUST remain substitutable, props
and interfaces MUST stay narrow, and infrastructure dependencies MUST be injected behind
feature-facing abstractions. Components render; hooks manage one concern; services
execute one business operation; repositories encapsulate Prisma access.

Rationale: This project already treats SOLID as non-negotiable. Making it constitutional
prevents convenience-driven regressions that blend rendering, orchestration, and data
access into the same unit.

### III. Test and Validation Gates
Mathematical correctness, rendering quality, and interactive behavior MUST be validated
with the smallest credible automated test set before merge. A feature is not complete
until: wave mathematics tests pass (E ⟂ B verification), rendering tests confirm visual
correctness, component tests validate state updates, files are free of type/lint/syntax
errors. When behavior crosses layers (math → geometry → rendering), at least one
integration check MUST cover the whole path.

Rationale: Physics visualization requires mathematical precision and visual accuracy.
Shallow validation allows bugs in wave equations, polarization matrices, or rendering
that break the educational value.

### IV. Design System and Accessibility Compliance
All production UI MUST use the project design system: MUI components, theme tokens,
responsive breakpoints, and accessible interaction states. Hardcoded colors, spacing,
and typography values are prohibited in feature code unless a documented theme token gap
is being closed. Keyboard access, focus visibility, live-region feedback where needed,
and WCAG AA contrast are release gates for user-facing surfaces.

Rationale: Product quality is part of the feature contract here, not a polish pass that
can be deferred until after implementation.

### V. Observable, Safe Operations
Performance and rendering quality MUST be instrumentable: animation frame rates,
parameter changes, edge case hits. Components MUST gracefully handle invalid input,
mathematical edge cases (zero wavelength, div-by-zero), and WebGL failures. State MUST
be immutable and recoverable; users can reset to sane defaults. Rendering MUST fail
gracefully if WebGL unavailable or parameters exceed bounds.

Rationale: Physics visualization must remain responsive and predictable. Silent failures
in geometry generation or WebGL errors confuse users. Observable performance enables
tuning for 60fps targets.

### VI. Visualization Quality and Graphical Integrity
All EMF visualizations MUST maximize the data-ink ratio: every pixel serves the physics
story or is removed. MUST show the data directly—prefer truthful, low-clutter
particle-cloud visualizations for EMF singles, clouds, interferences, and disturbances
over decorative effects. MUST minimize non-data ink: chartjunk, redundant grid lines,
unnecessary 3D depth cues, and visual effects that don't encode field information are
prohibited. MUST maintain graphical integrity: visual representations MUST NOT distort
physical quantities (field magnitude scales linearly, wavelength matches frequency
inverse, phase relationships preserved). Color maps MUST be perceptually uniform and
accessible. Annotations MUST clarify without obscuring the underlying field data.

Rationale: Educational visualization quality depends on signal-to-noise ratio. Excessive
decoration or misleading visual encodings teach incorrect physics. Students must see
electromagnetic field behavior directly, not artistic interpretations that sacrifice
accuracy for aesthetics. Data-ink principles ensure cognitive focus stays on wave
properties, not rendering artifacts.

## Delivery Standards

- Specs MUST define user scenarios, measurable success criteria, non-goals, and any UX,
  accessibility, or operational constraints that materially affect delivery.
- Plans MUST document the chosen structure, identify constitution gates explicitly, and
  justify any intentional complexity that crosses feature boundaries.
- Tasks MUST be traceable to user stories or concrete requirements, include exact file
  paths, and cover tests, observability, accessibility, and documentation when those
  concerns are part of the feature contract.
- Generated or AI-assisted content MUST be grounded in verifiable source data or a
  deterministic fallback strategy; speculative facts presented as truth are prohibited.

## Workflow and Quality Gates

1. Specification work MUST confirm the user journey, scope boundaries, and measurable
   outcomes before implementation begins.
2. Planning MUST pass a constitution check covering architecture boundaries, SOLID,
   validation, design-system compliance, and operational safety.
3. Implementation MUST keep changes within the smallest practical surface area and MUST
   update documentation when behavior, workflows, or operator expectations change.
4. Before completion, the owner MUST run the relevant automated checks and record any
   residual risks or intentionally deferred follow-up work.
5. Reviewers MUST reject work that claims completion while tasks, templates, or docs are
   materially out of sync with the implemented behavior.

## Governance

This constitution supersedes conflicting local workflow preferences and placeholder
template guidance. Amendments MUST be made in `.specify/memory/constitution.md`, MUST
include a Sync Impact Report at the top of the file, and MUST propagate changes to any
affected templates, prompts, or runtime guidance documents in the same change.

Versioning policy follows semantic versioning for governance:
- MAJOR: Remove or materially redefine a principle or mandatory gate.
- MINOR: Add a new principle, mandatory section, or materially stricter rule.
- PATCH: Clarify wording, examples, or references without changing enforcement.

Compliance review is mandatory for every plan and final implementation review. If a
feature cannot satisfy a principle, the violation and justification MUST be recorded in
the plan's Complexity Tracking section before implementation proceeds.

**Version**: 1.1.0 | **Ratified**: 2026-04-13 | **Last Amended**: 2026-04-14
