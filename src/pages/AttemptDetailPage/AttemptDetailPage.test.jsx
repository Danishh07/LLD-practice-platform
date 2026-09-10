// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AttemptDetailPage from './AttemptDetailPage.jsx'
import { saveAttempt } from '../../services/storageService.js'
import { evaluateDesign } from '../../services/evaluationService.js'
import { getProblemById } from '../../data/problems.js'

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

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/problems/:problemId/history/:attemptId" element={<AttemptDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AttemptDetailPage', () => {
  it('loads and displays a valid attempt', () => {
    const problem = getProblemById('parking-lot')
    const submission = {
      classes: [{ id: 'pl', name: 'ParkingLot', responsibilities: ['Own levels'], fields: [], methods: [] }],
      relationships: [],
      designExplanation: 'A short explanation.',
    }
    const attempt = {
      id: 'attempt-1',
      problemId: 'parking-lot',
      createdAt: new Date().toISOString(),
      ...submission,
      evaluation: evaluateDesign(problem, submission),
    }
    saveAttempt(attempt)

    renderAt('/problems/parking-lot/history/attempt-1')

    expect(screen.getByText('Parking Lot System')).toBeTruthy()
    expect(screen.getByText('ParkingLot')).toBeTruthy()
  })

  it('shows the historical evaluation exactly as stored, not recalculated', () => {
    const problem = getProblemById('parking-lot')
    const submission = {
      classes: [{ id: 'pl', name: 'ParkingLot', responsibilities: [], fields: [], methods: [] }],
      relationships: [],
      designExplanation: '',
    }
    // A fresh evaluateDesign() call on this thin submission would score
    // nowhere near 63 — the stored value is deliberately overwritten
    // after the fact so this test proves the page reads the stored
    // number rather than recomputing it.
    const evaluation = evaluateDesign(problem, submission)
    evaluation.score = 63

    const attempt = {
      id: 'attempt-2',
      problemId: 'parking-lot',
      createdAt: new Date().toISOString(),
      ...submission,
      evaluation,
    }
    saveAttempt(attempt)

    renderAt('/problems/parking-lot/history/attempt-2')

    expect(screen.getByText('63')).toBeTruthy()
  })

  it('shows the not-found state for an unknown attempt id', () => {
    renderAt('/problems/parking-lot/history/does-not-exist')

    expect(screen.getByText('Page not found')).toBeTruthy()
  })

  it('shows the not-found state when the attempt belongs to a different problem', () => {
    const elevator = getProblemById('elevator-system')
    const submission = { classes: [], relationships: [], designExplanation: '' }
    const attempt = {
      id: 'attempt-3',
      problemId: 'elevator-system',
      createdAt: new Date().toISOString(),
      ...submission,
      evaluation: evaluateDesign(elevator, submission),
    }
    saveAttempt(attempt)

    // Same attempt id, but requested under the wrong problem in the URL.
    renderAt('/problems/parking-lot/history/attempt-3')

    expect(screen.getByText('Page not found')).toBeTruthy()
  })
})
