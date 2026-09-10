# AI Usage

AI tooling (Claude) was used throughout this project's development —
for planning, code generation, and documentation drafting — under
explicit, phase-by-phase constraints set by the developer (Dan). This
document records real decisions from that process: what was proposed,
what was actually built, and why. Nothing below is invented after the
fact; every AI-assisted output was reviewed, tested, and in some cases
rejected or reworked before being accepted.

---

### Decision 1: Evaluation architecture — deterministic rules vs. live LLM grading

**What was being designed:** How submitted designs get scored.

**AI suggestion:** During planning, a rule-based checklist evaluator
was proposed as the primary MVP approach, with a live LLM-based
qualitative reviewer suggested only as an optional stretch goal layered
on top — explicitly flagged as riskier for a 2-day timeline (network
dependency, non-determinism, harder to test).

**Final decision:** A fully deterministic, rule-based evaluator
(`evaluationService.js`), with no live LLM grading at all — the
optional stretch layer was never built.

**Reason:** Determinism and testability mattered more than the
richer-but-fuzzier feedback an LLM grader might give. A rule-based
evaluator can be unit-tested exhaustively (see the 8 tests in
`evaluationService.test.js`), never depends on network availability or
an API key, and every score is explainable in an interview by pointing
at the exact rule that produced it. This was a requirement set by the
developer for every phase, not just a preference — later phases
explicitly re-stated "do not implement live AI/LLM grading."

---

### Decision 2: Extensibility scoring — keywords vs. structural evidence

**What was being designed:** How the Extensibility category (15 of
100 points) gets scored.

**AI suggestion:** An early draft of the scoring approach leaned on
checking whether the learner's explanation mentioned relevant terms
(e.g. "strategy", "interface", "abstract") from each problem's
`extensibilitySignals` list.

**Final decision:** Extensibility is split into three sub-signals —
structural evidence in the submitted design (primarily an actual
Inheritance relationship, worth up to 7 of the 15 points), whether the
explanation's language is *corroborated* by that structure (full
credit only when both agree; a keyword with no supporting structure
gets just 1 point), and general depth of reasoning independent of any
specific keyword.

**Reason:** The developer explicitly rejected keyword-only scoring —
"do not give full points merely because the explanation contains words
like 'strategy', 'interface', or 'extensible'" — because it's trivial
to game and doesn't actually measure whether the design is
extensible. Requiring structural corroboration makes the score reflect
the design, not just the vocabulary used to describe it.

---

### Decision 3: localStorage data model — one key vs. one key per problem

**What was being designed:** How attempts persist in `localStorage`.

**AI suggestion:** A per-problem key scheme (e.g. `lld_attempts_
parking-lot`) was one option considered early on, since it makes
"get all attempts for this problem" a single direct read with no
filtering step.

**Final decision:** A single `lld_attempts` key holding one JSON array
of all attempts across all problems, filtered by `problemId` at read
time in `storageService.getAttemptsByProblemId()`.

**Reason:** A single key is simpler to reason about and matches the
explicit requirement ("Use ONE localStorage key only"). It also avoids
a class of bugs the per-key scheme invites — forgetting to create a
new key for a 5th problem, or migrating data if a problem's id ever
changed — at the cost of one `.filter()` call per read, which is
negligible at MVP scale.

---

### Decision 4: When to extract shared result-display components

**What was being designed:** How `EvaluationResultPage` (Phase 4) and
the later `AttemptDetailPage` (Phase 5) share their score/feedback/
submitted-design display.

**AI suggestion:** During Phase 4, the read-only "submitted design"
block was kept as a page-local component inside
`EvaluationResultPage.jsx` rather than a shared component, since it
had exactly one consumer — pulling it into `src/components/` at that
point would have been abstraction with no second user to justify it.

**Final decision:** In Phase 5, once `AttemptDetailPage` needed the
identical display, `SubmittedDesign`, `FeedbackListSection`, and
`CategoryScoreGrid` were extracted into `src/components/` and both
pages were refactored to import them.

**Reason:** Extracting a shared component pays off once there are two
real consumers, not in anticipation of one. Building it shared from
the start in Phase 4 would have been guessing at an API before a
second use case existed to validate it; extracting once Phase 5
actually needed it kept both the Phase 4 and Phase 5 code honest about
what it needed at the time.

---

### Decision 5: Testing strategy for localStorage-dependent code

**What was being designed:** How to unit-test `storageService.js`
and, later, the history/detail pages that depend on it.

**AI suggestion:** Two options were on the table for giving Vitest a
`localStorage` to test against: install `jsdom` as a dependency and
configure it as the test environment, or write a small in-memory
`localStorage` stand-in by hand.

**Final decision:** Phase 4 used a ~15-line hand-written
`FakeLocalStorage` class (get/set/remove/clear backed by a plain
object) for `storageService.test.js`, with no `jsdom` dependency at
all. `jsdom` and `@testing-library/react` were only added in Phase 5,
and only for the two page-level tests that genuinely need to render
and query real DOM output (`AttemptHistoryPage.test.jsx`,
`AttemptDetailPage.test.jsx`) — applied per-file via a
`// @vitest-environment jsdom` comment, not project-wide.

**Reason:** `storageService.js` only ever calls `getItem`/`setItem`/
`removeItem`/`clear` — a full jsdom browser environment would have
been a large dependency to satisfy a tiny interface. Keeping the
service-layer tests on Vitest's default Node environment keeps them
fast, and scoping jsdom to only the files that render components means
the rest of the suite doesn't pay that cost.
