# Implementation Plan: EMF Disturbance and Interference Lab

**Branch**: `002-disturbance-lab` | **Date**: 2026-04-15 | **Spec**: `specs/001-disturbance-lab/spec.md`
**Input**: Feature specification from `specs/001-disturbance-lab/spec.md`

## Summary

Build a single-page EMF lab with a calm, Jarvis-like particle language: small moving dots, slow readable motion, and source-to-source interaction driven by pure EMF math. The renderer should visualize superposition, attenuation, reflection, noise, and conceptual divergence/curl flow cues as subtle changes in dot density, brightness, cadence, and local flow rather than fast streaks or volumetric spread. The math stays deterministic and isolated from rendering so the system can evolve toward analysis and GPU-backed compute later.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18 and Next.js 14 App Router  
**Primary Dependencies**: MUI, Zustand, @react-three/fiber, three, @react-three/drei, Jest, Testing Library  
**Storage**: N/A; local client state only for V1  
**Testing**: Jest, React Testing Library, `next build`, `tsc --noEmit`  
**Target Platform**: Web browser with WebGL support  
**Project Type**: Web application  
**Performance Goals**: 60 fps target with calm motion and readable particles; 30 fps minimum under load; parameter changes should feel immediate (<100 ms perceived latency)  
**Constraints**: Keep math pure and deterministic, avoid overclaiming physical accuracy, use subtle dot-like motion instead of fast streaks, and degrade gracefully when WebGL or frame budget is limited  
**Scale/Scope**: One primary lab page, 3-5 active sources in V1, multiple disturbance presets, room for V2 physics and GPU expansion

### Technical Approach

- Keep the feature inside `app/lab`.
- Use pure compute helpers for the EMF formulas and derived approximations:
  - plane wave, superposition, attenuation, reflection, noise, point source, near/far falloff
  - keep FDTD, beam steering, and advanced field solvers for later phases
- Render the simulation as a subtle particle field:
  - small emissive dots with halos, not ray lines
  - slower motion cadence with clear source ownership
  - interaction driven by phase, overlap, attenuation, and disturbance zones
  - conceptual divergence/curl flow cues for V1 explanation, not a full Maxwell solver
  - visual response in brightness, density, and local drift when sources interact
- Keep MUI as the UI layer and Zustand as the state source of truth.

## Constitution Check

**Pass status**: PASS

- **Feature-Boundary Architecture**: Preserved through `app/lab` feature modules and pure helpers in `lib/`.
- **Dependency Inversion and SOLID Delivery**: Compute logic stays behind narrow helpers/interfaces; UI components render and dispatch actions only.
- **Test and Validation Gates**: The plan requires math, rendering, component, and integration checks before completion.
- **Design System and Accessibility Compliance**: MUI remains the UI layer; controls and overlays stay accessible.
- **Observable, Safe Operations**: WebGL failure handling, reset actions, performance warnings, bounded controls, and measurement overlays remain part of the design.

## Project Structure

### Documentation (this feature)

```text
specs/001-disturbance-lab/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)

```text
app/lab/
├── page.tsx
├── layout.tsx
├── components/
│   ├── Canvas3D/
│   │   ├── Canvas3D.tsx
│   │   ├── CameraControls.tsx
│   │   ├── FieldVisualization.tsx
│   │   ├── SourceMarker.tsx
│   │   ├── MeasurementPoint.tsx
│   │   └── EnvironmentBoundary.tsx
│   ├── ControlPanel/
│   │   ├── ControlPanel.tsx
│   │   ├── SourceControls.tsx
│   │   ├── SourceList.tsx
│   │   ├── FrequencyPresets.tsx
│   │   ├── EnvironmentControls.tsx
│   │   └── VisualizationSettings.tsx
│   ├── Analysis/
│   └── shared/
├── hooks/
├── lib/
├── modules/
└── types/
```

**Structure Decision**: Keep a single Next.js app with a feature-scoped `app/lab` module. No new top-level app or service is needed for V1.

## Complexity Tracking

None. The proposed approach stays within the existing feature boundary and does not require a constitutional exception.
