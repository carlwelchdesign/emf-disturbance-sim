# Implementation Plan: Operator Sidebar Redesign

**Branch**: `004-create-feature-branch` | **Date**: 2026-04-15 | **Spec**: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/004-operator-sidebar-redesign/spec.md`
**Input**: Feature specification from `/specs/004-operator-sidebar-redesign/spec.md`

## Summary

Rework the current monolithic lab sidebar into a hierarchical operator console that separates global setup, source inventory, focused source editing, visualization controls, analysis, and system/view utilities. Implementation will preserve existing simulation behavior while restructuring `ControlPanel` composition, introducing section-level disclosure patterns, and enforcing stateful source-focused editing without inline per-source clutter in the list.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Next.js 14  
**Primary Dependencies**: MUI, Zustand, @react-three/fiber, three, Jest  
**Storage**: N/A (in-memory client state via Zustand)  
**Testing**: Jest + Testing Library, ESLint, TypeScript type-check  
**Target Platform**: Desktop browser (Next.js web app at `/lab`)  
**Project Type**: Single-project web application (frontend-heavy control surface)  
**Performance Goals**: Maintain smooth control responsiveness during live simulation; preserve current FPS monitoring behavior and avoid introducing noticeable control-panel interaction lag  
**Constraints**: Sidebar-only redesign, strict global-vs-local separation, progressive disclosure for advanced controls, professional high-density operator UX, no simulation-engine behavior regression  
**Scale/Scope**: Support workflows from 0 to 5 sources (current limit) with architecture that remains scannable as source count grows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Review

- **I. Feature-Boundary Architecture**: PASS — work is contained in `app/lab/components/ControlPanel`, related shared components, store types/selectors, and tests.
- **II. Dependency Inversion and SOLID Delivery**: PASS — plan decomposes UI into intent-based panels and keeps state orchestration in store/hooks rather than view monoliths.
- **III. Test and Validation Gates**: PASS (with required follow-through) — panel composition, selection behavior, and disclosure defaults need component/store tests plus lint/type-check/test runs.
- **IV. Design System and Accessibility Compliance**: PASS — implementation remains MUI-token-based, with explicit keyboard and focus requirements in scope.
- **V. Observable, Safe Operations**: PASS — preserve existing performance indicators, avoid silent failures, keep reset/empty-state flows explicit.
- **VI. Visualization Quality and Graphical Integrity**: PASS — no change to field math/render semantics; control hierarchy improves signal-to-noise and operator comprehension.

### Post-Design Gate Review (after Phase 1 artifacts)

- **I–VI**: PASS — research, data model, and contracts keep architecture local, testable, accessible, and aligned with visualization integrity constraints.

## Project Structure

### Documentation (this feature)

```text
specs/004-operator-sidebar-redesign/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sidebar-control-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/lab/
├── components/
│   ├── ControlPanel/
│   │   ├── ControlPanel.tsx
│   │   ├── SourceList.tsx
│   │   ├── SourceControls.tsx
│   │   ├── EnvironmentControls.tsx
│   │   ├── VisualizationSettings.tsx
│   │   ├── MeasurementTools.tsx
│   │   └── ScenarioPresets.tsx
│   ├── Analysis/
│   └── shared/
├── hooks/
│   └── useLabStore.ts
├── lib/
└── types/
```

**Structure Decision**: Keep all implementation within existing `app/lab` feature boundaries and split the current `ControlPanel` flow into intent-driven panel composition. This avoids new top-level app structure while enabling clear separation between global controls and selected-entity editing.

## Phase 0: Research Plan

1. Validate operator-console hierarchy patterns for dense inspector-style sidebars and map them to existing MUI primitives.
2. Confirm progressive disclosure defaults that reduce slider fatigue without hiding critical controls.
3. Define state behavior for no selection, single selection, and optional multi-selection consistent with current store architecture.
4. Confirm accessibility and keyboard behaviors for accordion/panelized sidebar navigation.

## Phase 1: Design & Contracts Plan

1. Model control-surface entities (sections, source selection context, control groups, priority tiers, disclosure state).
2. Define UI interaction contract for sidebar sections, source selection, focused editing, and dual-mode controls.
3. Document implementation quickstart focused on sequencing UI refactor safely in existing codebase.
4. Update agent context via `.specify/scripts/bash/update-agent-context.sh copilot`.

## Complexity Tracking

No constitution violations currently identified.
