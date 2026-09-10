// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AttemptHistoryPage from './AttemptHistoryPage.jsx'
import { saveAttempt } from '../../services/storageService.js'
import { evaluateDesign } from '../../services/evaluationService.js'
import { getProblemById } from '../../data/problems.js'

// Same minimal fake used by storageService.test.js — see that file for
// why a full jsdom localStorage polyfill isn't needed here either;
// this page-level test needs jsdom for rendering, but still only needs
// this much of localStorage's surface.
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

afterEach(cleanup)

function makeAttempt(problemId, createdAt) {
  const problem = getProblemById(problemId)
  const submission = { classes: [], relationships: [], designExplanation: '' }
  return {
    id: crypto.randomUUID(),
    problemId,
    createdAt,
    ...submission,
    evaluation: evaluateDesign(problem, submission),
  }
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/problems/:problemId/history" element={<AttemptHistoryPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AttemptHistoryPage', () => {
  it('only shows attempts for the current problem', () => {
    saveAttempt(makeAttempt('parking-lot', '2026-01-01T10:00:00.000Z'))
    saveAttempt(makeAttempt('elevator-system', '2026-01-02T10:00:00.000Z'))

    renderAt('/problems/parking-lot/history')

    expect(screen.getByText('1 attempt')).toBeTruthy()
  })

  it('shows the newest attempt first', () => {
    const oldest = makeAttempt('parking-lot', '2026-01-01T10:00:00.000Z')
    const newest = makeAttempt('parking-lot', '2026-03-01T10:00:00.000Z')
    const middle = makeAttempt('parking-lot', '2026-02-01T10:00:00.000Z')

    // Saved out of chronological order on purpose — the page must sort
    // for display, not rely on insertion order.
    saveAttempt(oldest)
    saveAttempt(newest)
    saveAttempt(middle)

    renderAt('/problems/parking-lot/history')

    // Each "View Attempt" link's href encodes which attempt it points
    // at, so reading hrefs in DOM order is a direct check of display
    // order without depending on any particular date format.
    const hrefs = screen.getAllByText('View Attempt').map((link) => link.getAttribute('href'))

    expect(hrefs).toEqual([
      `/problems/parking-lot/history/${newest.id}`,
      `/problems/parking-lot/history/${middle.id}`,
      `/problems/parking-lot/history/${oldest.id}`,
    ])
  })

  it('renders a useful empty state with a Start Practice link when there are no attempts', () => {
    renderAt('/problems/parking-lot/history')

    expect(screen.getByText('No attempts yet.')).toBeTruthy()
    const startLink = screen.getByText('Start Practice')
    expect(startLink.getAttribute('href')).toBe('/problems/parking-lot/attempt')
  })

  it('shows the not-found state for an unknown problem id', () => {
    renderAt('/problems/does-not-exist/history')

    expect(screen.getByText('Page not found')).toBeTruthy()
    expect(screen.queryByText('No attempts yet.')).toBeNull()
  })
})
