# Reference Scenarios: Full Maxwell Pathway

## 1) Purpose

Define the baseline scenario set used to compare strategy options and validate milestone readiness with consistent evidence.

## 2) Baseline Scenario Set

| Scenario ID | Class | Purpose | Complexity Tier | Required Outputs |
|---|---|---|---|---|
| RS-001 | Canonical propagation | Baseline field-behavior consistency | Low | Correctness evidence, visualization integrity checks |
| RS-002 | Multi-boundary interaction | Assess boundary condition handling | Medium | Correctness + performance metrics |
| RS-003 | Resonance-sensitive case | Evaluate sensitivity and numerical stability | High | Correctness thresholds + risk notes |
| RS-004 | Comparative workflow scenario | Evaluate analyst workflow continuity | Medium | Usability/accessibility observations |
| RS-005 | Stress/scaling scenario | Evaluate throughput envelope and repeatability | High | Scalability and turnaround evidence |

## 3) Coverage Thresholds

- Minimum 90% scenario coverage (SC-003) before pre-implementation readiness.
- Every phase must show evidence for:
  - At least one correctness-focused scenario
  - At least one performance/scalability-focused scenario
  - At least one usability/accessibility-focused scenario
  - Visualization quality consistency checks

Linked milestone checks:
- milestones.md §2 (correctness acceptance)
- milestones.md §4 (usability/accessibility criteria)
- milestones.md §6 (visualization quality gates)
- milestones.md §7 (evidence-pack readiness)

## 4) Baseline Comparison Rules

1. Use the same scenario definitions across compared options.
2. Record any scenario exclusions with explicit rationale.
3. Treat missing evidence as non-pass for milestone decisions.
