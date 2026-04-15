# Sidebar Control Contract

## Purpose

Define the interaction contract for the operator sidebar so section hierarchy, selection behavior, and disclosure logic remain consistent across implementation.

## Section Contract

1. Sidebar MUST render sections in this fixed order:
   1. Simulation Setup
   2. Active Entities
   3. Selected Entity
   4. Visualization Controls
   5. Analysis / Measurements
   6. System / View
2. Each section exposes:
   - semantic header label
   - panel container boundary
   - optional expand/collapse affordance
   - deterministic keyboard focus entry point

## Selection Contract

1. Active Entities acts as the source inventory and selection surface only.
2. Selecting a source updates `SelectionContext` and hydrates Selected Entity panel.
3. No source selected:
   - Selected Entity renders non-editable instructional state.
4. Single source selected:
   - Selected Entity renders editable controls for that source.
5. Multi-source selected (if enabled):
   - Shared fields editable in bulk.
   - Mixed values shown explicitly.
   - Non-shared controls disabled with explanatory helper text.

## Visibility and Tier Contract

1. Primary controls:
   - Always visible in section default state.
   - Includes Add Source and Preset selection entry points.
2. Secondary controls:
   - Visible but visually de-emphasized relative to primary actions.
3. Tertiary/advanced controls:
   - Collapsed by default.
   - Must require explicit reveal action.

## Dual-Mode Input Contract

1. Precision parameters expose synchronized slider + numeric input.
2. Editing either input updates the same underlying value.
3. Input constraints and ranges are consistent across both modes.

## Global vs Local Mutation Contract

1. Simulation Setup, Visualization Controls, Analysis/Measurements, and System/View mutate global state only.
2. Selected Entity mutates selected source state only.
3. Cross-scope mutations are disallowed by component boundaries and action routing.

## Accessibility Contract

1. All section headers and controls are keyboard reachable.
2. Focus order follows section hierarchy.
3. Selection, expansion, disabled, and mixed-value states are visually and semantically exposed.
