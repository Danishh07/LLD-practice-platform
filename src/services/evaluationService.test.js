import { describe, it, expect } from 'vitest'
import { evaluateDesign } from './evaluationService.js'
import { getProblemById } from '../data/problems.js'

const parkingLot = getProblemById('parking-lot')
const vendingMachine = getProblemById('vending-machine')

function makeClass(id, name, overrides = {}) {
  return {
    id,
    name,
    responsibilities: [],
    fields: [],
    methods: [],
    ...overrides,
  }
}

function makeRelationship(fromClassId, toClassId, type, description = '') {
  return { fromClassId, toClassId, type, description }
}

function sumCategoryScores(result) {
  return Object.values(result.categoryScores).reduce((sum, category) => sum + category.score, 0)
}

// A deliberately strong, complete Parking Lot submission — used by
// several tests as the "good" baseline to compare against.
function strongParkingLotSubmission() {
  const classes = [
    makeClass('pl', 'ParkingLot', {
      responsibilities: ['Own all levels', 'Track overall capacity'],
      fields: ['id'],
      methods: ['findAvailableSpot()'],
    }),
    makeClass('lvl', 'Level', {
      responsibilities: ['Group spots by level', 'Track level capacity'],
      fields: ['levelNumber'],
      methods: ['hasAvailableSpot()'],
    }),
    makeClass('spot', 'ParkingSpot', {
      responsibilities: ['Track occupancy', 'Assign vehicle', 'Release vehicle'],
      fields: ['spotId', 'isOccupied'],
      methods: ['assignVehicle()', 'releaseVehicle()'],
    }),
    makeClass('vehicle', 'Vehicle', {
      responsibilities: ['Represent a parked vehicle'],
      fields: ['licensePlate'],
      methods: [],
    }),
    makeClass('car', 'Car', {
      responsibilities: ['Represent a car-specific vehicle'],
      fields: [],
      methods: [],
    }),
    makeClass('ticket', 'Ticket', {
      responsibilities: ['Record entry time', 'Link vehicle to spot'],
      fields: ['ticketId', 'entryTime'],
      methods: ['calculateDuration()'],
    }),
    makeClass('payment', 'Payment', {
      responsibilities: ['Calculate fee', 'Process payment'],
      fields: ['amount'],
      methods: ['calculateFee()'],
    }),
  ]

  const relationships = [
    makeRelationship('pl', 'lvl', 'Composition'),
    makeRelationship('lvl', 'spot', 'Composition'),
    makeRelationship('vehicle', 'car', 'Inheritance'),
    makeRelationship('ticket', 'vehicle', 'Association'),
  ]

  const designExplanation =
    'I modeled Vehicle as a base class with Car as a subtype because different vehicle types need ' +
    'different spot assignment rules. ParkingLot owns Level instances, and each Level owns its ' +
    'ParkingSpots, which keeps spot lookup localized instead of scanning the entire garage. Ticket ' +
    'links a Vehicle to its entry time so Payment can calculate the fee later. I used a pricing ' +
    'strategy so the fee calculation can be swapped out without changing Payment itself, and the ' +
    'trade-off is a little more indirection for a simple MVP.'

  return { classes, relationships, designExplanation }
}

