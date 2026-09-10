# hooks/

Empty by design. Early planning considered a `useAttempts.js` wrapper
around `storageService`, but every page that needs attempts
(DesignWorkspacePage, AttemptHistoryPage, AttemptDetailPage,
ProblemDetailPage) just calls `storageService` directly — a one-line
call didn't justify a custom hook, and later phases explicitly called
for avoiding unnecessary abstractions. Kept as a folder in case a
genuine cross-page stateful concern shows up later.
