// Configuration-driven problem catalog.
//
// Adding a 5th problem later means adding one more object to this array —
// no UI component in Phase 2 (ProblemListPage, ProblemDetailPage,
// DesignWorkspacePage) hardcodes anything about a specific problem.
//
// `evaluationCriteria` is not used by anything yet — it's the "answer
// key" shape that Phase 3's rule-based evaluationService.js will read.
// It's defined now, alongside the problem it describes, so the two never
// drift apart.

const problems = [
  {
    id: 'parking-lot',
    title: 'Parking Lot System',
    difficulty: 'Medium',
    shortDescription:
      'Design a multi-level parking lot that assigns spots, issues tickets, and charges on exit.',
    statement:
      'Design a parking lot system for a multi-level garage. The system should track available parking spots across levels, assign a spot to an incoming vehicle based on vehicle type, issue a ticket on entry, and calculate a fee on exit based on how long the vehicle stayed.',
    functionalRequirements: [
      'Support multiple vehicle types (motorcycle, car, bus/truck)',
      'Track which spots are free or occupied across multiple levels',
      'Assign a suitable free spot to an entering vehicle',
      'Issue a parking ticket on entry with an entry time',
      'Calculate a fee on exit based on duration and vehicle type',
      'Reject entry when the lot has no suitable free spot',
    ],
    nonFunctionalRequirements: [
      'Should be easy to add a new vehicle type or spot size later',
      'Should be easy to plug in a different pricing scheme',
      'Spot assignment should stay efficient as the number of spots grows',
    ],
    evaluationCriteria: {
      expectedCoreClasses: ['ParkingLot', 'Level', 'ParkingSpot', 'Vehicle', 'Ticket', 'Payment'],
      expectedRelationshipPatterns: [
        { type: 'Composition', between: ['ParkingLot', 'Level'] },
        { type: 'Composition', between: ['Level', 'ParkingSpot'] },
        { type: 'Inheritance', between: ['Vehicle', 'Car / Motorcycle / Bus'] },
        { type: 'Association', between: ['Ticket', 'Vehicle'] },
      ],
      extensibilitySignals: ['strategy', 'interface', 'abstract', 'polymorphism', 'pricing'],
      minClassesExpected: 4,
      minResponsibilitiesPerClass: 1,
    },
  },
  {
    id: 'elevator-system',
    title: 'Elevator System',
    difficulty: 'Hard',
    shortDescription:
      'Design the control logic for a bank of elevators serving requests across multiple floors.',
    statement:
      'Design a system that controls a bank of elevators in a building. The system should accept floor requests from inside an elevator and from hallway call panels, decide which elevator should service each request, and move elevators between floors while tracking their direction and door state.',
    functionalRequirements: [
      'Support multiple elevators serving the same set of floors',
      'Accept an internal request (a passenger pressing a floor button inside the elevator)',
      'Accept an external hallway request (up/down call button on a floor)',
      'Decide which elevator should service a given request',
      "Track each elevator's current floor, direction, and door state",
      'Open and close doors when an elevator arrives at a requested floor',
    ],
    nonFunctionalRequirements: [
      "Should be easy to swap the elevator-selection strategy (e.g. nearest-car vs. least-busy)",
      'Should be easy to add more elevators or floors without redesigning core classes',
      'Should behave predictably when multiple requests arrive at once',
    ],
    evaluationCriteria: {
      expectedCoreClasses: ['Elevator', 'ElevatorController', 'Request', 'Floor', 'Door'],
      expectedRelationshipPatterns: [
        { type: 'Association', between: ['ElevatorController', 'Elevator'] },
        { type: 'Association', between: ['Elevator', 'Request'] },
        { type: 'Composition', between: ['Elevator', 'Door'] },
      ],
      extensibilitySignals: ['strategy', 'interface', 'scheduling', 'algorithm', 'abstract'],
      minClassesExpected: 4,
      minResponsibilitiesPerClass: 1,
    },
  },
  {
    id: 'vending-machine',
    title: 'Vending Machine',
    difficulty: 'Easy',
    shortDescription:
      'Design a vending machine that accepts payment, dispenses items, and returns change.',
    statement:
      'Design a vending machine that stocks multiple products, accepts coins or notes as payment, dispenses the selected product once enough money has been inserted, and returns change. The machine should also handle out-of-stock products and cancelled transactions.',
    functionalRequirements: [
      'Display available products and their prices',
      'Accept money in increments (coins/notes) toward a selected product',
      'Dispense the selected product once enough money is inserted',
      'Return change if the inserted amount exceeds the price',
      'Handle a selected product being out of stock',
      'Allow a transaction to be cancelled with money returned',
    ],
    nonFunctionalRequirements: [
      'Should be easy to add a new product or restock existing ones',
      "Should be easy to reason about the machine's behavior at each stage (idle, selecting, dispensing)",
      'Should be easy to support a new payment method later',
    ],
    evaluationCriteria: {
      expectedCoreClasses: ['VendingMachine', 'Product', 'Inventory', 'Payment', 'State'],
      expectedRelationshipPatterns: [
        { type: 'Composition', between: ['VendingMachine', 'Inventory'] },
        { type: 'Association', between: ['Inventory', 'Product'] },
        { type: 'Association', between: ['VendingMachine', 'Payment'] },
      ],
      extensibilitySignals: ['state', 'interface', 'strategy', 'abstract'],
      minClassesExpected: 3,
      minResponsibilitiesPerClass: 1,
    },
  },
  {
    id: 'library-management',
    title: 'Library Management System',
    difficulty: 'Medium',
    shortDescription:
      'Design a system for members to search, borrow, and return books, with holds and late fees.',
    statement:
      'Design a library management system where members can search the catalog, borrow available books, and return them by a due date. The system should track how many copies of a book are available, apply late fees for overdue returns, and let members place a hold on a book that is fully checked out.',
    functionalRequirements: [
      'Search the catalog by title, author, or category',
      'Track total and available copies of each book',
      'Let a member borrow an available copy with a due date',
      'Let a member return a borrowed book',
      'Charge a late fee for a book returned after its due date',
      'Let a member place a hold on a book with zero available copies',
    ],
    nonFunctionalRequirements: [
      'Should be easy to add a new item type later (e.g. DVDs, magazines) beyond books',
      'Should be easy to change the late-fee policy',
      'Catalog search should stay simple to extend with new filters',
    ],
    evaluationCriteria: {
      expectedCoreClasses: ['Library', 'Book', 'BookCopy', 'Member', 'Loan', 'Hold'],
      expectedRelationshipPatterns: [
        { type: 'Composition', between: ['Library', 'Book'] },
        { type: 'Association', between: ['Book', 'BookCopy'] },
        { type: 'Association', between: ['Loan', 'Member'] },
        { type: 'Association', between: ['Loan', 'BookCopy'] },
      ],
      extensibilitySignals: ['interface', 'abstract', 'strategy', 'policy'],
      minClassesExpected: 4,
      minResponsibilitiesPerClass: 1,
    },
  },
]

export default problems

export function getProblemById(problemId) {
  return problems.find((problem) => problem.id === problemId)
}
