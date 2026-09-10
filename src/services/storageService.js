// Persistence layer for practice attempts. Everything lives under one
// localStorage key — no per-problem keys — as an array of Attempt
// objects (see DesignWorkspacePage for the exact shape written).
//
// Every read goes through readAllAttempts(), which is the only place
// that touches localStorage.getItem/JSON.parse. If localStorage is
// unavailable, empty, holding invalid JSON, or holding something that
// isn't an array of attempt-shaped objects, it returns [] instead of
// throwing — callers never need to guard against a bad read.

const STORAGE_KEY = 'lld_attempts'

function hasLocalStorage() {
  return typeof localStorage !== 'undefined' && localStorage !== null
}

function isAttemptShaped(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    entry.id.length > 0 &&
    typeof entry.problemId === 'string' &&
    entry.problemId.length > 0
  )
}

function readAllAttempts() {
  if (!hasLocalStorage()) return []

  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // Some environments (private browsing, storage disabled) throw on
    // access rather than returning null.
    return []
  }

  if (!raw) return []

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) return []

  return parsed.filter(isAttemptShaped)
}

function writeAllAttempts(attempts) {
  if (!hasLocalStorage()) return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
  } catch {
    // Storage full, disabled, or otherwise unwritable — the submit
    // flow shouldn't crash because history couldn't be saved.
  }
}

export function getAttempts() {
  return readAllAttempts()
}

export function getAttemptById(attemptId) {
  if (!attemptId) return null
  return readAllAttempts().find((attempt) => attempt.id === attemptId) || null
}

export function getAttemptsByProblemId(problemId) {
  if (!problemId) return []
  return readAllAttempts().filter((attempt) => attempt.problemId === problemId)
}

// Appends — never overwrites existing attempts, including ones for the
// same problem.
export function saveAttempt(attempt) {
  const attempts = readAllAttempts()
  writeAllAttempts([...attempts, attempt])
  return attempt
}
