// Returns a new array sorted newest-first by createdAt. Never mutates
// the input — storageService's returned array (and therefore what's in
// localStorage) is left untouched; this only affects display order.
export function sortAttemptsNewestFirst(attempts) {
  return [...attempts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
