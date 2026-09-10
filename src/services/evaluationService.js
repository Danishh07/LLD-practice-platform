// Deterministic, rule-based design evaluator.
//
// evaluateDesign(problem, submission) is the only export the rest of the
// app needs. Everything problem-specific comes from
// `problem.evaluationCriteria` (see data/problems.js) — this file never
// branches on a problem id or title. That's what makes it
// "configuration-driven": adding a 5th problem with its own
// evaluationCriteria needs zero changes here.
//
// The submission shape matches DesignWorkspacePage's local state:
//   { classes: [{ id, name, responsibilities, fields, methods }],
//     relationships: [{ fromClassId, toClassId, type, description }],
//     designExplanation: string }
// but nothing here assumes that shape is well-formed — see
// sanitizeSubmission below.

const WEIGHTS = {
  coreEntities: 25,
  relationships: 20,
  responsibilities: 20,
  extensibility: 15,
  designExplanation: 10,
  completeness: 10,
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function dedupe(list) {
  return Array.from(new Set(list))
}

// Case/whitespace/punctuation-insensitive comparison key. Deliberately
// NOT fuzzy (no edit-distance matching) — "ParkingSpot", "Parking Spot"
// and "parking spot" all normalize to the same key, but unrelated names
// never accidentally match.
function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

// `evaluationCriteria.expectedRelationshipPatterns` sometimes lists
// alternatives for one side of a pattern, e.g. "Car / Motorcycle / Bus"
// for a Vehicle subtype. Splitting on "/" is generic (not specific to
// any one problem) and lets a submission match any of the listed names.
function splitAlternatives(value) {
  return String(value || '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
}

// Turns raw, possibly-malformed submission data into a safe shape the
// rest of this file can rely on. Nothing below this function needs to
// re-check for missing arrays, non-string names, or dangling
// relationship references.
function sanitizeSubmission(submission) {
  const rawClasses = Array.isArray(submission?.classes) ? submission.classes : []

  const classes = rawClasses
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      id: typeof entry.id === 'string' && entry.id ? entry.id : null,
      name: typeof entry.name === 'string' ? entry.name.trim() : '',
      responsibilities: Array.isArray(entry.responsibilities)
        ? entry.responsibilities.filter((item) => typeof item === 'string' && item.trim())
        : [],
      fields: Array.isArray(entry.fields)
        ? entry.fields.filter((item) => typeof item === 'string' && item.trim())
        : [],
      methods: Array.isArray(entry.methods)
        ? entry.methods.filter((item) => typeof item === 'string' && item.trim())
        : [],
    }))

  const classIds = new Set(classes.map((c) => c.id).filter(Boolean))

  const rawRelationships = Array.isArray(submission?.relationships) ? submission.relationships : []

  const validRelationships = rawRelationships
    .filter((entry) => entry && typeof entry === 'object')
    .filter(
      (entry) =>
        classIds.has(entry.fromClassId) &&
        classIds.has(entry.toClassId) &&
        entry.fromClassId !== entry.toClassId
    )
    .map((entry) => ({
      fromClassId: entry.fromClassId,
      toClassId: entry.toClassId,
      type: typeof entry.type === 'string' ? entry.type.trim() : '',
      description: typeof entry.description === 'string' ? entry.description.trim() : '',
    }))

  const invalidRelationshipCount = rawRelationships.length - validRelationships.length

  const designExplanation =
    typeof submission?.designExplanation === 'string' ? submission.designExplanation.trim() : ''

  return { classes, relationships: validRelationships, designExplanation, invalidRelationshipCount }
}

function emptyCategory(max) {
  return { score: 0, max, feedback: [], strengths: [], missed: [], suggestions: [] }
}

// ---------------------------------------------------------------------
// Category scorers — each is independent, pure, and returns the same
// shape: { score, max, feedback, strengths, missed, suggestions }.
// ---------------------------------------------------------------------

