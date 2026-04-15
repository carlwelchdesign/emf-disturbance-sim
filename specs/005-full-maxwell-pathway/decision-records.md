# Decision Records: Full Maxwell Pathway

## 1) Decision Record Template

| Field | Description |
|---|---|
| Decision ID | Unique record identifier |
| Date | Decision date |
| Phase | Related pathway phase |
| Decision Type | Continue / Pivot / Stop |
| Options Considered | Build/integrate options evaluated |
| Evidence Summary | Key scoring and milestone evidence |
| Assumptions | Assumptions used and status |
| Risks & Mitigations | Critical risks and mitigations |
| Outcome | Approved / Deferred / Rejected |
| Re-evaluation Triggers | Conditions requiring revisit |
| Owners | Accountable roles |

## 2) Governance and Re-evaluation Policy

Decisions MUST be re-opened when any of the following occurs:

1. A viability gate fails after provisional approval.
2. A critical assumption becomes invalid.
3. New evidence changes weighted outcomes by >= 0.5.
4. A critical decision gap remains open at checkpoint close.
5. Accessibility, visualization quality, or correctness gates regress.

Re-evaluation workflow:

1. Log trigger and impacted decision IDs.
2. Re-score impacted options using current criteria.
3. Publish delta rationale and risk changes.
4. Run governance review and issue updated continue/pivot/stop outcome.

## 3) DR-001: Initial Roadmap Traceability Proof

| Field | Value |
|---|---|
| Decision ID | DR-001 |
| Date | 2026-04-15 |
| Phase | Phase A -> Phase B transition |
| Decision Type | Continue |
| Options Considered | Pathway-only framing vs. immediate strategy narrowing |
| Evidence Summary | Pathway boundaries, assumptions, checkpoints, and traceability matrix completed |
| Assumptions | A-001..A-003 documented with invalidation actions |
| Risks & Mitigations | Scope ambiguity mitigated by explicit in/out boundaries |
| Outcome | Approved to proceed into strategy evaluation |
| Re-evaluation Triggers | Any scope-boundary conflict or unresolved critical gap |
| Owners | Product lead, technical evaluator, program governance owner |

## 4) DR-002: Side-by-Side Build vs Integrate Comparison

| Field | Value |
|---|---|
| Decision ID | DR-002 |
| Date | 2026-04-15 |
| Phase | Phase B |
| Decision Type | Pivot (provisional) |
| Options Considered | Build-B1 vs Integrate-I1 |
| Evidence Summary | Weighted scores 3.20 (Build-B1) vs 3.45 (Integrate-I1); integrator leads early confidence, build leads reversibility |
| Assumptions | Licensing and deployment fit not yet fully validated |
| Risks & Mitigations | Integrate lock-in risk; mitigation via fallback and exit criteria |
| Outcome | Provisional integrate-leaning direction pending viability closure |
| Re-evaluation Triggers | Licensing/data/deployment gate failure; evidence delta >=0.5 |
| Owners | Technical evaluator, architecture representative, governance owner |
