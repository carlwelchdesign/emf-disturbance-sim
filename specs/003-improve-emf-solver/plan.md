# Implementation Plan: Improve EMF Solver Fidelity

**Branch**: `003-improve-emf-solver` | **Date**: 2026-04-15 | **Spec**: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/003-improve-emf-solver/spec.md`
**Input**: Feature specification from `/specs/003-improve-emf-solver/spec.md`

## Summary

Strengthen the EMF lab so multi-emitter scenes read as a clearer scientific field study: richer interference, broader spectral footprint, better directionality, and explicit fidelity controls, while staying browser-responsive and avoiding a full numerical Maxwell solver rewrite.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18.2+, Next.js 14 App Router  
**Primary Dependencies**: MUI 9, Zustand 4.4, @react-three/fiber 8.14, Three.js 0.158, @react-three/drei 9.88, Jest, Testing Library  
**Storage**: N/A; local client state only  
**Testing**: Jest, React Testing Library, TypeScript type-check, Next.js production build  
**Target Platform**: Modern desktop and laptop browsers  
**Project Type**: Web application  
**Performance Goals**: Maintain smooth interaction at 60 fps during normal lab use with up to five active emitters  
**Constraints**: Keep the visualization truthful, bounded, and low-clutter; preserve existing lab architecture; avoid a full Maxwell/FDTD overhaul  
**Scale/Scope**: One lab experience, one main canvas, one persistent control panel, curated multi-emitter presets, and one scientific fidelity workflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Feature-boundary architecture: pass
- Dependency inversion and SOLID delivery: pass
- Test and validation gates: pass
- Design system and accessibility compliance: pass
- Observable, safe operations: pass
- Visualization quality and graphical integrity: pass

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
├── components/
│   ├── Canvas3D/
│   └── ControlPanel/
├── hooks/
├── lib/
├── modules/
│   ├── compute/
│   ├── scenario/
│   └── source/
├── types/
└── __tests__/
```

**Structure Decision**: Keep the feature inside `app/lab/` and extend the existing solver, visualization, preset, and control-panel modules rather than introducing a new top-level subsystem.

## Complexity Tracking

No constitution violations require justification.
