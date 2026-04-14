# Quickstart Guide: EMF/RF Exposure Visualization Platform

**Feature**: EMF/RF Exposure Visualization Platform  
**Branch**: `002-disturbance-lab`  
**Last Updated**: 2025-06-09

## Overview

This guide helps developers set up, understand, and contribute to the EMF/RF Visualization Platform. The project is a Next.js 14 App Router application using MUI for the UI layer, React Three Fiber for 3D visualization, Zustand for state management, and a modular architecture with clean boundaries between UI, Simulation, Compute, Environment, Source, Visualization, Scenario, and Reporting concerns. The platform follows a three-layer model: Visualization (V1), Analysis (V1.5-V2), and Professional Platform (V2+).

## Prerequisites

- **Node.js**: 18.x or 20.x
- **npm**: 9.x or 10.x
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with WebGL 2.0 support
- **Editor**: VS Code recommended (TypeScript support)

## Quick Start

### 1. Clone and Install

```bash
# Navigate to project root
cd /path/to/emf-visualizer

# Install dependencies
npm install

# Verify TypeScript configuration
npm run type-check
```

### 2. Run Development Server

```bash
# Start Next.js dev server with hot reload
npm run dev

# Open browser
open http://localhost:3000/lab
```

**Expected**: Page loads with single EMF source at center, field visualization visible in 3D canvas.

### 3. Run Tests

```bash
# Run all tests (unit + integration)
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run linter
npm run lint

# Run type checker
npm run type-check
```

### 4. Build for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm start
```

---

## Architecture Overview

### High-Level Structure

```text
┌───────────────────────────────────────────────────────────────┐
│                      Next.js App Router                       │
│                     (app/lab/page.tsx)                        │
└──────────────┬────────────────────────────────────────────────┘
               │
                ├─────► UI Module (MUI-backed React Components)
│       • ControlPanel
│       • SourceList, SourceControls
│       • MeasurementTools
│       • AccuracyDisclaimer
│       • MUI theme/provider
               │
               ├─────► Visualization Module (R3F/Three.js)
               │       • Canvas3D
               │       • FieldVisualization
               │       • SourceMarker
               │       • MeasurementPoint
               │       • EnvironmentBoundary
               │
               ├─────► Modules (Business Logic)
               │       • Simulation Module (orchestration)
               │       • Compute Module (CPU V1, GPU V2)
               │       • Source Module (antenna patterns)
               │       • Environment Module (3D space, materials)
│       • Scenario Module (presets, V1.5)
│       • Reporting Module (EN 62232, V2)
               │
               └─────► Zustand State (Global Store)
                       • Sources (RFSource[])
                       • Environment (Environment)
                       • MeasurementPoints (MeasurementPoint[])
                       • Settings (VisualizationSettings)
                       • Performance (FPS, LOD)
```

### Modular Architecture

The codebase enforces clean boundaries between 8 modules:

| Module | Responsibility | V1 Status | V2 Extensions |
|--------|---------------|-----------|---------------|
| **UI** | React components (no business logic) | ✅ Full | Richer controls |
| **Simulation** | Field calculation orchestration | ✅ Basic | Reflection/diffraction |
| **Compute** | CPU/GPU field calculation | ✅ CPU only | GPU backend |
| **Source** | Antenna/device modeling | ✅ Omnidirectional | Directional, phased |
| **Environment** | 3D space, materials | ✅ Basic boundary | Rich materials |
| **Scenario** | Configuration presets | 🔄 Stub | Common scenarios |
| **Reporting** | Assessment reports | 🔄 Interface only | EN 62232 reports |
| **Visualization** | Rendering helpers | ✅ Basic | Heatmaps, vectors |

**Key Principle**: Each module exposes TypeScript interface. V2 upgrades swap implementations without changing dependents.

### Data Flow

```text
User Action → UI Component → Zustand Action → Store Update
                                                    │
                                                    ▼
                 ┌──────────────────────────────────┴─────────┐
                 │                                            │
                 ▼                                            ▼
    Simulation Module                              React Re-render
         │                                                    │
         ▼                                                    ▼
    Compute Module (IComputeBackend)              UI Update w/ Disclaimer
         │                                                    │
         │ V1: CPUBackend                                   │
         │ V2: GPUBackend (swap via interface)              │
         │                                                    │
         ▼                                                    ▼
    FieldResult[] ──────────► Visualization Module ──► Three.js Geometry
         │                                                    │
         ▼                                                    ▼
    MeasurementPoint updates                         GPU Rendering
                                                             │
                                                             ▼
                                   Visual Update (<100ms latency)
