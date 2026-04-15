# Full Maxwell Pathway

## 1) Purpose and User Value

The pathway defines how the current EMF visualizer can evolve to full-wave Maxwell capability so teams can make high-confidence go/pivot/stop investment decisions.

### Value not achievable with quasi-static simplifications

- Time-domain propagation, resonance, and wave-interference behavior in complex geometries
- Broad-frequency behavior and boundary-driven effects needed for advanced design decisions
- Higher-confidence scenario comparisons where field dynamics materially affect outcome quality

## 2) Scope Boundaries

### In Scope

- Phased transition roadmap with measurable entry/exit criteria
- Method-family and strategy evaluation framework
- Decision governance, risk taxonomy, and re-evaluation triggers
- Milestone gates for correctness, performance, usability/accessibility, maintainability, and visualization quality

### Out of Scope

- Production implementation architecture, APIs, and code delivery
- Final vendor selection or procurement execution
- Immediate replacement of the existing EMF visualizer baseline

## 3) Phase Model (Entry/Exit, Inputs/Outputs, Assumptions)

| Phase | Entry Conditions | Required Inputs | Required Outputs | Exit Conditions |
|---|---|---|---|---|
| Phase A: Baseline Framing | Current-state baseline accepted | Existing EMF capabilities, stakeholder goals | Confirmed boundaries and assumptions log | Scope and assumptions approved |
| Phase B: Strategy Evaluation | Phase A complete | Method-family criteria, candidate options, reference scenarios | Scored build-vs-integrate comparison and viability gates | Preferred strategy direction with rationale |
| Phase C: Milestone Validation Design | Phase B complete | Preferred strategy direction, risk taxonomy | Measurable phase-level acceptance gates and evidence-pack definition | Go/no-go policy and evidence requirements approved |
| Phase D: Pre-Implementation Readiness | Phase C complete | Coverage matrices, readiness checklist | Final decision package with traceability index | Zero critical decision gaps at review close |

### Traceable Assumptions

| Assumption ID | Assumption | Validation Method | If Invalid |
|---|---|---|---|
| A-001 | Representative scenario data is available | Scenario audit at phase entry | Keep phase open; acquire or synthesize minimum dataset set |
| A-002 | Build and integrate remain viable choices at plan time | Viability-gate check in evaluation framework | Record disqualification rationale and pivot pathway |
| A-003 | Cross-functional reviewers are available within one cycle | Review roster and invite confirmation | Escalate to governance owner; re-baseline timeline |

## 4) Checkpoints (Go / Pivot / Stop)

| Checkpoint | Trigger | Go | Pivot | Stop |
|---|---|---|---|---|
| CP-1 Scope Integrity | End of Phase A | Boundaries and value statement accepted | Clarify ambiguous boundaries | If value proposition unresolved |
| CP-2 Strategy Evidence | End of Phase B | Comparable scores with no critical gate failures | Re-weight criteria or add options | If no viable option remains |
| CP-3 Milestone Rigor | End of Phase C | All gates measurable with owners | Revise thresholds and mitigations | If gates cannot support decision confidence |
| CP-4 Readiness Review | End of Phase D | Evidence-pack complete and traceable | Address listed readiness gaps | If critical gaps remain unresolved |

## 5) Risk Categories and Mitigation Expectations

- Numerical reliability risk: require representative correctness thresholds and independent review
- Operational fit risk: require deployment/data-handling viability evidence before go decisions
- Maintainability risk: require ownership, onboarding, and support model thresholds
- Adoption risk: require workflow usability and accessibility evidence with role-based feedback

## 6) Requirement Traceability Matrix

| Requirement | Covered In |
|---|---|
| FR-001 | §1 Purpose and User Value |
| FR-002 | §2 Scope Boundaries |
| FR-003 | §3 Phase Model |
| FR-004 | evaluation-framework.md §3 Method-Family Coverage |
| FR-005 | evaluation-framework.md §4 Build-vs-Integrate Comparison |
| FR-006 | evaluation-framework.md §5 Candidate Options + §6 Viability Gates |
| FR-007 | milestones.md §2 Correctness Gates |
| FR-008 | milestones.md §4 Usability & Accessibility |
| FR-009 | §4 Checkpoints; milestones.md §7 Approval Readiness |
| FR-010 | §5 Risk Categories; milestones.md §5 Maintainability & Adoption |
| FR-011 | reference-scenarios.md §2 Baseline Set |
| FR-012 | §3 Inputs/Outputs |
| FR-013 | §3 Traceable Assumptions |
| FR-014 | decision-records.md §2 Governance and Re-evaluation |
| VQ-001 | milestones.md §6 Visualization Quality Gates |
| VQ-002 | milestones.md §6 Visualization Quality Gates |
| PF-001 | milestones.md §3 Performance Turnaround Targets |
| PF-002 | milestones.md §3 Scalability Envelopes |
| A11Y-001 | milestones.md §4 Usability & Accessibility |

## 7) Cross-Document Index and Review Navigation

- Pathway foundation and phased roadmap: `pathway.md`
- Strategy scoring and options: `evaluation-framework.md`
- Governance decisions and re-evaluation log: `decision-records.md`
- Scenario baselines and coverage thresholds: `reference-scenarios.md`
- Milestone gates and evidence-pack readiness: `milestones.md`
- Acceptance scenario source and context: `spec.md`
- Requirement and success-criteria checks: `checklists/requirements.md`

## 8) Terminology

- **Go**: continue to next phase with current direction.
- **Pivot**: continue with a modified strategy, criteria, or scope.
- **Stop**: halt current path pending material rework or new evidence.
- **Critical Decision Gap**: unresolved blocker in scope, evidence, risk ownership, or feasibility.
- **Evidence Pack**: required artifact bundle used for checkpoint decisions.