function scoreCoreEntities(problem, classes) {
  const max = WEIGHTS.coreEntities
  const expected = problem.evaluationCriteria?.expectedCoreClasses || []

  if (expected.length === 0) {
    return { ...emptyCategory(max), score: max }
  }

  const submitted = classes
    .map((designClass) => ({ original: designClass.name, normalized: normalizeName(designClass.name) }))
    .filter((entry) => entry.normalized)

  const matched = []
  const missing = []

  expected.forEach((expectedName) => {
    const key = normalizeName(expectedName)
    const found = submitted.find((entry) => entry.normalized === key)
    if (found) {
      matched.push({ expectedName, submittedName: found.original })
    } else {
      missing.push(expectedName)
    }
  })

  const score = Math.round((matched.length / expected.length) * max)

  const feedback = [
    ...matched.map((entry) => `Core entity identified: ${entry.submittedName}`),
    ...missing.map((name) => `Consider adding: ${name}`),
  ]

  return {
    score,
    max,
    feedback,
    strengths:
      matched.length > 0
        ? [`Identified ${matched.length} of ${expected.length} expected core entities.`]
        : [],
    missed: missing.length > 0 ? [`Missing core entities: ${missing.join(', ')}.`] : [],
    suggestions: missing.length > 0 ? [`Consider adding classes for: ${missing.join(', ')}.`] : [],
  }
}

function scoreRelationships(problem, classes, relationships) {
  const max = WEIGHTS.relationships
  const expectedPatterns = problem.evaluationCriteria?.expectedRelationshipPatterns || []

  if (expectedPatterns.length === 0) {
    return { ...emptyCategory(max), score: max }
  }

  const pointsPerPattern = max / expectedPatterns.length
  let rawScore = 0
  let correctCount = 0

  const feedback = []
  const missed = []
  const suggestions = []

  expectedPatterns.forEach((pattern) => {
    const [rawSideA, rawSideB] = pattern.between
    const namesA = splitAlternatives(rawSideA).map(normalizeName)
    const namesB = splitAlternatives(rawSideB).map(normalizeName)

    const classA = classes.find((c) => namesA.includes(normalizeName(c.name)))
    const classB = classes.find((c) => namesB.includes(normalizeName(c.name)))
    const label = `${rawSideA} – ${rawSideB}`

    // Either the classes involved don't exist in the design, or no
    // relationship connects them at all.
    if (!classA || !classB) {
      missed.push(
        `Missing relationship: expected a ${pattern.type} relationship between ${label}, but one or both classes are not in the design.`
      )
      feedback.push(`Missing relationship: ${label} (${pattern.type}).`)
      return
    }

    const match = relationships.find(
      (r) =>
        (r.fromClassId === classA.id && r.toClassId === classB.id) ||
        (r.fromClassId === classB.id && r.toClassId === classA.id)
    )

    if (!match) {
      missed.push(`Missing relationship: expected a ${pattern.type} relationship between ${label}.`)
      feedback.push(`Missing relationship: ${label} (${pattern.type}).`)
      return
    }

    if (normalizeName(match.type) === normalizeName(pattern.type)) {
      rawScore += pointsPerPattern
      correctCount += 1
      feedback.push(`Relationship matched: ${label} (${pattern.type}).`)
    } else {
      // Right classes, wrong relationship type — partial credit, not zero.
      rawScore += pointsPerPattern * 0.4
      feedback.push(
        `Found a relationship between ${label}, but its type was ${match.type || 'unspecified'} instead of the expected ${pattern.type}.`
      )
      suggestions.push(`Change the relationship between ${label} to ${pattern.type}.`)
    }
  })

  const score = Math.round(clamp(rawScore, 0, max))

  return {
    score,
    max,
    feedback,
    strengths:
      correctCount > 0
        ? [`${correctCount} of ${expectedPatterns.length} expected relationship patterns were correctly represented.`]
        : [],
    missed,
    suggestions,
  }
}

