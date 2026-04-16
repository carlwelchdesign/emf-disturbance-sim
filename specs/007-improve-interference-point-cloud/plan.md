# Implementation Plan: Improve Interference Point Cloud

**Branch**: `007-improve-interference-point-cloud` | **Date**: 2026-04-16 | **Spec**: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/spec.md`  
**Input**: Feature specification from `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/spec.md`

## Summary

Replace the current Maxwell "beachball"-style field display with a physically meaningful interference point cloud that clearly communicates constructive/destructive regions, preserves spatial truth relative to emitters, and remains interpretable during interactive emitter changes. The plan uses existing Maxwell solver outputs and visualization modules, adds explicit interference-band semantics, and tightens rendering quality gates to satisfy constitution visualization integrity requirements.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 14 / React 18  
**Primary Dependencies**: Next.js, React, MUI, Zustand, Three.js, @react-three/fiber, @react-three/drei  
**Storage**: In-memory client-side state (Zustand); feature artifacts in `/specs/007-improve-interference-point-cloud/`  
**Testing**: Jest + Testing Library + existing integration/rendering tests (`npm test`, `npm run lint`, `npm run type-check`)  
**Target Platform**: Browser-based interactive 3D lab (`/app/lab`)  
**Project Type**: Single-project web application  
**Performance Goals**:  
- Baseline reference scenarios must meet emitter-change-to-visible-update latency p95 <= 1 second  
- Preserve existing 3D usability expectations for Maxwell scenes under normal lab configurations  
**Constraints**:  
- Must remove non-data-dominant "beachball" presentation and use truthful point-cloud interference encoding  
- Must preserve graphical integrity and data-ink ratio requirements (Constitution Principle VI)  
- Must not communicate intensity by color alone (accessibility cue redundancy required)  
- Must keep emitter-to-pattern spatial correspondence and deterministic interpretation across repeated renders  
- Must include observable telemetry for interaction latency and edge-case rendering/fallback states to satisfy constitution observability gates  
**Scale/Scope**:  
- Applies to Maxwell field visualization mode and associated analysis context in the current lab  
- Includes rendering semantics, interaction behavior, and interpretation-oriented UX signals  
- Excludes new physics method families and broader non-Maxwell visualization redesign

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Review

- **I. Feature-Boundary Architecture**: PASS — changes remain in existing Maxwell visualization, analysis, and state modules; no new top-level architecture required.
- **II. Dependency Inversion and SOLID Delivery**: PASS — rendering behavior and interference encoding are planned as separable concerns (sampling/encoding/rendering) behind existing module boundaries.
- **III. Test and Validation Gates**: PASS — plan includes rendering interpretation tests, interaction update checks, and edge-case validation for extreme/low values.
- **IV. Design System and Accessibility Compliance**: PASS — control/analysis surfaces continue using MUI and must include non-color-only interference cues.
- **V. Observable, Safe Operations**: PASS — plan retains runtime safety patterns and demands graceful handling for sparse/extreme interference values.
- **VI. Visualization Quality and Graphical Integrity**: PASS — feature is explicitly centered on truthful, low-clutter data-first point-cloud rendering.

Gate Result: **PASS** (no blocking constitution violations).

### Post-Design Gate Review

- **I. Feature-Boundary Architecture**: PASS — data model and contract isolate visualization semantics from solver internals.
- **II. Dependency Inversion and SOLID Delivery**: PASS — interface contract defines stable field payload and point-cloud encoding boundary.
- **III. Test and Validation Gates**: PASS — quickstart and artifacts define independent validation for interpretation, stability, and edge behavior.
- **IV. Design System and Accessibility Compliance**: PASS — design artifacts require redundant intensity cues and readable contrast in analysis context.
- **V. Observable, Safe Operations**: PASS — includes explicit handling for saturation/sparse fields and adds interaction-latency plus edge-state telemetry instrumentation.
- **VI. Visualization Quality and Graphical Integrity**: PASS — mapping rules preserve linear magnitude relationships and prohibit decorative geometry.

Post-Design Result: **PASS** (no blockers introduced).

## Project Structure

### Documentation (this feature)

```text
/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── interference-point-cloud-contract.md
└── tasks.md  # Generated later by /speckit.tasks
```

### Source Code (repository root)

```text
/Users/carl.welch/Documents/Github Projects/emf-visualizer/
├── app/
│   └── lab/
│       ├── components/
│       │   ├── Canvas3D/
│       │   │   ├── MaxwellFieldVolume.tsx
│       │   │   ├── MaxwellFieldOverlay.tsx
│       │   │   └── InterferenceField3D.tsx
│       │   ├── Analysis/
│       │   │   ├── MaxwellRunContextPanel.tsx
│       │   │   └── EmitterInteractionsPanel.tsx
│       │   └── ControlPanel/
│       │       └── VisualizationSettings.tsx
│       ├── hooks/
│       │   └── useLabStore.ts
│       ├── modules/
│       │   └── maxwell/
│       │       └── core/
│       └── types/
│           └── maxwell.types.ts
├── __tests__/
└── specs/
```

**Structure Decision**: Use the existing single-project Next.js lab architecture. Extend Maxwell visualization-related components and supporting maxwell core/types surfaces in place, preserving current store and module seams.

## Phase Plan

### Phase 0: Outline & Research

1. Define interference-encoding semantics for point-cloud rendering (magnitude bands, constructive/destructive interpretation).
2. Establish visual clarity rules that remove non-data geometry and preserve emitter-to-field causality.
3. Define update-stability patterns for frequent emitter changes and repeatable interpretation.
4. Document accessibility-safe encoding patterns so intensity is perceivable beyond color.
5. Define observability events and latency measurement protocol for performance/reliability validation.

Output: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/research.md`

### Phase 1: Design & Contracts

1. Model entities for sampled interference points, interpretation bands, visual encoding profiles, and render-session context.
2. Define internal contract for Maxwell field payload to point-cloud transformation and render-state semantics.
3. Draft quickstart covering scenario setup, interpretation checks, edge-case checks, responsiveness checks, and telemetry verification.
4. Update Copilot agent context for new feature terms and visualization constraints.

Outputs:
- `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/data-model.md`
- `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/contracts/interference-point-cloud-contract.md`
- `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/quickstart.md`

### Phase 2: Implementation Planning Stop Point

Planning stops after artifact generation and post-design constitution check. Task decomposition is deferred to `/speckit.tasks`.

## Complexity Tracking

No constitution violations found. No complexity exemptions required.
