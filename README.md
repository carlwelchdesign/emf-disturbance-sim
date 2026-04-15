# EMF Visualizer

Interactive EMF/RF disturbance lab built with Next.js, React Three Fiber, MUI, and Zustand.

## Quickstart

```bash
npm install
npm run dev
```

Open `http://localhost:3000/lab`.

## Scripts

- `npm run dev` — start the app
- `npm run test` — run the test suite
- `npm run type-check` — run TypeScript checks
- `npm run build` — production build

## Features

- 3D source visualization
- Source add/remove/selection controls
- Frequency, power, and phase controls
- Environment and visualization settings
- Measurement capture and field readouts
- FPS monitoring and adaptive LOD
- WebGL error handling and accessibility labels

## Architecture

The lab is organized into small modules:

- `app/lab/components/` — UI, control panel, analysis overlays, and 3D scene wrappers
- `app/lab/hooks/` — stateful hooks for camera, FPS monitoring, and field calculation
- `app/lab/lib/` — math, validation, camera, and visualization helpers
- `app/lab/modules/` — simulation and source/compute abstractions
- `app/lab/types/` — shared domain types and defaults

State lives in a Zustand store so UI controls and the 3D scene stay synchronized.

## Testing

Integration and component tests live under `__tests__/` and `app/lab/__tests__/`.
Run `npm test` before merging changes.