function scoreResponsibilities(problem, classes) {
  const max = WEIGHTS.responsibilities
  const minRequired = problem.evaluationCriteria?.minResponsibilitiesPerClass ?? 1
  const namedClasses = classes.filter((c) => c.name)

  if (namedClasses.length === 0) {
    return {
      score: 0,
      max,
      feedback: ['No classes were defined, so responsibilities could not be evaluated.'],
      strengths: [],
      missed: ['No classes were defined.'],
      suggestions: ['Add at least one class and describe what it is responsible for.'],
    }
  }

  const zeroResponsibilityClasses = namedClasses.filter((c) => c.responsibilities.length === 0)
  const meetingMinimum = namedClasses.filter((c) => c.responsibilities.length >= minRequired)
  const coverageRatio = meetingMinimum.length / namedClasses.length

  const totalResponsibilities = namedClasses.reduce((sum, c) => sum + c.responsibilities.length, 0)
  const average = totalResponsibilities / namedClasses.length
  // Conservative "god class" heuristic: only flags a class whose
  // responsibility count is both well above the design's own average
  // AND above an absolute floor, so a design with two evenly-loaded
  // classes never gets flagged just for both having several items.
  const godClassThreshold = Math.max(8, average * 2.5)
  const godClasses =
    namedClasses.length > 1
      ? namedClasses.filter((c) => c.responsibilities.length >= godClassThreshold)
      : []

  let rawScore = coverageRatio * max
  if (godClasses.length > 0) {
    rawScore -= Math.min(3, godClasses.length)
  }

  const score = Math.round(clamp(rawScore, 0, max))

  const feedback = []
  const strengths = []
  const missed = []
  const suggestions = []

  if (zeroResponsibilityClasses.length > 0) {
    const names = zeroResponsibilityClasses.map((c) => c.name).join(', ')
    feedback.push(`Classes with no responsibilities: ${names}.`)
    missed.push(`${zeroResponsibilityClasses.length} class(es) have no responsibilities: ${names}.`)
    suggestions.push('Add responsibilities that describe what each class owns or does.')
  } else {
    feedback.push('Every class has at least one responsibility.')
    strengths.push('Every class has at least one responsibility.')
  }

  if (godClasses.length > 0) {
    const names = godClasses.map((c) => c.name).join(', ')
    const verb = godClasses.length === 1 ? 'has' : 'have'
    feedback.push(
      `${names} ${verb} noticeably more responsibilities than the rest of the design — consider whether some of that belongs in a separate class.`
    )
    suggestions.push(`Review whether ${names} ${godClasses.length === 1 ? 'is' : 'are'} taking on too much.`)
  }

  return { score, max, feedback, strengths, missed, suggestions }
}