```

### Key Principles

1. **Modular Boundaries**: Code organized by concern, not by technical layer. Each module has clean interface.
2. **SOLID**:
   - Single Responsibility: UI renders, Simulation calculates, Compute executes
   - Open/Closed: Swap compute backend (CPU→GPU) or antenna pattern (omni→directional) without modifying dependents
   - Interface Segregation: Narrow interfaces per module (IComputeBackend, IAntennaPattern, IEnvironmentModel)
   - Dependency Inversion: Depend on interfaces, not concrete classes
3. **Trust & Accuracy**: Every visualization includes accuracy disclaimer. Precision limited to model capability.
4. **V1 Practical Scope**: CPU-based, omnidirectional, simplified near/far-field. Avoid overengineering.
5. **Performance First**: 30+ FPS target with 3-5 sources (V1 CPU limit), graceful degradation with warnings
6. **Test-Driven**: Write tests before implementation, especially for module interfaces and physics calculations

---

---

## Directory Structure

```text
app/lab/                          # Feature root (Next.js App Router)
├── page.tsx                      # Main page component (entry point)
├── layout.tsx                    # Feature-specific layout (optional)
├── components/                   # React components
│   ├── Canvas3D/
│   │   ├── Canvas3D.tsx          # Three.js canvas wrapper
│   │   ├── FieldVisualization.tsx # Field line rendering
│   │   ├── SourceMarker.tsx      # 3D markers for sources
│   │   └── CameraControls.tsx    # Orbit/pan/zoom controls
│   ├── ControlPanel/
│   │   ├── ControlPanel.tsx      # Main control panel container
│   │   ├── SourceList.tsx        # List of all sources
│   │   ├── ParameterSliders.tsx  # Frequency/amplitude/phase controls
│   │   └── VisualizationSettings.tsx # Global settings
│   └── shared/
│       ├── Button.tsx            # MUI-based button wrapper
│       ├── Slider.tsx            # MUI-based slider wrapper
│       └── FPSMonitor.tsx        # Performance overlay
├── theme/                        # MUI theme and provider
│   ├── theme.ts                  # Dark scientific theme tokens
│   └── ThemeProvider.tsx         # Feature-scoped theme provider
├── hooks/                        # Custom React hooks
│   ├── useSourceStore.ts         # Zustand store hook
│   ├── useFieldCalculator.ts    # Field calculation logic
│   ├── useCameraControls.ts     # Camera manipulation
│   └── useFPSMonitor.ts          # Performance monitoring
├── lib/                          # Business logic (pure functions)
│   ├── field-calculator.ts       # EMF superposition math
│   ├── source-manager.ts         # Source CRUD operations
│   ├── visualization-helpers.ts  # Color mapping, LOD
│   ├── validation.ts             # Parameter validation
├── types/                        # TypeScript definitions
│   ├── source.types.ts           # EMFSource, CreateSourceParams
│   ├── field.types.ts            # FieldPoint, FieldGrid
│   ├── camera.types.ts           # CameraState
│   ├── visualization.types.ts    # VisualizationSettings, LODLevel
│   └── index.ts                  # Unified exports
└── __tests__/                    # Feature tests
    ├── field-calculator.test.ts
    ├── source-manager.test.ts
    └── components/
        ├── SourceList.test.tsx
        └── ParameterSliders.test.tsx

lib/                              # Global utilities (project-level)
└── (empty for V1 - add only when reused outside /lab)

__tests__/                        # Global/integration tests
└── integration/
    └── lab-workflow.test.tsx     # End-to-end user journeys

