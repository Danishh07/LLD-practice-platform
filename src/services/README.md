# services/

Plain JS modules, not components — no JSX in this folder.

- `evaluationService.js` (Phase 3) — deterministic rule-based scoring.
  Exports `evaluateDesign(problem, submission)`.
- `storageService.js` (Phase 4) — localStorage persistence for
  attempts, under the single `lld_attempts` key. Exports
  `getAttempts()`, `getAttemptById(id)`, `getAttemptsByProblemId(id)`,
  `saveAttempt(attempt)`.

Both are pure/side-effect-isolated and unit-tested in their matching
`*.test.js` file.