function scoreExtensibility(problem, classes, relationships, designExplanation) {
  const max = WEIGHTS.extensibility
  const signalWords = (problem.evaluationCriteria?.extensibilitySignals || []).map((word) =>
    word.toLowerCase()
  )
  const explanationLower = designExplanation.toLowerCase()

  // Signal 1 (0-7): structural evidence in the design itself. This is
  // the primary driver of the score, on purpose — an explanation alone
  // should never be enough.
  const hasInheritance = relationships.some((r) => normalizeName(r.type) === normalizeName('Inheritance'))
  const hasSeparationEvidence = classes.filter((c) => c.name).length >= 3 && relationships.length >= 1

  let structuralScore = 0
  if (hasInheritance) structuralScore = 7
  else if (hasSeparationEvidence) structuralScore = 3

  // Signal 2 (0-5): does the explanation's language match what the
  // structure actually shows? Full credit only when both agree — a
  // keyword with no supporting structure gets limited credit, not zero
  // and not full.
  const mentionsSignalWord = signalWords.some((word) => word && explanationLower.includes(word))
  let corroboratedScore = 0
  if (mentionsSignalWord && structuralScore > 0) corroboratedScore = 5
  else if (mentionsSignalWord) corroboratedScore = 1

  // Signal 3 (0-3): general depth of reasoning, independent of any
  // specific keyword — rewards a substantive explanation even when it
  // doesn't happen to use one of the problem's listed signal words.
  const wordCount = designExplanation.split(/\s+/).filter(Boolean).length
  const reasoningScore = wordCount >= 30 ? 3 : wordCount >= 15 ? 1 : 0

  const score = Math.round(clamp(structuralScore + corroboratedScore + reasoningScore, 0, max))

  const feedback = []
  const strengths = []
  const missed = []
  const suggestions = []

  if (hasInheritance) {
    feedback.push('The design uses an Inheritance relationship, which supports extending it later.')
    strengths.push('Inheritance separates variants of a concept, supporting future extension.')
  } else if (hasSeparationEvidence) {
    feedback.push('The design shows some separation of concerns, though no inheritance or shared abstraction was used.')
  } else {
    feedback.push('No structural evidence of extensibility (such as inheritance or a shared abstraction) was found.')
    missed.push('The design has no structural evidence of extensibility.')
    suggestions.push('Consider using inheritance or a shared abstraction for classes that represent variants of the same concept.')
  }

  if (mentionsSignalWord && structuralScore === 0) {
    feedback.push('Your explanation describes extensibility, but the design does not show a corresponding abstraction or relationship.')
    suggestions.push('Back up your explanation with a matching class or relationship in the design.')
  } else if (mentionsSignalWord && structuralScore > 0) {
    feedback.push('The explanation is corroborated by matching structure in the design.')
    strengths.push('Explanation and design structure agree on how the design supports extensibility.')
  }

  if (reasoningScore === 0) {
    missed.push('The explanation does not say enough about how the design could be extended.')
  }

  return { score, max, feedback, strengths, missed, suggestions }
}

function scoreDesignExplanation(designExplanation) {
  const max = WEIGHTS.designExplanation
  const words = designExplanation.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  if (wordCount === 0) {
    return {
      score: 0,
      max,
      feedback: ['No design explanation was provided.'],
      strengths: [],
      missed: ['No design explanation was provided.'],
      suggestions: ['Add a design explanation describing your key decisions.'],
    }
  }

  const feedback = []
  const strengths = []
  const missed = []
  const suggestions = []
  let score = 0

  if (wordCount >= 15) {
    score += 3
  } else {
    feedback.push('The explanation is quite short — add more detail about why you structured the design this way.')
    suggestions.push('Expand your explanation to at least a few sentences.')
  }

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()))
  const uniqueRatio = uniqueWords.size / wordCount
  if (wordCount >= 50 && uniqueRatio >= 0.35) {
    score += 3
    strengths.push('The explanation is detailed.')
  } else if (wordCount >= 50) {
    feedback.push('This explanation looks repetitive rather than descriptive — expand with real reasoning instead of repeated phrases.')
  } else {
    feedback.push('Add more depth to your explanation — describe the reasoning behind your key decisions.')
  }

  const lower = designExplanation.toLowerCase()

  const reasoningIndicators = ['because', 'since', 'so that', 'in order to', 'chose', 'decided', 'reason']
  if (reasoningIndicators.some((word) => lower.includes(word))) {
    score += 2
    strengths.push('The explanation gives reasons behind design decisions.')
  } else {
    feedback.push('Explanation needs more reasoning about why specific decisions were made.')
    missed.push('The explanation does not explain the reasoning behind design decisions.')
  }

  const tradeoffIndicators = ['trade-off', 'tradeoff', 'however', 'instead of', 'alternative', 'downside', 'limitation']
  if (tradeoffIndicators.some((word) => lower.includes(word))) {
    score += 2
    strengths.push('The explanation acknowledges trade-offs or alternatives.')
  } else {
    feedback.push('Consider mentioning trade-offs or alternatives you considered.')
    missed.push('Trade-offs are missing from the explanation.')
  }

  return { score: Math.round(clamp(score, 0, max)), max, feedback, strengths, missed, suggestions }
}