public/                           # Static assets
└── (none needed for V1)
```

---

## Key Concepts

### 1. EMF Source

A point source emitting electromagnetic waves. Key parameters:
- **Position** (x, y, z): Location in 3D space
- **Frequency** (Hz): Wave oscillation rate
- **Amplitude**: Field strength
- **Phase** (radians): Wave offset

**Example**:
```typescript
const source: EMFSource = {
  id: 'source-1',
  position: { x: 0, y: 0, z: 0 },
  frequency: 1.0,  // 1 Hz
  amplitude: 1.0,  // Normalized to 1.0
  phase: 0,        // 0 radians (in-phase)
  active: true,
};
```

### 2. Field Calculation

Field strength at point P is computed via **superposition**:

```
E(P, t) = Σ [ (A_i / r_i) × sin(2πf_i × t - k_i × r_i + φ_i) ]

where:
  A_i = amplitude of source i
  r_i = distance from source i to point P
  f_i = frequency of source i
  k_i = wave number = 2πf_i / c (c = 1 for visualization)
  φ_i = phase of source i
```

**In Code**:
```typescript
function calculateFieldAtPoint(
  point: Vector3D,
  sources: EMFSource[],
  time: number
): number {
  let totalField = 0;
  
  for (const source of sources) {
    const r = distance(point, source.position);
    if (r < 0.01) continue; // Avoid singularity
    
    const k = (2 * Math.PI * source.frequency);
    const phase = k * time - k * r + source.phase;
    const field = (source.amplitude / r) * Math.sin(phase);
    
    totalField += field;
  }
  
  return totalField;
}
```

### 3. Interference Patterns

When multiple sources overlap:
- **Constructive Interference**: Waves in-phase → field strength increases
- **Destructive Interference**: Waves out-of-phase → field strength decreases

**Example**: Two sources with identical frequency, 180° phase difference create alternating bright/dark bands (classic double-slit pattern).

### 4. State Management (Zustand)

All app state lives in a single Zustand store:

```typescript
import { useSourceStore } from '@/app/lab/hooks/useSourceStore';

// In a component:
function MyComponent() {
  // Subscribe to sources only (re-renders when sources change)
  const sources = useSourceStore((state) => state.sources);
  
  // Get actions (don't cause re-renders)
  const addSource = useSourceStore((state) => state.addSource);
  const updateSource = useSourceStore((state) => state.updateSource);
  
  // Use actions
  const handleAddSource = () => {
    addSource({
      position: { x: 1, y: 0, z: 0 },
      frequency: 1.0,
      amplitude: 1.0,
      phase: 0,
      active: true,
    });
  };
  
  return <div>{/* ... */}</div>;
}
```

---

## Common Tasks

### Add a New Component

1. **Create component file** in `app/lab/components/`
2. **Define props interface** with TypeScript
3. **Use the MUI theme** from `theme/theme.ts` and wrap the app with the feature theme provider
4. **Add ARIA labels** for accessibility
5. **Write component test** in `__tests__/components/`

**Example**:
```typescript
// components/shared/Button.tsx
import MuiButton from '@mui/material/Button';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  'aria-label'?: string;
}

