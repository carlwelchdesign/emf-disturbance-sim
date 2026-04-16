# emf-visualizer Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-15

## Active Technologies
- TypeScript 5.x with React 18 and Next.js 14 App Router + MUI, Zustand, @react-three/fiber, three, @react-three/drei, Jest, Testing Library (002-disturbance-lab)
- N/A; local client state only for V1 (002-disturbance-lab)
- TypeScript 5.3+, React 18.2+, Next.js 14 (App Router) + React Three Fiber 8.14+, Three.js 0.158+, Zustand 4.4+ (state), MUI 9.0+ (design system), @react-three/drei 9.88+ (3D helpers) (002-disturbance-lab)
- N/A (client-side only, local state in memory; V1.5 may add localStorage) (002-disturbance-lab)
- TypeScript 5.3+, React 18.2+, Next.js 14 App Router + MUI 9, Zustand 4.4, @react-three/fiber 8.14, Three.js 0.158, @react-three/drei 9.88, Jest, Testing Library (003-improve-emf-solver)
- TypeScript 5.x / React 18 / Next.js 14 + @react-three/fiber, three, @react-three/drei, Zustand, MUI (003-improve-emf-solver)
- TypeScript 5.x, React 18, Next.js 14 + MUI, Zustand, @react-three/fiber, three, Jes (004-create-feature-branch)
- N/A (in-memory client state via Zustand) (004-create-feature-branch)
- TypeScript 5.x on Next.js 14 / React 18 + Next.js, React, Zustand, Three.js, React Three Fiber, MUI, Jest + Testing Library (006-add-maxwell-solver)
- In-memory runtime state plus file-based/spec documentation artifacts under `/specs/006-implement-maxwell-solver/` (006-add-maxwell-solver)
- TypeScript 5.x on Next.js 14 / React 18 + Next.js, React, MUI, Zustand, Three.js, @react-three/fiber, @react-three/drei (007-improve-interference-point-cloud)
- In-memory client-side state (Zustand); feature artifacts in `/specs/007-improve-interference-point-cloud/` (007-improve-interference-point-cloud)

- TypeScript 5.3, React 18.2, Next.js 14.0 (App Router) + @react-three/fiber 8.14, @react-three/drei 9.88, three r158, zustand 4.4 (002-disturbance-lab)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.3, React 18.2, Next.js 14.0 (App Router): Follow standard conventions

## Recent Changes
- 007-improve-interference-point-cloud: Added TypeScript 5.x on Next.js 14 / React 18 + Next.js, React, MUI, Zustand, Three.js, @react-three/fiber, @react-three/drei
- 006-add-maxwell-solver: Added TypeScript 5.x on Next.js 14 / React 18 + Next.js, React, Zustand, Three.js, React Three Fiber, MUI, Jest + Testing Library
- 006-add-maxwell-solver: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
