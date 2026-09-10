import { describe, it, expect } from 'vitest'
import { sortAttemptsNewestFirst } from './sortAttempts.js'

function attemptAt(id, isoDate) {
  return { id, createdAt: isoDate }
}

describe('sortAttemptsNewestFirst', () => {
  it('orders attempts from newest to oldest', () => {
    const oldest = attemptAt('a', '2026-01-01T10:00:00.000Z')
    const middle = attemptAt('b', '2026-02-01T10:00:00.000Z')
    const newest = attemptAt('c', '2026-03-01T10:00:00.000Z')

    const sorted = sortAttemptsNewestFirst([oldest, newest, middle])

    expect(sorted.map((a) => a.id)).toEqual(['c', 'b', 'a'])
  })

  it('does not mutate the input array', () => {
    const original = [attemptAt('a', '2026-01-01T10:00:00.000Z'), attemptAt('b', '2026-02-01T10:00:00.000Z')]
    const originalOrder = original.map((a) => a.id)

    sortAttemptsNewestFirst(original)

    expect(original.map((a) => a.id)).toEqual(originalOrder)
  })
})
