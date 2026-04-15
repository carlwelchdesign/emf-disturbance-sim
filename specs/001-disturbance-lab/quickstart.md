# Quickstart: EMF Disturbance and Interference Lab

## Setup

```bash
npm install
```

## Run the lab

```bash
make dev
```

## Validate changes

```bash
make type-check
make lint
make test
make build
```

## Expected behavior

- The lab opens as a single-page interactive EMF visualization.
- Each source emits subtle dot-like particles with glow and local drift.
- Source overlap should change brightness, density, and phase feel.
- Disturbance presets should visibly modulate the particle field without turning it into ray lines.
- Measurement points and near/far labels should remain available for analysis.
