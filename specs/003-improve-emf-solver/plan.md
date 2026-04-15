# Implementation Plan: Improve EMF Solver Fidelity

**Branch**: `003-improve-emf-solver` | **Date**: 2026-04-15 | **Spec**: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/003-improve-emf-solver/spec.md`
**Input**: Feature specification from `/specs/003-improve-emf-solver/spec.md`

## Summary

The current work is to make the 3D lab feel less clunky by reducing per-frame renderer overhead while preserving the existing EMF field behavior and scientific cues. The plan focuses on the R3F particle-cloud path, camera synchronization, adaptive quality controls already present in the lab store, and an explicit empty-state path for inactive scenes.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 / Next.js 14  
**Primary Dependencies**: @react-three/fiber, three, @react-three/drei, Zustand, MUI  
**Storage**: N/A  
**Testing**: Jest, ESLint, TypeScript type-check  
**Target Platform**: Browser-based desktop web app  
**Project Type**: Web application  
**Performance Goals**: Maintain 60 FPS during normal interaction with up to three active emitters, keep multi-emitter scenes readable above 45 FPS with up to five emitters, and apply source/preset changes within 250 ms  
**Constraints**: Preserve field fidelity, keep behavior within `app/lab`, avoid broad architecture changes, retain accessible MUI controls, and show a clear empty-state cue when no emitters are active  
**Scale/Scope**: Single lab experience with up to five emitters and layered field visualization

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Feature-boundary architecture: pass; changes stay inside the lab feature and its shared helpers.
- Dependency inversion and SOLID delivery: pass; the plan favors small helpers/hooks over inline orchestration.
- Test and validation gates: pass with follow-up; renderer, store, and UI changes need targeted tests.
- Design system and accessibility compliance: pass; control surfaces remain MUI-based.
- Observable, safe operations: pass; FPS monitoring and low-performance fallback already exist and should be preserved.
- Visualization quality and graphical integrity: pass; optimize presentation without changing the field story or adding decorative clutter.

## Project Structure

### Documentation (this feature)

```text
specs/003-improve-emf-solver/
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

### Source Code (repository root)

```text
app/lab/
├── components/Canvas3D/
├── components/ControlPanel/
├── components/shared/
├── hooks/
├── lib/
├── modules/scenario/
└── types/
```

**Structure Decision**: Keep the work inside `app/lab` and its shared utilities so the optimization stays local to the 3D lab without creating new top-level app boundaries.

## Complexity Tracking

No constitution violations are expected.
