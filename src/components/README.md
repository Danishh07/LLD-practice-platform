# components/

Reusable, presentational pieces used by more than one page, each in its
own folder with a co-located CSS module.

- `Layout/` (Phase 1) — persistent header/nav/footer shell
- `ProblemCard/`, `ClassEditor/`, `RelationshipEditor/`,
  `DesignExplanationField/`, `SubmitBar/` (Phase 2)
- `ScoreSummary/` (Phase 4) — also exports `interpretScore(score)`,
  the single source of the Excellent/Strong/Good/Needs Improvement
  thresholds, reused by AttemptListItem
- `CategoryFeedbackCard/` (Phase 4) — one category's score + bar + feedback
- `CategoryScoreGrid/` (Phase 5) — the six-category grid; also exports
  `CATEGORY_LABELS`, reused by AttemptListItem's compact summary
- `FeedbackListSection/` (Phase 5, extracted from EvaluationResultPage) —
  titled Strengths/Missed/Suggestions list with an empty-state message
- `SubmittedDesign/` (Phase 5, extracted from EvaluationResultPage) —
  read-only classes/relationships/explanation display, shared by
  EvaluationResultPage and AttemptDetailPage
- `AttemptListItem/` (Phase 5) — one row in AttemptHistoryPage's list

`SubmittedDesign` is deliberately its own small presentational
component rather than ClassEditor/RelationshipEditor in a "read-only
mode" — those exist to be edited, and forcing no-op handlers onto them
just to reuse markup would be more complicated than this.
