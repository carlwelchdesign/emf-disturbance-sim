# Evaluation Framework: Full Maxwell Strategy Selection

## 1) Purpose

Provide objective, repeatable, side-by-side comparison of build and integrate strategies using common scoring, weights, and viability gates.

## 2) Scoring Scale and Weighting Model

### Scoring Scale (1-5)

- 1 = materially insufficient fit
- 2 = weak fit with major gaps
- 3 = acceptable baseline fit
- 4 = strong fit with manageable risks
- 5 = excellent fit with high confidence

### Weighted Criteria

| Criterion | Weight | Evidence Required |
|---|---:|---|
| Correctness Confidence | 0.25 | Scenario threshold evidence and validation approach |
| Performance/Scalability Fit | 0.20 | Turnaround and scaling envelope evidence |
| Workflow Usability/Accessibility | 0.15 | Workflow impact and A11Y readiness evidence |
| Maintainability/Operational Fit | 0.15 | Ownership model, supportability, integration burden |
| Delivery Risk and Reversibility | 0.15 | Lock-in exposure, rollback feasibility, mitigations |
| Cost/Timeline Exposure | 0.10 | Relative effort, cycle risk, procurement exposure |

Weighted score formula: `sum(score_i * weight_i)`

## 3) Method-Family Coverage

The evaluation scope acknowledges and compares:

- FDTD
- FEM/FEA
- DGTD
- Pseudo-spectral
- BIE

If any family is excluded for a specific cycle, exclusion rationale and impact must be recorded in the decision record.

## 4) Build-vs-Integrate Comparison Template

| Field | Build Path | Integrate Path |
|---|---|---|
| Strategy Summary |  |  |
| Method Family |  |  |
| Correctness Confidence (1-5) |  |  |
| Performance/Scalability Fit (1-5) |  |  |
| Usability/Accessibility Fit (1-5) |  |  |
| Maintainability/Operational Fit (1-5) |  |  |
| Delivery Risk/Reversibility (1-5) |  |  |
| Cost/Timeline Exposure (1-5) |  |  |
| Weighted Total |  |  |
| Key Risks |  |  |
| Required Mitigations |  |  |
| Viability Gate Outcome |  |  |

## 5) Candidate Option Entries

### Build Candidates

1. Build-B1: Internal phased solver capability path (technology-agnostic)
2. Build-B2: Internal core with phased method expansion path (technology-agnostic)

### Integrate Candidates (Commercial + Open)

1. Integrate-I1 (Commercial): Ansys HFSS/Maxwell candidate path
2. Integrate-I2 (Commercial): Siemens Simcenter candidate path
3. Integrate-I3 (Commercial/Open mixed landscape): Cgmx/peer ecosystem candidate path
4. Integrate-I4 (Open): OpenSEMBA/DGTD candidate path
5. Integrate-I5 (Open): TDMS or comparable open alternative path

## 6) Viability Gates (Must Pass)

| Gate | Pass Condition | Failure Action |
|---|---|---|
| Licensing | Legal/commercial terms compatible with target operating model | Mark option non-viable and document fallback |
| Data Handling | Data residency, retention, and confidentiality constraints satisfied | Mark option non-viable pending controls |
| Deployment Fit | Environment and workflow fit demonstrated at functional level | Pivot strategy or define compensating controls |
| Accessibility Impact | Keyboard/assistive workflow operability remains feasible | Reject or defer until mitigations pass |

## 7) Side-by-Side Scored Example (One Build + One Integrate)

| Criterion | Weight | Build-B1 Score | Integrate-I1 Score |
|---|---:|---:|---:|
| Correctness Confidence | 0.25 | 3 | 4 |
| Performance/Scalability Fit | 0.20 | 3 | 4 |
| Workflow Usability/Accessibility | 0.15 | 4 | 3 |
| Maintainability/Operational Fit | 0.15 | 3 | 3 |
| Delivery Risk and Reversibility | 0.15 | 4 | 2 |
| Cost/Timeline Exposure | 0.10 | 2 | 4 |
| **Weighted Total** | 1.00 | **3.20** | **3.45** |

Initial decision note: Integrate-I1 leads on early correctness/performance confidence; Build-B1 leads on reversibility and long-term control. Decision deferred pending viability-gate evidence finalization.
