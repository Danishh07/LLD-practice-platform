# AI Usage

AI tooling (primarily Claude) was used throughout the development of
this project for architecture planning, implementation assistance,
testing ideas, edge-case analysis, and documentation drafting.

AI was used as a development assistant rather than as an autonomous
builder. The project scope, architecture constraints, technology
choices, and final engineering decisions were reviewed and controlled
throughout development. AI-generated suggestions and code were tested
before being incorporated, and several suggestions were modified or
deliberately rejected.

This document records five meaningful AI-assisted decisions from the
development process.

---

## Decision 1: Evaluation Architecture — Deterministic Rules vs. Live LLM Grading

### What was being designed

The main question was how learner-submitted LLD designs should be
evaluated and how useful feedback could be generated within the
two-day MVP constraint.

### AI Suggestion

A rule-based checklist evaluator was proposed as the primary MVP
approach. A live LLM-based qualitative reviewer was also considered as
a possible future or stretch layer.

The LLM approach could provide richer semantic feedback, but it would
introduce network dependency, API-key requirements, non-deterministic
responses, additional latency, and more difficult testing.

### Final Decision

The project uses a fully deterministic, rule-based evaluator in
`src/services/evaluationService.js`.

A live LLM grading service was deliberately not implemented.

### Reason

Determinism and testability were more valuable for the core MVP than
richer but less predictable AI-generated grading.

The rule-based evaluator:

- produces repeatable scores
- has explainable scoring rules
- requires no external API
- has no API cost per submission
- works without network connectivity
- can be directly unit-tested
- allows feedback to be traced back to specific rules

An LLM-based qualitative reviewer remains a potential future extension
rather than part of the current MVP.

---

## Decision 2: Extensibility Scoring — Keywords vs. Structural Evidence

### What was being designed

The evaluator needed to determine whether a learner's design showed
evidence of extensibility.

### AI Suggestion

An early approach considered checking whether the learner's explanation
contained terms such as "strategy", "interface", "abstract", or
"extensible", based on each problem's configured
`extensibilitySignals`.

### Final Decision

Keyword presence is not sufficient for full extensibility credit.

The final evaluator combines:

1. Structural evidence in the submitted design
2. Relationships and class organization
3. Supporting explanation
4. Problem-specific evaluation signals
5. General reasoning depth

For example, an explanation containing words such as "strategy" or
"interface" without supporting classes or relationships receives only
limited credit.

### Reason

Keyword-only scoring would be easy to game and would not reliably show
that a design is actually extensible.

The final approach therefore makes structural evidence the primary
signal and uses the written explanation as supporting evidence.

This provides a better balance between simplicity and meaningful
evaluation for a two-day MVP.

---

## Decision 3: localStorage Data Model — One Key vs. One Key per Problem

### What was being designed

The application needed to persist learner attempts without a backend.

### AI Suggestion

A per-problem key scheme was considered, for example:

`lld_attempts_parking-lot`

This would allow direct retrieval of attempts for an individual
problem.

### Final Decision

The application uses a single localStorage key:

`lld_attempts`

All attempts are stored as one JSON array and filtered by
`problemId` when problem-specific history is requested.

### Reason

A single key keeps the persistence model simpler and matches the MVP
requirement to use one localStorage key.

It also makes the storage service easier to reason about and avoids
maintaining a growing collection of problem-specific keys.

At the scale of this MVP, filtering the array in memory is negligible
and keeps the implementation straightforward.

---

## Decision 4: Extracting Shared Result Components

### What was being designed

The result page and historical attempt detail page both need to display
scores, feedback, and the learner's submitted design.

### AI Suggestion

During the initial result-page implementation, the submitted-design
display was kept local to `EvaluationResultPage` because it had only
one consumer at that point.

### Final Decision

When `AttemptDetailPage` introduced a second real use case, the common
display logic was extracted into reusable components such as:

- `SubmittedDesign`
- `FeedbackListSection`
- `CategoryScoreGrid`

Both result and historical-detail pages now use these shared
components.

### Reason

The project intentionally avoids premature abstraction.

Creating shared components before a second use case existed would have
required designing a reusable API based on assumptions. Waiting until
the second consumer appeared provided a concrete reason for extraction
and resulted in simpler component interfaces.

This approach keeps the codebase small while still avoiding meaningful
duplication where reuse is actually justified.

---

## Decision 5: Testing Strategy for localStorage and React Pages

### What was being designed

The project needed tests for both the storage service and React pages
that depend on browser APIs and DOM rendering.

### AI Suggestion

Two approaches were considered for testing localStorage-dependent code:

1. Use a browser-like environment such as jsdom.
2. Create a small in-memory localStorage implementation for the service
   tests.

### Final Decision

The storage service uses a small in-memory `FakeLocalStorage` in
`storageService.test.js`.

`jsdom` and `@testing-library/react` are used only for page-level tests
that genuinely require DOM rendering:

- `AttemptHistoryPage.test.jsx`
- `AttemptDetailPage.test.jsx`

The page tests opt into jsdom using Vitest's per-file environment
directive rather than making jsdom the environment for the entire test
suite.

### Reason

The storage service only requires a small localStorage interface for
reading and writing persisted attempts. A full browser environment
would therefore be unnecessary for those service-level tests.

For actual React page tests, however, DOM rendering and querying are
valuable, so Testing Library with jsdom was introduced where it
provides real value.

This keeps the test setup relatively lightweight while still testing
the important UI behavior.

---

## AI-Assisted Development Process

AI assistance was used across multiple stages of the project, including:

- architecture planning
- component and folder structure
- implementation assistance
- evaluation-engine design
- edge-case identification
- test-case planning
- documentation drafting
- final code-quality review

The implementation was developed incrementally rather than through a
single large generation request.

The project was divided into phases, and each phase had explicit
constraints such as:

- no Tailwind CSS
- no Redux
- no backend or database
- no authentication
- no microservices
- no HLD
- no live LLM grading
- exactly four LLD problems
- deterministic evaluation
- beginner-friendly and interview-explainable code

Generated code was reviewed, tested, and manually verified before the
project was considered complete.

---

## Verification

The final implementation was verified through:

- `npm run test`
- `npm run build`
- browser-based manual testing
- responsive UI checks
- incognito-browser testing
- edge-case testing for malformed localStorage and submissions

The final test suite contains **23 passing tests across 5 test files**.

The production build also completes successfully.

---

## Summary

AI was used as a development assistant throughout the project, but the
final product reflects deliberate engineering trade-offs around scope,
simplicity, determinism, testability, and explainability.

The most significant decision was to use a deterministic rule-based
evaluator instead of making live AI grading part of the core MVP.
LLM-based qualitative feedback remains a possible future extension
rather than a dependency of the current system.