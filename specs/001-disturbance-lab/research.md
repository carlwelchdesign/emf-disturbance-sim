# Research: EMF Disturbance and Interference Lab

## 1. Particle language and motion cadence

- **Decision**: Use small dot-like particles with restrained halos, slower cadence, and short local drift instead of fast streaks or large volumetric spreads.
- **Rationale**: The user wants readable, futuristic motion that feels like an operational interface, not a high-speed demo. Dots make source interactions easier to read.
- **Alternatives considered**: Fast ray lines, wide particle ribbons, and full volumetric fields. Those were rejected because they obscure source-to-source behavior and read as busier than intended.

## 2. Interaction model

- **Decision**: Model source interaction as superposition plus local visual modulation: dot density, brightness, phase offset, and small drift change when sources overlap or disturbances are present.
- **Rationale**: This keeps the simulation grounded in the provided equations while remaining visually meaningful in real time.
- **Alternatives considered**: Full Maxwell/FDTD simulation and particle-fluid style animation. Those are better reserved for later phases because they add complexity without improving V1 clarity.

## 3. Spatial feel

- **Decision**: Keep the default language mostly along the propagation axis with subtle 3D jitter, not broad 4D-looking expansion.
- **Rationale**: The user explicitly wants subtlety and readable dots. A shallow 3D field keeps the visualization legible while still feeling alive.
- **Alternatives considered**: Full spatial scatter and wide 3D dispersion. Rejected because they dilute source ownership and make the scene harder to interpret.

## 4. Visual tone

- **Decision**: Use a dark, restrained HUD with controlled bloom, soft glow, and high-contrast accents.
- **Rationale**: This supports the requested Jarvis-like product tone: futuristic, precise, and polished without becoming flashy.
- **Alternatives considered**: Neon-heavy cyber styling and decorative motion. Rejected because they reduce operator trust and clarity.

## 5. Compute/render split

- **Decision**: Keep all EM math in pure helpers and keep the renderer responsible only for visual mapping.
- **Rationale**: This preserves testability, makes future compute backends possible, and aligns with the constitution.
- **Alternatives considered**: Embedding math in renderer components. Rejected because it would make behavior harder to validate and extend.
