# Quickstart Guide: EMF Disturbance and Interference Lab

**Audience**: Developers joining the EMF visualization project  
**Goal**: Onboard quickly, understand architecture, make first contribution  
**Time**: 30 minutes to first code change

---

## 1. Project Overview

The EMF Disturbance and Interference Lab is a **browser-based 3D visualization tool** for understanding electromagnetic field behavior. Users can:

- Add RF/EMF point sources with adjustable frequency, amplitude, phase
- Observe real-time particle-cloud visualization of wave propagation
- See interference patterns (constructive/destructive) between multiple sources
- Place measurement points to analyze field strength
- Explore curated scenarios (interference, jamming, attenuation)

**Tech Stack**: React 18 + TypeScript 5 + Next.js 14 (App Router) + React Three Fiber 8 + Three.js 0.158

---

## 2. Getting Started

### Prerequisites

- Node.js 20+ and npm 9+
- Modern browser with WebGL 2.0 (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd emf-visualizer

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Verify Setup

1. You should see a 3D canvas with one EMF source emitting particles
2. Try dragging the 3D view to orbit the camera
3. Open the control panel and adjust frequency → particles should emit faster
4. Click "Add Source" → second source appears with interference patterns

If these work, you're ready to contribute!

---

## 3. Architecture Tour

### Directory Structure

```
emf-visualizer/
├── app/
│   └── lab/                    # EMF lab feature (main work area)
│       ├── components/         # React UI components (no business logic)
│       ├── hooks/              # React hooks (state, effects)
│       ├── lib/                # Shared utilities (field math, validation)
│       ├── modules/            # Business logic (SOLID boundaries)
│       │   ├── simulation/     # Core physics (field calculations)
│       │   ├── compute/        # CPU/GPU backend abstraction
│       │   ├── source/         # Antenna models
│       │   ├── environment/    # Room/space definition
│       │   ├── scenario/       # Curated presets
│       │   ├── visualization/  # Three.js rendering config
│       │   └── reporting/      # EN 62232 compliance (V2)
│       ├── types/              # TypeScript type definitions
│       └── __tests__/          # Jest tests
├── specs/                      # Feature documentation
│   └── 001-disturbance-lab/
│       ├── spec.md             # Requirements
│       ├── plan.md             # Architecture decisions
│       ├── research.md         # Physics equations, rendering approach
│       ├── data-model.md       # Entity definitions
│       ├── contracts/          # Module interfaces
│       └── tasks.md            # Implementation tasks
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

**Module Boundaries (SOLID Architecture)**: See plan.md section 3 for full details.

---

**Quickstart Complete** ✅  
**Time to first contribution**: ~30 minutes
