# Quickstart: Improve EMF Solver Fidelity

## Goal

Verify the stronger EMF field model, multi-emitter interference, and fidelity controls in the lab.

## Steps

1. Install dependencies if needed:
   `npm install`
2. Start the app:
   `npm run dev`
3. Open the EMF lab and load a multi-emitter preset.
4. Compare the simplified and more scientific field views.
5. Adjust emitter frequency, phase, and bandwidth to confirm the overlap pattern changes.
6. Run validation:
   `npm run type-check`
   `npm test`
7. Confirm the production build still succeeds:
   `npm run build`

## What to look for

- Clear reinforcement and cancellation regions
- Preserved source identity in overlapping fields
- Readable five-emitter scenes
- Bounded motion and no unreadable visual blowups