function scoreCompleteness(classes, relationships, designExplanation) {
  const max = WEIGHTS.completeness
  const namedClasses = classes.filter((c) => c.name)

  const missed = []
  const suggestions = []
  let score = 0

  if (classes.length > 0) {
    score += 2
  } else {
    missed.push('No classes were defined.')
    suggestions.push('Start by adding at least one class to your design.')
  }

  if (classes.length > 0 && namedClasses.length === classes.length) {
    score += 2
  } else if (classes.length > 0) {
    missed.push('Some classes are missing a name.')
    suggestions.push('Give every class a clear, descriptive name.')
  }

  const hasAnyResponsibilities = namedClasses.some((c) => c.responsibilities.length > 0)
  if (hasAnyResponsibilities) {
    score += 1.5
  } else if (namedClasses.length > 0) {
    missed.push('No class has any responsibilities defined.')
  }

  const hasAnyFieldsOrMethods = namedClasses.some((c) => c.fields.length > 0 || c.methods.length > 0)
  if (hasAnyFieldsOrMethods) {
    score += 1.5
  } else if (namedClasses.length > 0) {
    missed.push('No class has any fields or methods defined.')
    suggestions.push('Add a few key fields or methods to at least your core classes.')
  }

  if (namedClasses.length < 2) {
    // Not reasonable to expect relationships yet with fewer than 2 classes.
    score += 2
  } else if (relationships.length > 0) {
    score += 2
  } else {
    missed.push('No relationships were defined between the classes in the design.')
    suggestions.push('Define at least one relationship between your classes.')
  }

  if (designExplanation.length > 0) {
    score += 1
  } else {
    missed.push('No design explanation was provided.')
  }

  const strengths = missed.length === 0 ? ['The submission is structurally complete.'] : []

  return { score: Math.round(clamp(score, 0, max)), max, feedback: [], strengths, missed, suggestions }
}

// ---------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------

export function evaluateDesign(problem, submission) {
  if (!problem || !problem.evaluationCriteria) {
    const categoryScores = {
      coreEntities: emptyCategory(WEIGHTS.coreEntities),
      relationships: emptyCategory(WEIGHTS.relationships),
      responsibilities: emptyCategory(WEIGHTS.responsibilities),
      extensibility: emptyCategory(WEIGHTS.extensibility),
      designExplanation: emptyCategory(WEIGHTS.designExplanation),
      completeness: emptyCategory(WEIGHTS.completeness),
    }
    return {
      score: 0,
      categoryScores,
      strengths: [],
      missedConsiderations: ['This problem has no evaluation criteria configured.'],
      suggestions: [],
    }
  }

  const { classes, relationships, designExplanation, invalidRelationshipCount } = sanitizeSubmission(submission)

  const coreEntities = scoreCoreEntities(problem, classes)
  const relationshipsScore = scoreRelationships(problem, classes, relationships)

  if (invalidRelationshipCount > 0) {
    relationshipsScore.feedback.push(
      `${invalidRelationshipCount} relationship(s) referenced a class that no longer exists and were ignored.`
    )
  }

  const responsibilities = scoreResponsibilities(problem, classes)
  const extensibility = scoreExtensibility(problem, classes, relationships, designExplanation)
  const designExplanationScore = scoreDesignExplanation(designExplanation)
  const completeness = scoreCompleteness(classes, relationships, designExplanation)

  const categoryScores = {
    coreEntities,
    relationships: relationshipsScore,
    responsibilities,
    extensibility,
    designExplanation: designExplanationScore,
    completeness,
  }

  const categories = Object.values(categoryScores)
  // The total is literally the sum of the (already clamped) category
  // scores — never recomputed independently — so "total equals the sum
  // of category scores" holds by construction, not by coincidence.
  const score = clamp(
    categories.reduce((sum, category) => sum + category.score, 0),
    0,
    100
  )

  return {
    score,
    categoryScores,
    strengths: dedupe(categories.flatMap((category) => category.strengths)),
    missedConsiderations: dedupe(categories.flatMap((category) => category.missed)),
    suggestions: dedupe(categories.flatMap((category) => category.suggestions)),
  }
}
