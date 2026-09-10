import { describe, it, expect, beforeEach } from 'vitest'

// The default Vitest environment for this project is plain Node, which
// has no `localStorage` global. Rather than pulling in jsdom (a whole
// browser DOM implementation) just to get one Web Storage API, this
// is the smallest fake that satisfies it: get/set/remove/clear backed
// by a plain object. It's assigned to globalThis before each test so
// storageService's calls to the bare `localStorage` identifier resolve
// to it, exactly like they'd resolve to the browser's real one.
class FakeLocalStorage {
  constructor() {
    this.store = {}
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }
  setItem(key, value) {
    this.store[key] = String(value)
  }
  removeItem(key) {
    delete this.store[key]
  }
  clear() {
    this.store = {}
  }
}

beforeEach(() => {
  globalThis.localStorage = new FakeLocalStorage()
})

// Imported after the beforeEach is registered — the functions read
// `localStorage` at call time, not at import time, so import order
// here doesn't actually matter, but this keeps the intent obvious.
const { getAttempts, getAttemptById, getAttemptsByProblemId, saveAttempt } = await import(
  './storageService.js'
)

function makeAttempt(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    problemId: 'parking-lot',
    createdAt: new Date().toISOString(),
    classes: [],
    relationships: [],
    designExplanation: '',
    evaluation: { score: 50, categoryScores: {}, strengths: [], missedConsiderations: [], suggestions: [] },
    ...overrides,
  }
}

describe('storageService', () => {
  it('saving an attempt preserves it', () => {
    const attempt = makeAttempt()
    saveAttempt(attempt)

    const stored = getAttempts()
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe(attempt.id)
  })

  it('preserves multiple attempts rather than overwriting', () => {
    const first = makeAttempt({ problemId: 'parking-lot' })
    const second = makeAttempt({ problemId: 'parking-lot' })
    const third = makeAttempt({ problemId: 'elevator-system' })

    saveAttempt(first)
    saveAttempt(second)
    saveAttempt(third)

    const stored = getAttempts()
    expect(stored).toHaveLength(3)
    expect(stored.map((a) => a.id)).toEqual([first.id, second.id, third.id])
  })

  it('getAttemptById returns the matching attempt', () => {
    const first = makeAttempt()
    const second = makeAttempt()
    saveAttempt(first)
    saveAttempt(second)

    expect(getAttemptById(second.id)?.id).toBe(second.id)
    expect(getAttemptById('does-not-exist')).toBeNull()
  })

  it('getAttemptsByProblemId filters to only that problem', () => {
    saveAttempt(makeAttempt({ problemId: 'parking-lot' }))
    saveAttempt(makeAttempt({ problemId: 'parking-lot' }))
    saveAttempt(makeAttempt({ problemId: 'vending-machine' }))

    const parkingLotAttempts = getAttemptsByProblemId('parking-lot')
    const vendingMachineAttempts = getAttemptsByProblemId('vending-machine')

    expect(parkingLotAttempts).toHaveLength(2)
    expect(vendingMachineAttempts).toHaveLength(1)
    expect(parkingLotAttempts.every((a) => a.problemId === 'parking-lot')).toBe(true)
  })

  it('does not crash on malformed localStorage data', () => {
    localStorage.setItem('lld_attempts', 'not valid json {{{')
    expect(() => getAttempts()).not.toThrow()
    expect(getAttempts()).toEqual([])

    localStorage.setItem('lld_attempts', JSON.stringify({ not: 'an array' }))
    expect(getAttempts()).toEqual([])

    localStorage.setItem('lld_attempts', JSON.stringify([{ missing: 'id and problemId' }, null, 42]))
    expect(getAttempts()).toEqual([])

    // saveAttempt should still work afterwards — a bad prior read
    // shouldn't poison future writes.
    const attempt = makeAttempt()
    expect(() => saveAttempt(attempt)).not.toThrow()
    expect(getAttemptById(attempt.id)?.id).toBe(attempt.id)
  })
})
