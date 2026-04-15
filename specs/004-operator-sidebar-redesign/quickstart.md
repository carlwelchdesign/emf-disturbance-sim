# Quickstart

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm run dev`
3. Open the lab interface:
   `http://localhost:3000/lab`
4. Validate target workflows in sidebar:
   - Configure Simulation Setup without touching per-source controls
   - Add/select sources in Active Entities
   - Edit selected source in Selected Entity only
   - Expand advanced controls and verify default-collapsed behavior
   - Adjust Visualization, Analysis, and System/View sections independently
5. Run project checks before handoff:
   `npm test`
   `npm run lint`
   `npm run type-check`
6. Sidebar migration checkpoint:
   - Verify section order remains fixed: Simulation Setup → Active Entities → Selected Entity → Visualization Controls → Analysis / Measurements → System / View
   - Verify source list acts as inventory/selection only (all source editing is in Selected Entity)