export function Button({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  'aria-label': ariaLabel,
}: ButtonProps) {
  return (
    <MuiButton
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      color={variant === 'primary' ? 'primary' : 'secondary'}
      variant="contained"
    >
      {children}
    </MuiButton>
  );
}
```

### Add Field Calculation Logic

1. **Write test first** in `__tests__/field-calculator.test.ts`
2. **Implement function** in `lib/field-calculator.ts`
3. **Export from types** if new interfaces needed
4. **Integrate with hook** `useFieldCalculator.ts`

**TDD Example**:
```typescript
// __tests__/field-calculator.test.ts
describe('calculateFieldAtPoint', () => {
  it('calculates field strength for single source', () => {
    const source: EMFSource = {
      id: 'test',
      position: { x: 0, y: 0, z: 0 },
      frequency: 1.0,
      amplitude: 1.0,
      phase: 0,
      active: true,
    };
    
    const point = { x: 1, y: 0, z: 0 }; // 1 meter away
    const field = calculateFieldAtPoint(point, [source], 0);
    
    // At t=0, sin(0) = 0, but with distance: sin(-k*r)
    // Expected: (1.0 / 1.0) * sin(-2π * 1.0) ≈ 0
    expect(field).toBeCloseTo(0, 5);
  });
  
  it('shows constructive interference for in-phase sources', () => {
    const source1: EMFSource = { /* ... */ phase: 0 };
    const source2: EMFSource = { /* ... */ phase: 0 };
    
    const midpoint = { x: 0, y: 0, z: 0 };
    const field = calculateFieldAtPoint(midpoint, [source1, source2], 0);
    
    // Two in-phase sources at equal distance → field doubles
    expect(field).toBeCloseTo(2.0, 1);
  });
});
```

### Debug Performance Issues

1. **Enable FPS monitor**:
   ```typescript
   useSourceStore.setState({ 
     settings: { ...settings, showFPS: true } 
   });
   ```

2. **Check LOD level**:
   ```typescript
   const lod = useSourceStore((state) => state.settings.lod);
   console.log('Current LOD:', lod); // 'high' | 'medium' | 'low'
   ```

3. **Profile in React DevTools**:
   - Open React DevTools → Profiler
   - Record a session while adjusting parameters
   - Identify components re-rendering unnecessarily

4. **Use Chrome DevTools Performance**:
   - Record → Interact with 3D view → Stop
   - Check for long JS tasks, layout thrashing, or shader compilation

5. **Reduce source count or field line density**:
   ```typescript
   updateSettings({ fieldLineDensity: 20 }); // Down from 50
   ```

### Add a Test

**Unit Test** (pure function):
```typescript
// __tests__/lib/validation.test.ts
import { SourceValidator } from '@/app/lab/lib/validation';