describe('evaluateDesign', () => {
  it('gives a strong, complete Parking Lot submission a high score', () => {
    const result = evaluateDesign(parkingLot, strongParkingLotSubmission())

    expect(result.score).toBeGreaterThanOrEqual(90)
    expect(result.categoryScores.coreEntities.score).toBe(25)
    expect(result.categoryScores.relationships.score).toBe(20)
  })

  it('reduces the Core Entities score when expected core classes are missing', () => {
    const submission = {
      classes: [makeClass('a', 'Foo', { responsibilities: ['Do something'] }), makeClass('b', 'Bar')],
      relationships: [],
      designExplanation: '',
    }

    const result = evaluateDesign(parkingLot, submission)

    expect(result.categoryScores.coreEntities.score).toBe(0)
    expect(result.categoryScores.coreEntities.score).toBeLessThan(
      evaluateDesign(parkingLot, strongParkingLotSubmission()).categoryScores.coreEntities.score
    )
  })

  it('scores a correct relationship type higher than an incorrect one between the same classes', () => {
    const classes = [makeClass('pl', 'ParkingLot'), makeClass('lvl', 'Level')]

    const correct = evaluateDesign(parkingLot, {
      classes,
      relationships: [makeRelationship('pl', 'lvl', 'Composition')],
      designExplanation: '',
    })

    const incorrect = evaluateDesign(parkingLot, {
      classes,
      relationships: [makeRelationship('pl', 'lvl', 'Association')],
      designExplanation: '',
    })

    expect(correct.categoryScores.relationships.score).toBeGreaterThan(
      incorrect.categoryScores.relationships.score
    )
  })

  it('detects classes with empty responsibilities', () => {
    const submission = {
      classes: [
        makeClass('pl', 'ParkingLot', { responsibilities: [] }),
        makeClass('lvl', 'Level', { responsibilities: ['Track spots'] }),
      ],
      relationships: [],
      designExplanation: '',
    }

    const result = evaluateDesign(parkingLot, submission)

    expect(result.categoryScores.responsibilities.score).toBeLessThan(20)
    expect(
      result.categoryScores.responsibilities.missed.some((line) => line.includes('ParkingLot'))
    ).toBe(true)
  })

  it('does not award full extensibility credit from keywords with no supporting design', () => {
    const submission = {
      classes: [makeClass('vm', 'VendingMachine', { responsibilities: ['Coordinate a transaction'] })],
      relationships: [],
      designExplanation:
        'I used a strategy pattern and made the payment interface abstract so the design is extensible.',
    }

    const result = evaluateDesign(vendingMachine, submission)

    // Contains 3+ of vendingMachine's extensibility signal words, but
    // there is only one class and zero relationships behind them.
    expect(result.categoryScores.extensibility.score).toBeLessThanOrEqual(5)
    expect(result.categoryScores.extensibility.score).toBeLessThan(
      result.categoryScores.extensibility.max
    )
  })

  it('gives a meaningful explanation a higher Design Explanation score than a filler one', () => {
    const classes = strongParkingLotSubmission().classes

    const short = evaluateDesign(parkingLot, {
      classes,
      relationships: [],
      designExplanation: 'It works.',
    })

    const thorough = evaluateDesign(parkingLot, {
      classes,
      relationships: [],
      designExplanation:
        'I separated Vehicle from ParkingSpot because a spot should not need to know vehicle-specific ' +
        'behavior. Instead of a single monolithic class, responsibilities are split across ParkingLot, ' +
        'Level, and ParkingSpot. The trade-off is a few more classes to navigate, but each one stays ' +
        'focused and easy to test on its own.',
    })

    expect(thorough.categoryScores.designExplanation.score).toBeGreaterThan(
      short.categoryScores.designExplanation.score
    )
  })

  it('never throws on empty or malformed submissions', () => {
    expect(() => evaluateDesign(parkingLot, {})).not.toThrow()
    expect(() => evaluateDesign(parkingLot, null)).not.toThrow()
    expect(() => evaluateDesign(parkingLot, undefined)).not.toThrow()
    expect(() => evaluateDesign(null, {})).not.toThrow()
    expect(() => evaluateDesign({}, {})).not.toThrow()

    const malformed = evaluateDesign(parkingLot, {
      classes: 'not-an-array',
      relationships: 42,
      designExplanation: { not: 'a string' },
    })
    expect(malformed.score).toBeGreaterThanOrEqual(0)
    expect(malformed.score).toBeLessThanOrEqual(100)
    expect(malformed.categoryScores.coreEntities).toBeDefined()

    // Duplicate names, an empty name, and a relationship pointing at a
    // class id that doesn't exist in the submission.
    const messy = evaluateDesign(parkingLot, {
      classes: [
        makeClass('pl', 'ParkingLot'),
        makeClass('pl2', 'ParkingLot'),
        makeClass('empty', ''),
      ],
      relationships: [makeRelationship('ghost-a', 'ghost-b', 'Association')],
      designExplanation: '',
    })
    expect(messy.score).toBeGreaterThanOrEqual(0)
    expect(
      messy.categoryScores.relationships.feedback.some((line) => line.includes('ignored'))
    ).toBe(true)
  })

  it('always returns a total equal to the sum of category scores, within 0-100', () => {
    const fixtures = [
      evaluateDesign(parkingLot, strongParkingLotSubmission()),
      evaluateDesign(parkingLot, { classes: [], relationships: [], designExplanation: '' }),
      evaluateDesign(parkingLot, {
        classes: [makeClass('a', 'Foo')],
        relationships: [],
        designExplanation: 'A short note.',
      }),
      evaluateDesign(vendingMachine, {
        classes: [makeClass('vm', 'VendingMachine', { responsibilities: ['Do things'] })],
        relationships: [],
        designExplanation: '',
      }),
    ]

    fixtures.forEach((result) => {
      expect(result.score).toBe(sumCategoryScores(result))
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })
  })
})