describe('SourceValidator', () => {
  it('rejects frequency out of range', () => {
    const result = SourceValidator.validate({ frequency: 100 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Frequency must be between 0.1 and 10 Hz');
  });
});
```

**Component Test**:
```typescript
// __tests__/components/SourceList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SourceList } from '@/app/lab/components/ControlPanel/SourceList';

describe('SourceList', () => {
  it('calls onAdd when Add Source button is clicked', () => {
    const onAdd = jest.fn();
    render(
      <SourceList 
        sources={[]} 
        selectedId={null}
        onSelect={jest.fn()}
        onRemove={jest.fn()}
        onAdd={onAdd}
      />
    );
    
    const addButton = screen.getByRole('button', { name: /add source/i });
    fireEvent.click(addButton);
    
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
```

**Integration Test**:
```typescript
// __tests__/integration/lab-workflow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LabPage from '@/app/lab/page';

describe('Lab Workflow', () => {
  it('allows user to add source and adjust parameters', () => {
    render(<LabPage />);
    
    // Add source
    const addButton = screen.getByRole('button', { name: /add source/i });
    fireEvent.click(addButton);
    
    // Verify source appears in list
    const sourceItems = screen.getAllByRole('listitem');
    expect(sourceItems).toHaveLength(2); // Default + new source
    
    // Select new source
    fireEvent.click(sourceItems[1]);
    
    // Adjust frequency slider
    const frequencySlider = screen.getByLabelText(/frequency/i);
    fireEvent.change(frequencySlider, { target: { value: '2.0' } });
    
    // Verify frequency updated (would check 3D rendering in E2E test)
    expect(frequencySlider).toHaveValue('2.0');
  });
});
```

---

## Troubleshooting

### "WebGL context lost" Error

**Cause**: GPU crashed or browser ran out of memory.

**Fix**:
1. Reduce field line density: `updateSettings({ fieldLineDensity: 20 })`
2. Remove sources: `clearAllSources()`
3. Refresh page to restore WebGL context
4. Check browser console for memory warnings

**Prevention**: Implement WebGL context loss handler (see Constitution Principle V).

### Sliders Lag When Dragging

**Cause**: Field recalculation happening at 60 FPS.

**Fix**: Already throttled to 20 FPS. If still laggy:
1. Check `useThrottledFieldUpdate` delay (increase to 100ms)
2. Verify LOD system is active
3. Profile with React DevTools to find bottleneck

### Tests Fail with "Cannot find module '@/app/lab/...'"

**Cause**: Jest doesn't recognize TypeScript path aliases.

**Fix**: Update `jest.config.js`:
```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // ...
};
```

### Type Errors in Three.js Components

**Cause**: React Three Fiber types may conflict with Three.js types.

**Fix**:
1. Use `@react-three/fiber` types: `import type { ThreeElements } from '@react-three/fiber'`
2. Explicitly type refs: `useRef<THREE.Mesh>(null)`
3. Check `@types/three` version matches `three` version

---

## Configuration

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    },
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Jest (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/__tests__/**',
  ],
};
```

### ESLint (`.eslintrc.json`)

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_" 
    }]
  }
}
```

---

## Accessibility Checklist

- [ ] All interactive elements have ARIA labels
- [ ] Keyboard navigation works (Tab, Arrow keys, Enter/Space)
- [ ] Focus indicators visible (outline on focused elements)
- [ ] 3D canvas has text alternative: `<canvas aria-label="...">`
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Slider values announced by screen readers
- [ ] Error messages associated with form controls

**Test with**:
- Keyboard only (no mouse)
- Screen reader (VoiceOver on macOS, NVDA on Windows)
- Browser zoom (200%, 300%)
- High contrast mode

---

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Initial Load | < 2 seconds | Chrome DevTools → Network (Slow 3G) |
| Time to Interactive | < 3 seconds | Lighthouse report |
| FPS (5 sources) | ≥ 30 FPS | FPS monitor component |
| FPS (10 sources) | ≥ 20 FPS | FPS monitor with LOD adjustment |
| Parameter Latency | < 100ms | React DevTools Profiler |
| Memory Usage | < 200 MB | Chrome Task Manager |

**Optimization Priorities**:
1. GPU rendering (WebGL shaders) for field calculations
2. Spatial sampling (coarse grid) over per-pixel calculations
3. Throttled updates during slider drag
4. Dynamic LOD based on FPS monitoring
5. Tree-shaking and code splitting (Next.js automatic)

---

## Resources

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Three.js](https://threejs.org/docs/)

### Related Files
- [Implementation Plan](./plan.md)
- [Research Document](./research.md)
- [Data Model](./data-model.md)
- [Feature Specification](./spec.md)
- [Constitution](./../.specify/memory/constitution.md)

### Internal Contacts
- **Architecture Questions**: Review Constitution Principle I (Feature-Boundary Architecture)
- **Math/Physics Questions**: See research.md Section 2 (Field Calculation Strategy)
- **Performance Issues**: See research.md Section 5 (Performance Optimization)

---

## Next Steps

1. **Read the Feature Spec**: [spec.md](./spec.md) for user stories and requirements
2. **Review Data Model**: [data-model.md](./data-model.md) for TypeScript interfaces
3. **Set up dev environment**: Run `npm install && npm run dev`
4. **Run tests**: `npm test` to verify setup
5. **Pick a task**: Once `tasks.md` is generated (via `/speckit.tasks`), start with P1 tasks
6. **Ask questions**: Check research.md for answered clarifications, file new questions in spec.md if needed

---

## Contributing

### Code Style
- Use TypeScript strict mode (no `any` types)
- Prefer functional components with hooks
- Extract reusable logic into custom hooks
- Keep components under 200 lines (split if larger)
- Write JSDoc comments for public APIs

### Git Workflow
- **Branch**: `002-disturbance-lab`
- **Commits**: Use conventional commits (e.g., `feat:`, `fix:`, `test:`)
- **Pull Requests**: Reference task ID in PR description
- **Reviews**: Two-person approval for constitution-critical changes

### Testing
- Write tests before implementation (TDD for math/logic)
- Aim for 80%+ code coverage
- Run `npm run type-check && npm test` before committing
- Add integration tests for user-facing features

---

**Last Updated**: 2025-06-09  
**Maintained By**: EMF Visualizer Team  
**Questions?**: File an issue or check [research.md](./research.md) for design decisions.
